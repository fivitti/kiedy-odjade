export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return meters.toFixed() + "m";
    } else {
        return (meters / 1000).toFixed(1) + "km";
    }
}

export function formatTime(date: Date): string {
    return date.toLocaleTimeString().slice(0, -3);
}

export function formatDate(date: Date) {
    return date.toLocaleDateString();
}

export function formatTimespan(totalMilliseconds: number, precision: 'days' | 'minutes' = 'minutes'): string {
    //const isMinus = totalMilliseconds < 0;
    totalMilliseconds = Math.abs(totalMilliseconds);
    const totalSeconds = Math.trunc(totalMilliseconds / 1000);
    const totalMinutes = Math.trunc(totalSeconds / 60);

    if (precision === 'minutes') {
        if (totalMinutes <= 0) {
            return "< 1 min";
        }
        return `${totalMinutes} min`;
    }

    const totalHours = Math.trunc(totalMinutes / 60);
    const totalDays = Math.trunc(totalHours / 24);

    if (totalDays !== 0) {
        return totalDays + " d";
    }
    if (totalHours === 0) {
        return "< 1 h";
    }
    return totalHours + " h";
}