export enum CoordinateSystem {
    WGS84 = 4326
}

export interface Coordinates {
    latitude: number,
    longitude: number
    coordinateSystem: CoordinateSystem
}

export function getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({
                coordinateSystem: CoordinateSystem.WGS84,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        }, reject);
    })
}

export function registerPostionWatch(onChange: (coords: Coordinates) => void): () => void {
    const handler = navigator.geolocation.watchPosition(c => onChange({
        coordinateSystem: CoordinateSystem.WGS84,
        latitude: c.coords.latitude,
        longitude: c.coords.longitude
    }));
    return () => navigator.geolocation.clearWatch(handler);
}
