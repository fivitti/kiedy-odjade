export function zip(a, b) {
    return a.map((item, idx) => [item, b[idx]]);
}
export function mapObject(obj, map) {
    return Object.keys(obj)
        .map(key => ({
        key,
        value: map(obj[key])
    }))
        .reduce((acc, v) => (Object.assign(Object.assign({}, acc), { [v.key]: v.value })), {});
}
//# sourceMappingURL=functional.js.map