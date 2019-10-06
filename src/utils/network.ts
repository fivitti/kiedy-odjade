export async function noCorsFetch(url: string): Promise<Response> {
    const proxyUrl = "https://cors.figiel.xyz/" + url;
    const res = await fetch(proxyUrl, {
        headers: {
            "x-requested-with": window.location.origin
        }
    });
    if (res.ok) {
        return res;
    } else {
        throw new HttpError(res.status, res.statusText);
    }
}

export class HttpError extends Error {
    constructor(public code: number, public status: string) {
        super(`Http ${code} - ${status}`);
        this.name = "HttpError";
    }
}
