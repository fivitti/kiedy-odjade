import { DELAY_API } from './config';
export function toDate(raw) {
    return new Date(raw);
}
export function toTime(raw) {
    const today = new Date();
    const [hours, minutes] = raw.split(":");
    today.setMilliseconds(0);
    today.setSeconds(0);
    today.setMinutes(parseInt(minutes, 10));
    today.setHours(parseInt(hours, 10));
    return today;
}
export function delayUrl(stopId) {
    return DELAY_API.replace("{stopId}", stopId.toString());
}
export function getDateKey(day) {
    const dateString = day.toISOString().slice(0, 10);
    return dateString;
}
//# sourceMappingURL=utils.js.map