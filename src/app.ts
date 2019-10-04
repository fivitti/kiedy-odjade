import { getCurrentPosition } from "./utils/geo";
import { formatDistance, formatTime, formatTimespan, formatDate } from "./utils/format";
import * as distance from "./utils/distance";
import { ISource, LocalSource, Stop, Delay, ZtmSource, ICache, isCache } from "./sources";

interface StopAndDistance extends Stop {
    distance: number
}

interface StopDistanceDelay extends StopAndDistance {
    delays: Delay[]
}

export default class App
{
    private currentData: {
        lastUpdate: Date,
        stopData: StopDistanceDelay[] 
    } = {
        lastUpdate: null,
        stopData: []
    };
    //private source: ISource = new LocalSource();
    private source: ISource = new ZtmSource();

    constructor(private rootId: string) {

    }

    public async init(): Promise<void> {
        
    }

    private async getNearestStops(stops: Stop[]): Promise<StopAndDistance[]> {
        const currentPosition = await getCurrentPosition();
        const distances = stops.map(s => distance.spherical(currentPosition, s));

        return stops
            .map((stop, idx) => ({ ...stop, distance: distances[idx] }))
            .sort((a, b) => a.distance - b.distance);
    }

    public async refresh() {
        const stops = await this.source.getStops();
        const nearest = await this.getNearestStops(stops.data);
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

    public render() {
        const rootElement = document.getElementById(this.rootId);
        const stopTemplate = document.getElementById("stop-template") as HTMLTemplateElement;
        const delayRowTemplate = document.getElementById("delay-row") as HTMLTemplateElement;
        
        const now = new Date();

        const stopsLastUpdateElement = document.querySelector("#stop-last-update");
        const stopLastUpdateStr = this.currentData.lastUpdate.toLocaleString();
        const stopLastUpdateAgo = formatTimespan(+now - +this.currentData.lastUpdate, 'days');
        stopsLastUpdateElement.textContent = `${stopLastUpdateStr} (${stopLastUpdateAgo})`;

        const source = this.source;
        if (isCache(source)) {
            const refreshContainerElement = document.querySelector("#stop-update");
            const button = document.createElement('button');
            button.classList.add("btn-small");
            button.textContent = "Refresh";
            button.onclick = () => source.refresh();
            refreshContainerElement.appendChild(button);
        }

        rootElement.innerHTML = '';

        for (let stop of this.currentData.stopData) {        
            const stopElement = document.importNode(stopTemplate.content, true);
            const stopNameElement = stopElement.querySelector(".stop-name");
            const stopDistanceElement = stopElement.querySelector(".stop-distance");

            stopNameElement.textContent = stop.name;
            stopDistanceElement.textContent = formatDistance(stop.distance);

            const tbodyElement = stopElement.querySelector("tbody");

            for (let delay of stop.delays)
            {
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