export function timeToTimestamp(time: string) {
    const now = new Date();

    const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(now);

    const timestamp = new Date(`${date}T${time}-03:00`);

    if (isNaN(timestamp.getTime())) {
        throw new Error('INVALID_TIME');
    }

    return {
        seconds: Math.floor(timestamp.getTime() / 1000)
    };
}