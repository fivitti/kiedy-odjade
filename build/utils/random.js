export function randInt(minOrMax, max) {
    const min = max != null ? minOrMax : 0;
    max = max == null ? minOrMax : max;
    const base = Math.random();
    const scaled = base * (max - min);
    const truncated = Math.trunc(scaled);
    const shifted = truncated + min;
    return shifted;
}
//# sourceMappingURL=random.js.map