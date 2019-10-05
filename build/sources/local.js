import { addSeconds } from '../utils/dates';
import { randInt } from '../utils/random';
const STOPS = JSON.parse('[{"stopId":8227,"name":"DąbrowaCentrum 04","latitude":54.47317,"longitude":18.46509,"coordinateSystem":4326},{"stopId":8228,"name":"Kameliowa 02","latitude":54.47018,"longitude":18.4682,"coordinateSystem":4326},{"stopId":8229,"name":"Paprykowa 02","latitude":54.46784,"longitude":18.46546,"coordinateSystem":4326},{"stopId":8230,"name":"Szafranowa 02","latitude":54.46536,"longitude":18.4602,"coordinateSystem":4326},{"stopId":8231,"name":"GiełdaTowarowa 02","latitude":54.46224,"longitude":18.45337,"coordinateSystem":4326},{"stopId":8232,"name":"Rdestowa-Chwaszczyńska 04","latitude":54.45874,"longitude":18.4528,"coordinateSystem":4326},{"stopId":8233,"name":"Starochwaszczyńska 02","latitude":54.45696,"longitude":18.4495,"coordinateSystem":4326},{"stopId":8234,"name":"CentrumNadawczeRTV 02","latitude":54.45176,"longitude":18.43933,"coordinateSystem":4326},{"stopId":8235,"name":"Gdyńska 01","latitude":54.44749,"longitude":18.42771,"coordinateSystem":4326},{"stopId":8236,"name":"Chwaszczyno 01","latitude":54.44345,"longitude":18.42077,"coordinateSystem":4326}]');
export default class LocalSource {
    getStops(day) {
        const result = {
            lastUpdate: new Date(),
            data: STOPS
        };
        return Promise.resolve(result);
    }
    async getDelays(stopId) {
        return {
            lastUpdate: new Date(),
            data: Array(randInt(7))
                .fill(0)
                .map(() => addSeconds(new Date(), randInt(-5000, 5000)))
                .map(theory => [theory, addSeconds(theory, randInt(5000))])
                .map(([theoretical, estimated]) => ({
                routeId: randInt(1, 200),
                theoretical,
                estimated,
                seconds: Math.trunc((+estimated - +theoretical) * 1000)
            }))
        };
    }
}
//# sourceMappingURL=local.js.map