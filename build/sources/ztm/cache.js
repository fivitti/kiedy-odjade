import { compressStopsModel, decompressStopsModel } from './response';
import { ZtmSource } from './source';
import { getDateKey } from './utils';
export class CachedZtmSource extends ZtmSource {
    constructor() {
        super();
        this.cache = null;
        const data = localStorage.getItem(CachedZtmSource.KEY);
        if (data != null) {
            const compressed = JSON.parse(data);
            this.cache = decompressStopsModel(compressed);
        }
    }
    async getModel() {
        if (this.cache == null) {
            await this.refresh();
        }
        return this.cache;
    }
    async getDayModel(day) {
        if (this.cache != null) {
            const key = getDateKey(day);
            if (!(key in this.cache.stops)) {
                await this.refresh();
            }
        }
        return super.getDayModel(day);
    }
    async refresh() {
        const stops = await super.getModel();
        const compressed = compressStopsModel(stops);
        localStorage.setItem(CachedZtmSource.KEY, JSON.stringify(compressed));
        this.cache = stops;
    }
}
CachedZtmSource.KEY = "stops";
//# sourceMappingURL=cache.js.map