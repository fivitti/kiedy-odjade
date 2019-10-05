export function addSeconds(date, seconds) {
    const newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
}
//# sourceMappingURL=dates.js.map