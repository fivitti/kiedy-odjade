import { ISource, ICache } from "..";
import { Timestamp, Stop, Delay } from "..";
import { CoordinateSystem } from "../../utils/geo";
import { noCorsFetch } from "../../utils/network";
import { StopModel, StopsModel, getStopsModel, getDelaysModel, decompressStopsModel, compressStopsModel } from "./response";
import { STOPS_API } from "./config";
import { getDateKey, delayUrl } from "./utils";

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

    async getDelays(stopId: number): Promise<Timestamp<Delay[]>> {
        return getDelaysModel(stopId);
    }
}
