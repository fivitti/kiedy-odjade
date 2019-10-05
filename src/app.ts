import { Delay, isCache, ISource, Stop, ZtmSource } from './sources';
import * as distance from './utils/distance';
import { formatDistance, formatTime, formatTimespan } from './utils/format';
import { getCurrentPosition, Coordinates } from './utils/geo';
import { allInRadiusOrTopNearestStartegy } from "./select-strategies";

interface StopAndDistance extends Stop {
    distance: number
}

interface StopDistanceDelay extends StopAndDistance {
    delays: Delay[]
}

type RenderData = ErrorRenderData | StopsRenderData;

function isErrorRenderData(data: RenderData): data is ErrorRenderData {
    return (data as ErrorRenderData).error != null;
}

interface ErrorRenderData {
    error: Error
}

interface StopsRenderData {
    lastUpdate: Date,
    stopData: StopDistanceDelay[]
}

export default class App {
    private currentData: RenderData = {
        lastUpdate: null,
        stopData: []
    };
    //private source: ISource = new LocalSource();
    private source: ISource = new ZtmSource();
    private stopsSelector = allInRadiusOrTopNearestStartegy(300, 5);

    constructor(private rootId: string) {

    }

    public async init(): Promise<void> {
    }

    private async getNearestStops(stops: Stop[], currentPosition: Coordinates): Promise<StopAndDistance[]> {
        const distances = stops.map(s => distance.spherical(currentPosition, s));

        const distancedStops = stops
            .map((stop, idx) => ({ ...stop, distance: distances[idx] }));

        const nearestStops = this.stopsSelector(distancedStops);

        return nearestStops.sort((a, b) => a.distance - b.distance);
    }

    public async redraw() {
        this.renderLoader();

        await this.refresh();
        await this.render();
    }

    private async refresh() {
        try {
            const currentPosition = await getCurrentPosition();
            const stops = await this.source.getStops();
            const nearest = await this.getNearestStops(stops.data, currentPosition);
            const delays = await Promise.all(nearest
                .map(s => this.source.getDelays(s.stopId)));
            delays.forEach(d => d.data
                .sort((a, b) => +a.estimated - +b.estimated));
            this.currentData = {
                stopData: nearest
                    .map((n, idx) => ({ ...n, delays: delays[idx].data })),
                lastUpdate: stops.lastUpdate
            };
        }
        catch (e) {
            this.currentData = {
                error: e
            }
        }
    }

    private renderLoader() {
        const rootElement = document.getElementById(this.rootId);
        const loaderTemplate = document.getElementById("loader-template") as HTMLTemplateElement;
        const loader = document.importNode(loaderTemplate.content, true);

        rootElement.innerHTML = '';
        rootElement.appendChild(loader);
    }

    private render() {
        const rootElement = document.getElementById(this.rootId);
        rootElement.innerHTML = '';

        if (isErrorRenderData(this.currentData)) {
            const errorTemplate = document.getElementById("error-template") as HTMLTemplateElement;
            const errorElement = document.importNode(errorTemplate.content, true);
            const titleElement = errorElement.querySelector(".title");
            const messageElement = errorElement.querySelector(".message");
            const stackElement = errorElement.querySelector(".stack");
            const retryButton = errorElement.querySelector(".retry") as HTMLButtonElement;

            const error = this.currentData.error;
            if (error.name === "PositionError" || error.constructor.name === "PositionError") {
                titleElement.textContent = "Brak dostępu do lokalizacji";
                messageElement.textContent = "Ta aplikacja do działania musi wiedzieć, gdzie jesteś. " +
                    "Wszakże chodzi o to, aby pokazać najbliższe Tobie przystanki. " +
                    "Odśwież stronę i tym razem zaakceptuj prośbę o użycie Twojego położenia." +
                    "\n" +
                    "Jeżeli nie widzisz, żadnego komunikatu sprawdź ustawienia uprawnień Twojej przeglądarki. " +
                    "Prawdopodobnie nie pozwoliłeś jej na dostęp do Twoich współrzędnych."
            } else {
                titleElement.textContent = `${error.name} (${error.constructor.name}) [${error}]`;
                messageElement.textContent = "Poniżej trochę nerdowskiego bełkotu. " + error.message;
                stackElement.textContent = error.stack;
            }

            retryButton.onclick = () => this.redraw();
            rootElement.appendChild(errorElement);
            return;
        }

        const stopTemplate = document.getElementById("stop-template") as HTMLTemplateElement;
        const delayRowTemplate = document.getElementById("delay-row") as HTMLTemplateElement;

        const now = new Date();

        const stopsLastUpdateElement = document.querySelector("#stop-last-update");
        const stopLastUpdateStr = this.currentData.lastUpdate.toLocaleString();
        const stopLastUpdateAgo = formatTimespan(+now - +this.currentData.lastUpdate, 'days');
        stopsLastUpdateElement.textContent = `${stopLastUpdateStr} (${stopLastUpdateAgo})`;

        const source = this.source;
        if (isCache(source)) {
            const refreshButton = document.querySelector(".stop-update") as HTMLButtonElement;
            refreshButton.onclick = () => {
                this.renderLoader();
                source.refresh()
                    .then(() => this.redraw());
            }

            refreshButton.classList.remove("invisible");
        }

        for (let stop of this.currentData.stopData) {
            const stopElement = document.importNode(stopTemplate.content, true);
            const stopNameElement = stopElement.querySelector(".stop-name");
            const stopDistanceElement = stopElement.querySelector(".stop-distance");

            stopNameElement.textContent = stop.name;
            stopDistanceElement.textContent = formatDistance(stop.distance);

            const tbodyElement = stopElement.querySelector("tbody");

            for (let delay of stop.delays) {
                const rowElement = document.importNode(delayRowTemplate.content, true);
                const lineNoElement = rowElement.querySelector(".line-no");
                const lineEstimatedElement = rowElement.querySelector(".line-estimated");
                const lineToArriveElement = rowElement.querySelector(".line-to-arrive");

                lineNoElement.textContent = delay.routeId.toString();
                lineToArriveElement.textContent = formatTimespan(+delay.estimated - +now);
                lineEstimatedElement.textContent = formatTime(delay.estimated);
                tbodyElement.appendChild(rowElement);
            }

            rootElement.appendChild(stopElement);
        }
    }
}