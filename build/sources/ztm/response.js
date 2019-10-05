import { mapObject } from '../../utils/functional';
import { noCorsFetch } from '../../utils/network';
import { STOPS_API } from './config';
import { delayUrl, toDate, toTime } from './utils';
function filterStopsResponse(obj) {
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return Object.keys(obj)
        .filter(k => +new Date(k) >= +now)
        .reduce((acc, k) => (Object.assign(Object.assign({}, acc), { [k]: obj[k] })), {});
}
function toStopsModel(obj) {
    obj = filterStopsResponse(obj);
    const keys = Object.keys(obj);
    if (keys.length === 0) {
        return {
            lastUpdate: new Date(),
            stops: {}
        };
    }
    const lastUpdate = keys
        .map(k => obj[k].lastUpdate)
        .map(d => new Date(d))
        .sort((a, b) => +b - +a)[0];
    const stops = mapObject(obj, (item) => item.stops
        .filter(s => !s.virtual)
        .map(s => ({
        name: `${s.stopName} ${s.subName}`,
        onDemand: s.onDemand === 1,
        stopId: s.stopId,
        zoneId: s.zoneId,
        latitude: s.stopLat,
        longitude: s.stopLon
    })));
    return {
        lastUpdate,
        stops
    };
}
export async function getStopsModel() {
    const response = await fetch(STOPS_API);
    const json = await response.json();
    return toStopsModel(json);
}
export function compressStopsModel(obj) {
    return {
        lu: obj.lastUpdate.toISOString(),
        s: mapObject(obj.stops, stops => stops.map(s => ({
            id: s.stopId,
            z: s.zoneId,
            n: s.name,
            d: s.onDemand ? 1 : 0,
            lt: s.latitude,
            ln: s.longitude
        })))
    };
}
export function decompressStopsModel(obj) {
    return {
        lastUpdate: new Date(obj.lu),
        stops: mapObject(obj.s, stops => stops
            .map(s => ({
            stopId: s.id,
            zoneId: s.z,
            onDemand: s.d === 1,
            name: s.n,
            latitude: s.lt,
            longitude: s.ln
        })))
    };
}
export async function getDelaysModel(stopId) {
    const url = delayUrl(stopId);
    const response = await noCorsFetch(url);
    const data = await response.json();
    return {
        lastUpdate: toDate(data.lastUpdate),
        data: data.delay
            .map(d => ({
            seconds: d.delayInSeconds,
            estimated: toTime(d.estimatedTime),
            theoretical: toTime(d.theoreticalTime),
            routeId: d.routeId
        }))
    };
}
//# sourceMappingURL=response.js.map