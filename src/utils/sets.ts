export function difference<T>(setA: Set<T>, setB: Set<T>) {
    let _difference = new Set(setA)
    setB.forEach((elem) => {
        _difference.delete(elem)
    });
    return _difference
}