const PROXY_URLS = [
    "https://cors.figiel.xyz/",
    "https://kiedy-odjade-cors-anywhere.herokuapp.com/",
    "https://cors-anywhere.herokuapp.com/"
];

export async function noCorsFetch(url: string): Promise<Response> {
    const init: RequestInit = {
        headers: {
            "x-requested-with": window.location.origin,
            "cache-control": "no-cache",
            "pragma": "no-cache"
        }
    };
    const res = await fetchToActiveProxy(url, init);

    if (res.ok) {
        return res;
    } else {
        throw new HttpError(res.status, res.statusText);
    }
}

type ResponseOrError = Response | Error;

async function fetchToActiveProxy(requestedUrl: string, init: RequestInit): Promise<Response> {
    let firstResponse: ResponseOrError = null;

    for (let proxyUrl of PROXY_URLS) {
        const url = proxyUrl + requestedUrl;
        const res = await fetchSafe(url, init);

        if (firstResponse == null) {
            firstResponse = res;
        }

        if (!(res instanceof Response) || res.status >= 400 && res.status < 600) {
            continue;
        }

        return res;
    }

    if (firstResponse instanceof Response) {
        return firstResponse;
    } else {
        throw firstResponse;
    }
}

async function fetchSafe(url: string, init: RequestInit): Promise<ResponseOrError> {
    try {
        return await fetch(url, init);
    }
    catch (err) {
        return err;
    }
}

export class HttpError extends Error {
    constructor(public code: number, public status: string) {
        super(`Http ${code} - ${status}`);
        this.name = "HttpError";
    }
}
