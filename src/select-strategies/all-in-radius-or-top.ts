import allInRadiusStrategy from './all-in-radius';;
import topNearestStrategy from "./top-nearest";
import { Distance } from './model';

export default function (radius: number, limit: number) {
    return function <T extends Distance>(items: T[]): T[] {
        const allInRadiusSelector = allInRadiusStrategy(radius);
        const allInRadius = allInRadiusSelector(items);
        if (allInRadius.length >= limit) {
            return allInRadius;
        }
        const topNearestSelector = topNearestStrategy(limit - allInRadius.length);
        const rest = items.filter(item => allInRadius.indexOf(item) === -1);
        const topNearest = topNearestSelector(rest);
        return allInRadius.concat(topNearest);
    }
}