export function checkLocalStorageSupport() {
    if (typeof Storage === "undefined") {
        return false;
    } else if (localStorage == null) {
        return false;
    }
    try {
        localStorage.setItem("LS_TEST", "OK");
        localStorage.removeItem("LS_TEST");
    } catch {
        return false;
    }
    return true;
}