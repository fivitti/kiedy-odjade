import { Coordinates, CoordinateSystem } from "../geo";

export default function(first: Coordinates, second: Coordinates): number {
    if (first.coordinateSystem !== CoordinateSystem.WGS84 ||
        second.coordinateSystem !== CoordinateSystem.WGS84) {
            throw new Error("Required WGS84 coordinate system");
        }

    return distance(first.latitude, first.longitude,
                    second.latitude, second.longitude);
}

// Source: https://stackoverflow.com/a/21623206
function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    const d = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    return d * 1000; // meters
}