export function fetchData<T>(url: string, config = {}): Promise<T> { // tslint:disable-line
    return fetch(url, config)
        .then(sjekkStatuskode)
        .then(toJson);
}

export function sjekkStatuskode(response: Response) {
    if (
        response.status >= 200 &&
        response.status < 300 &&
        response.ok &&
        !response.redirected
    ) {
        return response;
    }
    throw new Error(response.statusText || response.type);
}

export function toJson(response: Response) {
    if (response.status !== 204) {
        // No content
        return response.json();
    }
    return response;
}