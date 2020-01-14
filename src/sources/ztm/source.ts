import { Delay, ISource, Stop, Timestamp, Vehicle } from '..';
import { CoordinateSystem } from '../../utils/geo';
import { getDelaysModel, getStopsModel, StopModel, StopsModel, getLiveModel } from './response';
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
        const model = await this.getDayModel(day);
        return {
            lastUpdate: model.lastUpdate,
            data: model.data
                .map(e => Object
                    .assign({}, e, { coordinateSystem: CoordinateSystem.WGS84 }))
        };
    }

    getDelays(stopId: number): Promise<Timestamp<Delay[]>> {
        return getDelaysModel(stopId);
    }

    getLive(): Promise<Timestamp<Vehicle[]>> {
        return getLiveModel();
    }
}
