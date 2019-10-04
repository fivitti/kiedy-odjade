export function randInt(max: number): number;
export function randInt(min: number, max: number): number;
export function randInt(minOrMax: number, max?: number): number {
    const min = max != null ? minOrMax : 0;
    max = max == null ? minOrMax : max;

    const base = Math.random();
    const scaled = base * (max - min);
    const truncated = Math.trunc(scaled);
    const shifted = truncated + min;
    return shifted;
}