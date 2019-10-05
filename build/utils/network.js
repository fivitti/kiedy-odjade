export function noCorsFetch(url) {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/" + url;
    return fetch(proxyUrl, {
        headers: {
            "x-requested-with": window.location.origin
        }
    });
}
//# sourceMappingURL=network.js.map