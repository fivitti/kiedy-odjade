import { DELAY_API } from "./config";

export function toDate(raw: string): Date {
    return new Date(raw);
}

export function toTime(raw: string): Date {
    const today = new Date();
    const [hours, minutes] = raw.split(":");

    today.setMilliseconds(0);
    today.setSeconds(0);
    today.setMinutes(parseInt(minutes, 10));
    today.setHours(parseInt(hours, 10));
    
    return today;
}

export function delayUrl(stopId: number): string {
    return DELAY_API.replace("{stopId}", stopId.toString());
}

export function getDateKey(day: Date): string {
    const dateString = day.toISOString().slice(0, 10);
    return dateString;
}