export function zip<T1, T2>(a: T1[], b: T2[]): [T1, T2][] {
    return a.map((item, idx) => [item, b[idx]]);
}

export function mapObject<TIn, TOut>(obj: Record<string, TIn>, map: (item: TIn) => TOut): Record<string, TOut> {
    return Object.keys(obj)
        .map(key => ({
            key,
            value: map(obj[key])
        }))
        .reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {});
}