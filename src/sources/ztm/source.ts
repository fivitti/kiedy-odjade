import { Delay, ISource, Stop, Timestamp } from '..';
import { CoordinateSystem } from '../../utils/geo';
import { getDelaysModel, getStopsModel, StopModel, StopsModel } from './response';
import { getDateKey } from './utils';

export class ZtmSource implements ISource {
    protected getModel(): Promise<StopsModel> {
        return getStopsModel();
    }

    protected async getDayModel(day: Date): Promise<Timestamp<StopModel[]>> {
        const key = getDateKey(day);
        const model = await this.getModel();
        const entry = model.stops[key];

        return {
            lastUpdate: model.lastUpdate,
            data: entry
        };
    }

    async getStops(day?: Date): Promise<Timestamp<Stop[]>> {
        if (day == null) {
            day = new Date();
        }
        console.log("getStops");
        const model = await this.getDayModel(day);
        console.log("After get day model");
        return {
            lastUpdate: model.lastUpdate,
            data: model.data
                .map(e => Object
                    .assign({}, e, { coordinateSystem: CoordinateSystem.WGS84 }))
        };
    }

    async getDelays(stopId: number): Promise<Timestamp<Delay[]>> {
        return getDelaysModel(stopId);
    }
}