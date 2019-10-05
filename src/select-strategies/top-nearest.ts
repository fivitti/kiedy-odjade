import { Distance } from "./model";

export default function (limit: number) {
    return function <T extends Distance>(items: T[]): T[] {
        return items
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
    }
}