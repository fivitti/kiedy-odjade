export interface PageVisibilityApiCapabilities { event: string, hidden: string }

export function getPageVisibilityApiCapabilities(): PageVisibilityApiCapabilities {
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
        return {
            event: "visibilitychange",
            hidden: "hidden"
        };
    } else if (typeof (document as any).msHidden !== "undefined") {
        return {
            event: "msvisibilitychange",
            hidden: "msHidden"
        }
    } else if (typeof (document as any).webkitHidden !== "undefined") {
        return {
            event: "webkitvisibilitychange",
            hidden: "webkitHidden"
        }
    } else {
        return null; // Unsupported
    }
}

export function isPageVisibilityApiSupported(): boolean {
    return getPageVisibilityApiCapabilities() != null;
}