export function formatDistance(meters) {
    if (meters < 1000) {
        return meters.toFixed() + "m";
    }
    else {
        return (meters / 1000).toFixed(1) + "km";
    }
}
export function formatTime(date) {
    return date.toLocaleTimeString().slice(0, -3);
}
export function formatDate(date) {
    return date.toLocaleDateString();
}
export function formatTimespan(totalMiliseconds, precision = 'minutes') {
    const totalSeconds = Math.trunc(totalMiliseconds / 1000);
    const totalMinutes = Math.trunc(totalSeconds / 60);
    if (precision === 'minutes') {
        if (totalMinutes === 0) {
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
//# sourceMappingURL=format.js.map