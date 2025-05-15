export function formatDate(date: Date): string {
    const creationDate: Date = new Date(date)
    return creationDate.toLocaleDateString('pt-BR', { timeZone: 'UTC'})
}

export function handleUriPath(path: string | undefined): string {
    return `http://192.168.15.17:8080${path}`;
}

export const uriPathServer = "http://192.168.15.17:8080";