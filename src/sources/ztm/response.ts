import { Delay, Timestamp } from '..';
import { mapObject } from '../../utils/functional';
import { noCorsFetch } from '../../utils/network';
import { STOPS_API } from './config';
import { delayUrl, toDate, toTime } from './utils';

type DelayModel = Timestamp<Delay[]>;

interface StopResponse {
    stopId: number,
    stopCode: string,
    stopName: string,
    stopShortName: string,
    subName: string,
    date: string,
    zoneId: number,
    zoneName: string,
    virtual: number,
    nonpassenger: number,
    depot: number,
    ticketZoneBorder: number
    onDemand: number,
    activationDate: string,
    stopLat: number,
    stopLon: number,
    stopUrl: string,
    locationType: unknown,
    parentStation: unknown,
    stopTimezone: string,
    wheelchairBoarding: unknown
}

interface StopsResponseEntry {
    lastUpdate: string;
    stops: StopResponse[];

}

interface StopsResponse {
    [key: string]: StopsResponseEntry
}

export interface CompressStopsModel {
    lu: string,
    s: Record<string, CompressStopModel[]>;
}

export interface StopsModel {
    lastUpdate: Date,
    stops: Record<string, StopModel[]>
}

interface CompressStopModel {
    id: number,
    n: string,
    z: number,
    d: number,
    lt: number,
    ln: number
}

export interface StopModel {
    stopId: number,
    name: string,
    zoneId: number,
    onDemand: boolean,
    latitude: number,
    longitude: number,
}

interface DelayResponse {
    lastUpdate: string,
    delay: [
        {
            id: string,
            delayInSeconds: number,
            estimatedTime: string,
            headsign: string,
            routeId: number,
            tripId: number,
            status: string,
            theoreticalTime: string,
            timestamp: string,
            trip: number,
            vehicleCode: number,
            vehicleId: number
        }
    ]
}

function filterStopsResponse(obj: StopsResponse): StopsResponse {
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return Object.keys(obj)
        .filter(k => +new Date(k) >= +now)
        .reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {});
}

function toStopsModel(obj: StopsResponse): StopsModel {
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

    const stops = mapObject(obj,
        (item) => item.stops
            .filter(s => !s.virtual)
            .map<StopModel>(s => ({
                name: `${s.stopName} ${s.subName}`,
                onDemand: s.onDemand === 1,
                stopId: s.stopId,
                zoneId: s.zoneId,
                latitude: s.stopLat,
                longitude: s.stopLon
            }))
    );

    return {
        lastUpdate,
        stops
    };

}

export async function getStopsModel(): Promise<StopsModel> {
    const response = await fetch(STOPS_API);
    const json: StopsResponse = await response.json();
    return toStopsModel(json);
}

export function compressStopsModel(obj: StopsModel): CompressStopsModel {
    return {
        lu: obj.lastUpdate.toISOString(),
        s: mapObject<StopModel[], CompressStopModel[]>(obj.stops, stops =>
            stops.map(s => ({
                id: s.stopId,
                z: s.zoneId,
                n: s.name,
                d: s.onDemand ? 1 : 0,
                lt: s.latitude,
                ln: s.longitude
            }))
        )
    }
}

export function decompressStopsModel(obj: CompressStopsModel): StopsModel {
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

export async function getDelaysModel(stopId: number): Promise<DelayModel> {
    const url = delayUrl(stopId);
    const response = await noCorsFetch(url);
    const data = await response.json() as DelayResponse;
    return {
        lastUpdate: toDate(data.lastUpdate),
        data: data.delay
            .map(d => ({
                seconds: d.delayInSeconds,
                estimated: toTime(d.estimatedTime),
                theoretical: toTime(d.theoreticalTime),
                routeId: d.routeId
            }) as Delay)
    };
}