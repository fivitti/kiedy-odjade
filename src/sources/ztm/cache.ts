import { ICache, Timestamp } from '..';
import { compressStopsModel, CompressStopsModel, decompressStopsModel, StopModel, StopsModel } from './response';
import { ZtmSource } from './source';
import { getDateKey } from './utils';

export class CachedZtmSource extends ZtmSource implements ICache {
    private static KEY = "stops";
    private cache: StopsModel = null;

    constructor() {
        super();

        const compressed = this.getFromLocalStorage();
        if (compressed != null) {
            this.cache = decompressStopsModel(compressed);
        }
    }

    protected async getModel(): Promise<StopsModel> {
        if (this.cache == null) {
            await this.refresh();
        }
        return this.cache;
    }

    protected async getDayModel(day: Date): Promise<Timestamp<StopModel[]>> {
        if (this.cache != null) {
            const key = getDateKey(day);
            if (!(key in this.cache.stops)) {
                await this.refresh();
            }
        }
        return super.getDayModel(day);
    }

    async refresh(): Promise<void> {
        const stops = await super.getModel();
        const compressed = compressStopsModel(stops);
        this.saveToLocalStorage(compressed);
        this.cache = stops;
    }

    private saveToLocalStorage(model: CompressStopsModel): void {
        while (Object.keys(model.s).length !== 0) {
            try {
                const stringfied = JSON.stringify(model);
                localStorage.setItem(CachedZtmSource.KEY, stringfied);
                return;
            } catch (e) {
                this.removeLastDay(model);
            }

        }
    }

    private getFromLocalStorage(): CompressStopsModel {
        const str = localStorage.getItem(CachedZtmSource.KEY);
        const compressed = JSON.parse(str);
        return compressed;
    }

    private removeLastDay(model: CompressStopsModel) {
        const keys = Object.keys(model.s)
            .sort((a, b) => b.localeCompare(a));

        if (keys.length === 0) {
            return;
        }

        const last = keys[0];
        delete model.s[last]
    }

}