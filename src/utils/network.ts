const PROXY_URL = "https://cors.figiel.xyz/"
//const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

export async function noCorsFetch(url: string): Promise<Response> {
    const proxyUrl = PROXY_URL + url;
    const res = await fetch(proxyUrl, {
        headers: {
            "x-requested-with": window.location.origin,
            "cache-control": "no-cache",
            "pragma": "no-cache"
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
