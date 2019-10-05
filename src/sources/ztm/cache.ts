import { ICache, Timestamp } from '..';
import { compressStopsModel, decompressStopsModel, StopModel, StopsModel } from './response';
import { ZtmSource } from './source';
import { getDateKey } from './utils';

export class CachedZtmSource extends ZtmSource implements ICache {
    private static KEY = "stops";
    private cache: StopsModel = null;

    constructor() {
        super();
        const data = localStorage.getItem(CachedZtmSource.KEY);
        if (data != null) {
            const compressed = JSON.parse(data);
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
        console.log("In cache refresh");
        const stops = await super.getModel();
        console.log("After getModel in cache");
        const compressed = compressStopsModel(stops);
        console.log("After compress");
        localStorage.setItem(CachedZtmSource.KEY, JSON.stringify(compressed));
        this.cache = stops;
        console.log("refresh end");
    }
}