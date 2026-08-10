/**
 * Get a date string from a Date object or a string
 * @param date
 */
export default function getDateString(date: Date | string) {
    if (typeof date === 'string') {
        return date;
    }

    // Don't use toISOString() as it may return a different day depending on the timezone
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}
