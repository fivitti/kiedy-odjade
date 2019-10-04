export function noCorsFetch(url: string): Promise<Response> {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/" + url;
    return fetch(proxyUrl, {
        headers: {
            "x-requested-with": window.location.origin
        }
    });
}