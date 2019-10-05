import { DELAY_API } from './config';
import { parseDate } from '../../utils/dates';

export function toTime(raw: string): Date {
    const today = new Date();
    const hourDate = parseDate(raw, "%h:%m");

    today.setMilliseconds(0);
    today.setSeconds(0);
    today.setMinutes(hourDate.getMinutes());
    today.setHours(hourDate.getHours());

    return today;
}

export function delayUrl(stopId: number): string {
    return DELAY_API.replace("{stopId}", stopId.toString());
}

export function getDateKey(day: Date): string {
    const dateString = day.toISOString().slice(0, 10);
    return dateString;
}