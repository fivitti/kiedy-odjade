import { CoordinateSystem } from '../../utils/geo';
import { getDelaysModel, getStopsModel } from './response';
import { getDateKey } from './utils';
export class ZtmSource {
    getModel() {
        return getStopsModel();
    }
    async getDayModel(day) {
        const key = getDateKey(day);
        const model = await this.getModel();
        const entry = model.stops[key];
        return {
            lastUpdate: model.lastUpdate,
            data: entry
        };
    }
    async getStops(day) {
        if (day == null) {
            day = new Date();
        }
        const model = await this.getDayModel(day);
        return {
            lastUpdate: model.lastUpdate,
            data: model.data
                .map(e => Object
                .assign({}, e, { coordinateSystem: CoordinateSystem.WGS84 }))
        };
    }
    async getDelays(stopId) {
        return getDelaysModel(stopId);
    }
}
//# sourceMappingURL=source.js.map