import { Distance } from "./model";

export default function(radius: number) {
    return function <T extends Distance> (items: T[]): T[] {
        return items
            .filter(item => item.distance <= radius);
    }
}