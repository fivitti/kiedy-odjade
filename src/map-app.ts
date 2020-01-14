/// <reference path="../node_modules/@types/leaflet/index.d.ts" />
import { getCurrentPosition, Coordinates, CoordinateSystem, toLeafletOrder, hasGeolocationPermission } from "./utils/geo";
import { ISource, ZtmSource, LocalSource } from "./sources";
import { GOLD, STOP } from "./utils/leaflet/markers";
import { allInRadiusOrTopNearestStartegy } from "./select-strategies";
import { applySelectorFromPoint } from "./select-strategies/utils";
import { difference } from "./utils/sets";
import { formatTimespan } from "./utils/format";
import ForegroundTimer from "./foreground-timer";
import { isPageVisibilityApiSupported } from "./utils/pagevisibility";
import { angleMarker, AngleMarker } from "./utils/leaflet/marker-direction";

export default class App {
    private selector = allInRadiusOrTopNearestStartegy(300, 5);
    private autoRefresh = new ForegroundTimer(60 * 1000, () => this.redraw());
    private isAutoRefreshSupported = isPageVisibilityApiSupported();
    //private source: ISource = new LocalSource();
    private source: ISource = new ZtmSource();
    private map: L.Map = null;
    private markers: Record<string, L.Marker> = {};
    private userMarker: AngleMarker = null;
    private addedStops: Set<number> = new Set();
    private previousPosition: L.LatLng = null;

    constructor(private containerId: string) { 
        this.onLocationFound = this.onLocationFound.bind(this);
    }

    public async init(): Promise<void> {
        let position: Coordinates = {
            coordinateSystem: CoordinateSystem.WGS84,
            latitude: 54.366666666667,
            longitude: 18.633333333333
        };
        let permissionGranted = false;
        try {
            position = await getCurrentPosition();
            permissionGranted = true;
        } catch { }

        const container = document.getElementById(this.containerId);
        container.innerHTML = "";

        const map = L.map(container)
        map.setView(toLeafletOrder(position), 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        if (permissionGranted) {
            //this.userMarker = L.marker(toLeafletOrder(position), { icon: GOLD });
            this.userMarker = angleMarker(L.latLng(position.latitude, position.longitude), { 
                labelFlag: false,
                img: "markers/arrow.png"
            });
            this.userMarker.addTo(map);
            this.userMarker.bindPopup("Twoja pozycja");

            this.previousPosition = L.latLng(position.latitude, position.longitude);
            map.on('locationfound', this.onLocationFound);
            map.locate({setView: false, watch: true, maxZoom: 20});
        }
        this.map = map;
    }

    private onLocationFound(e: L.LocationEvent) {
        const angle = this.userMarker.getAngle(this.previousPosition, e.latlng);
        this.userMarker.setHeading(angle);
        this.previousPosition = e.latlng;
        console.count("New position");
    }

    public async redraw(): Promise<void> {
        this.autoRefresh.close();
        const permissionGranted = this.userMarker != null;
        const center = this.map.getCenter();
        const position = permissionGranted ? await getCurrentPosition() : ({ coordinateSystem: CoordinateSystem.WGS84, latitude: center.lat, longitude: center.lng });
        const live = await this.source.getLive();
        const stopSet = await this.source.getStops();

        let vehicles = live.data;
        let stops = stopSet.data;

        vehicles = applySelectorFromPoint(this.selector, position, vehicles);
        stops = applySelectorFromPoint(this.selector, position, stops);

        const markersToDelete = difference(new Set(Object.keys(this.markers)), new Set(vehicles.map(v => v.vehicleId + "")));
        for (const vehicle of vehicles) {
            const coordinates = toLeafletOrder(vehicle);

            const delayType = vehicle.delay > 0 ? "opóźnienie" : "przyspieszenie";
            const popupContent = `Linia: ${vehicle.line}, prędkość: ${vehicle.speed}km/h, ${delayType}: ${formatTimespan(vehicle.delay)}`;

            if (vehicle.vehicleId in this.markers) {
                const marker = this.markers[vehicle.vehicleId];
                marker.setLatLng(coordinates);
                marker.setPopupContent(popupContent);
            } else {
                const marker = L.marker(coordinates);
                this.markers[vehicle.vehicleId] = marker;
                marker.bindPopup(popupContent);
                marker.bindTooltip(vehicle.line, { permanent: true });
                marker.addTo(this.map);
            }
        }
        markersToDelete.forEach(m => {
            const marker = this.markers[m];
            marker.remove();
            delete this.markers[m];
        });

        for (let stop of stops.filter(s => !this.addedStops.has(s.stopId))) {
            const marker = L.marker(toLeafletOrder(stop), {
                icon: STOP
            });
            marker.addTo(this.map);
            marker.bindPopup(`${stop.name}`);
            marker.bindTooltip(stop.name, { permanent: true, });
        }

        this.autoRefresh.run();
    }
}