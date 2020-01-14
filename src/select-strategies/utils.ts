import { Selector } from "./model";
import { Coordinates } from "../utils/geo";
import { spherical } from "../utils/distance";

export function applySelectorFromPoint<T extends Coordinates>(selector: Selector, center: Coordinates, items: T[]): T[] {
    return selector(items.map(item => ({
        item,
        distance: spherical(center, item)
    }))).map(res => res.item);
}