interface VisibilityBrowserCapabilities { event: string, hidden: string }

export default class ForegroundTimer {
    private capabilities: VisibilityBrowserCapabilities = null;
    private lastUpdate: number = 0;
    private timerHandler: number = null;
    private isRun: boolean = false;

    constructor(private interval: number, private callback: (date: Date) => void) {
        this.capabilities = this.getBrowserCapabilities();
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.onTimer = this.onTimer.bind(this);
    }

    run(): boolean {
        if (this.capabilities == null) {
            return false;
        }
        if (this.isRun) {
            return true;
        }
        document.addEventListener(this.capabilities.event, this.handleVisibilityChange, false);
        this.startTimer();
        this.isRun = true;
        return true;
    }

    close(): void {
        if (this.capabilities == null) {
            return;
        }
        if (!this.isRun) {
            return;
        }
        document.removeEventListener(this.capabilities.event, this.handleVisibilityChange);
        this.stopTimer();
        this.isRun = false;
    }

    private startTimer(temporaryInterval?: number): void {
        const interval = temporaryInterval || this.interval;
        this.timerHandler = window.setTimeout(this.onTimer, interval);
    }

    private stopTimer(): void {
        if (this.timerHandler != null) {
            clearTimeout(this.timerHandler);
            this.timerHandler = null;
        }
    }

    private onTimer() {
        const now = new Date();
        this.lastUpdate = +now;
        this.callback(now);
        this.startTimer();
    }

    private handleVisibilityChange() {
        if ((window as any)[this.capabilities.hidden]) {
            this.stopTimer();
        } else {
            const nowMilisecons = +new Date();
            const diff = nowMilisecons - this.lastUpdate;
            if (diff >= this.interval) {
                this.onTimer();
            } else {
                this.startTimer(this.interval - diff);
            }
        }
    }

    private getBrowserCapabilities(): VisibilityBrowserCapabilities {
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
}