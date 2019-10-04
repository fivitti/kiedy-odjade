export function addSeconds(date: Date, seconds: number): Date {
    const newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
}