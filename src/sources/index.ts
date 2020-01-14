import { Coordinates } from '../utils/geo';
import LocalSource from './local';
import ZtmSource from './ztm';

export interface Stop extends Coordinates {
    stopId: number,
    name: string
}

export interface Delay {
    routeId: number,
    seconds: number,
    estimated: Date,
    theoretical: Date,
    headsign: string
}

export interface Vehicle extends Coordinates {
    line: string,
    vehicleId: number,
    speed: number,
    delay: number,
    gpsQuality: number
}

export interface Timestamp<T> {
    lastUpdate: Date,
    data: T
}

export interface ISource {
    getStops(day?: Date): Promise<Timestamp<Stop[]>>;
    getDelays(stopId: number): Promise<Timestamp<Delay[]>>;
    getLive(): Promise<Timestamp<Vehicle[]>>;
}

export interface ICache {
    refresh(): Promise<void>;
}

export function isCache(source: ISource): source is ICache & ISource {
    return (source as any as ICache).refresh !== undefined;
}

export {
    ZtmSource,
    LocalSource
}