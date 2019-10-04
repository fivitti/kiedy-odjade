var App = (() => {
    const defines = {};
    const entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies, factory };
        entry[0] = name;
    }
    define("require", ["exports"], (exports) => {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: (name) => resolve(name) });
    });
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    define("utils/geo", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        var CoordinateSystem;
        (function (CoordinateSystem) {
            CoordinateSystem[CoordinateSystem["WGS84"] = 4326] = "WGS84";
        })(CoordinateSystem = exports.CoordinateSystem || (exports.CoordinateSystem = {}));
        function getCurrentPosition() {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition((position) => {
                    resolve({
                        coordinateSystem: CoordinateSystem.WGS84,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                }, reject);
            });
        }
        exports.getCurrentPosition = getCurrentPosition;
    });
    define("utils/format", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function formatDistance(meters) {
            if (meters < 1000) {
                return meters.toFixed() + "m";
            }
            else {
                return (meters / 1000).toFixed(1) + "km";
            }
        }
        exports.formatDistance = formatDistance;
        function formatTime(date) {
            return date.toLocaleTimeString().slice(0, -3);
        }
        exports.formatTime = formatTime;
        function formatDate(date) {
            return date.toLocaleDateString();
        }
        exports.formatDate = formatDate;
        function formatTimespan(totalMiliseconds, precision = 'minutes') {
            const totalSeconds = Math.trunc(totalMiliseconds / 1000);
            const totalMinutes = Math.trunc(totalSeconds / 60);
            if (precision === 'minutes') {
                if (totalMinutes === 0) {
                    return "< 1 min";
                }
                return `${totalMinutes} min`;
            }
            const totalHours = Math.trunc(totalMinutes / 60);
            const totalDays = Math.trunc(totalHours / 24);
            if (totalDays !== 0) {
                return totalDays + " d";
            }
            if (totalHours === 0) {
                return "< 1 h";
            }
            return totalHours + " h";
        }
        exports.formatTimespan = formatTimespan;
    });
    define("utils/distance/spherical", ["require", "exports", "utils/geo"], function (require, exports, geo_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function default_1(first, second) {
            if (first.coordinateSystem !== geo_1.CoordinateSystem.WGS84 ||
                second.coordinateSystem !== geo_1.CoordinateSystem.WGS84) {
                throw new Error("Required WGS84 coordinate system");
            }
            return distance(first.latitude, first.longitude, second.latitude, second.longitude);
        }
        exports.default = default_1;
        // Source: https://stackoverflow.com/a/21623206
        function distance(lat1, lon1, lat2, lon2) {
            const p = 0.017453292519943295; // Math.PI / 180
            const c = Math.cos;
            const a = 0.5 - c((lat2 - lat1) * p) / 2 +
                c(lat1 * p) * c(lat2 * p) *
                    (1 - c((lon2 - lon1) * p)) / 2;
            const d = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
            return d * 1000; // meters
        }
    });
    define("utils/distance/index", ["require", "exports", "utils/distance/spherical"], function (require, exports, spherical_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        spherical_1 = __importDefault(spherical_1);
        exports.spherical = spherical_1.default;
    });
    define("utils/network", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function noCorsFetch(url) {
            const proxyUrl = "https://cors-anywhere.herokuapp.com/" + url;
            return fetch(proxyUrl, {
                headers: {
                    "x-requested-with": window.location.origin
                }
            });
        }
        exports.noCorsFetch = noCorsFetch;
    });
    define("utils/functional", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function zip(a, b) {
            return a.map((item, idx) => [item, b[idx]]);
        }
        exports.zip = zip;
        function mapObject(obj, map) {
            return Object.keys(obj)
                .map(key => ({
                key,
                value: map(obj[key])
            }))
                .reduce((acc, v) => (Object.assign(Object.assign({}, acc), { [v.key]: v.value })), {});
        }
        exports.mapObject = mapObject;
    });
    define("sources/ztm/config", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.STOPS_API = 'https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/4c4025f0-01bf-41f7-a39f-d156d201b82b/download/stops.json';
        exports.DELAY_API = 'http://ckan2.multimediagdansk.pl/delays?stopId={stopId}';
    });
    define("sources/ztm/utils", ["require", "exports", "sources/ztm/config"], function (require, exports, config_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function toDate(raw) {
            return new Date(raw);
        }
        exports.toDate = toDate;
        function toTime(raw) {
            const today = new Date();
            const [hours, minutes] = raw.split(":");
            today.setMilliseconds(0);
            today.setSeconds(0);
            today.setMinutes(parseInt(minutes, 10));
            today.setHours(parseInt(hours, 10));
            return today;
        }
        exports.toTime = toTime;
        function delayUrl(stopId) {
            return config_1.DELAY_API.replace("{stopId}", stopId.toString());
        }
        exports.delayUrl = delayUrl;
        function getDateKey(day) {
            const dateString = day.toISOString().slice(0, 10);
            return dateString;
        }
        exports.getDateKey = getDateKey;
    });
    define("sources/ztm/response", ["require", "exports", "utils/functional", "sources/ztm/config", "sources/ztm/utils", "utils/network"], function (require, exports, functional_1, config_2, utils_1, network_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function filterStopsResponse(obj) {
            const now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            return Object.keys(obj)
                .filter(k => +new Date(k) >= +now)
                .reduce((acc, k) => (Object.assign(Object.assign({}, acc), { [k]: obj[k] })), {});
        }
        function toStopsModel(obj) {
            obj = filterStopsResponse(obj);
            const keys = Object.keys(obj);
            if (keys.length === 0) {
                return {
                    lastUpdate: new Date(),
                    stops: {}
                };
            }
            const lastUpdate = keys
                .map(k => obj[k].lastUpdate)
                .map(d => new Date(d))
                .sort((a, b) => +b - +a)[0];
            const stops = functional_1.mapObject(obj, (item) => item.stops
                .filter(s => !s.virtual)
                .map(s => ({
                name: `${s.stopName} ${s.subName}`,
                onDemand: s.onDemand === 1,
                stopId: s.stopId,
                zoneId: s.zoneId,
                latitude: s.stopLat,
                longitude: s.stopLon
            })));
            return {
                lastUpdate,
                stops
            };
        }
        async function getStopsModel() {
            const response = await fetch(config_2.STOPS_API);
            const json = await response.json();
            return toStopsModel(json);
        }
        exports.getStopsModel = getStopsModel;
        function compressStopsModel(obj) {
            return {
                lu: obj.lastUpdate.toISOString(),
                s: functional_1.mapObject(obj.stops, stops => stops.map(s => ({
                    id: s.stopId,
                    z: s.zoneId,
                    n: s.name,
                    d: s.onDemand ? 1 : 0,
                    lt: s.latitude,
                    ln: s.longitude
                })))
            };
        }
        exports.compressStopsModel = compressStopsModel;
        function decompressStopsModel(obj) {
            return {
                lastUpdate: new Date(obj.lu),
                stops: functional_1.mapObject(obj.s, stops => stops
                    .map(s => ({
                    stopId: s.id,
                    zoneId: s.z,
                    onDemand: s.d === 1,
                    name: s.n,
                    latitude: s.lt,
                    longitude: s.ln
                })))
            };
        }
        exports.decompressStopsModel = decompressStopsModel;
        async function getDelaysModel(stopId) {
            const url = utils_1.delayUrl(stopId);
            const response = await network_1.noCorsFetch(url);
            const data = await response.json();
            return {
                lastUpdate: utils_1.toDate(data.lastUpdate),
                data: data.delay
                    .map(d => ({
                    seconds: d.delayInSeconds,
                    estimated: utils_1.toTime(d.estimatedTime),
                    theoretical: utils_1.toTime(d.theoreticalTime),
                    routeId: d.routeId
                }))
            };
        }
        exports.getDelaysModel = getDelaysModel;
    });
    define("sources/ztm/source", ["require", "exports", "utils/geo", "sources/ztm/response", "sources/ztm/utils"], function (require, exports, geo_2, response_1, utils_2) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        class ZtmSource {
            getModel() {
                return response_1.getStopsModel();
            }
            async getDayModel(day) {
                const key = utils_2.getDateKey(day);
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
                        .assign({}, e, { coordinateSystem: geo_2.CoordinateSystem.WGS84 }))
                };
            }
            async getDelays(stopId) {
                return response_1.getDelaysModel(stopId);
            }
        }
        exports.ZtmSource = ZtmSource;
    });
    define("sources/ztm/cache", ["require", "exports", "sources/ztm/source", "sources/ztm/response", "sources/ztm/utils"], function (require, exports, source_1, response_2, utils_3) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        class CachedZtmSource extends source_1.ZtmSource {
            constructor() {
                super();
                this.cache = null;
                const data = localStorage.getItem(CachedZtmSource.KEY);
                if (data != null) {
                    const compressed = JSON.parse(data);
                    this.cache = response_2.decompressStopsModel(compressed);
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
                    const key = utils_3.getDateKey(day);
                    if (!(key in this.cache.stops)) {
                        await this.refresh();
                    }
                }
                return super.getDayModel(day);
            }
            async refresh() {
                const stops = await super.getModel();
                const compressed = response_2.compressStopsModel(stops);
                localStorage.setItem(CachedZtmSource.KEY, JSON.stringify(compressed));
                this.cache = stops;
            }
        }
        exports.CachedZtmSource = CachedZtmSource;
        CachedZtmSource.KEY = "stops";
    });
    define("sources/ztm/index", ["require", "exports", "sources/ztm/cache"], function (require, exports, cache_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.default = cache_1.CachedZtmSource;
    });
    define("utils/random", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function randInt(minOrMax, max) {
            const min = max != null ? minOrMax : 0;
            max = max == null ? minOrMax : max;
            const base = Math.random();
            const scaled = base * (max - min);
            const truncated = Math.trunc(scaled);
            const shifted = truncated + min;
            return shifted;
        }
        exports.randInt = randInt;
    });
    define("utils/dates", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function addSeconds(date, seconds) {
            const newDate = new Date(date);
            newDate.setSeconds(newDate.getSeconds() + seconds);
            return newDate;
        }
        exports.addSeconds = addSeconds;
    });
    define("sources/local", ["require", "exports", "utils/random", "utils/dates"], function (require, exports, random_1, dates_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        const STOPS = JSON.parse('[{"stopId":8227,"name":"DąbrowaCentrum 04","latitude":54.47317,"longitude":18.46509,"coordinateSystem":4326},{"stopId":8228,"name":"Kameliowa 02","latitude":54.47018,"longitude":18.4682,"coordinateSystem":4326},{"stopId":8229,"name":"Paprykowa 02","latitude":54.46784,"longitude":18.46546,"coordinateSystem":4326},{"stopId":8230,"name":"Szafranowa 02","latitude":54.46536,"longitude":18.4602,"coordinateSystem":4326},{"stopId":8231,"name":"GiełdaTowarowa 02","latitude":54.46224,"longitude":18.45337,"coordinateSystem":4326},{"stopId":8232,"name":"Rdestowa-Chwaszczyńska 04","latitude":54.45874,"longitude":18.4528,"coordinateSystem":4326},{"stopId":8233,"name":"Starochwaszczyńska 02","latitude":54.45696,"longitude":18.4495,"coordinateSystem":4326},{"stopId":8234,"name":"CentrumNadawczeRTV 02","latitude":54.45176,"longitude":18.43933,"coordinateSystem":4326},{"stopId":8235,"name":"Gdyńska 01","latitude":54.44749,"longitude":18.42771,"coordinateSystem":4326},{"stopId":8236,"name":"Chwaszczyno 01","latitude":54.44345,"longitude":18.42077,"coordinateSystem":4326}]');
        class LocalSource {
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
                    data: Array(random_1.randInt(7))
                        .fill(0)
                        .map(() => dates_1.addSeconds(new Date(), random_1.randInt(-5000, 5000)))
                        .map(theory => [theory, dates_1.addSeconds(theory, random_1.randInt(5000))])
                        .map(([theoretical, estimated]) => ({
                        routeId: random_1.randInt(1, 200),
                        theoretical,
                        estimated,
                        seconds: Math.trunc((+estimated - +theoretical) * 1000)
                    }))
                };
            }
        }
        exports.default = LocalSource;
    });
    define("sources/index", ["require", "exports", "sources/ztm/index", "sources/local"], function (require, exports, ztm_1, local_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        ztm_1 = __importDefault(ztm_1);
        local_1 = __importDefault(local_1);
        exports.ZtmSource = ztm_1.default;
        exports.LocalSource = local_1.default;
        function isCache(source) {
            return source.refresh !== undefined;
        }
        exports.isCache = isCache;
    });
    define("app", ["require", "exports", "utils/geo", "utils/format", "utils/distance/index", "sources/index"], function (require, exports, geo_3, format_1, distance, sources_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        distance = __importStar(distance);
        class App {
            constructor(rootId) {
                this.rootId = rootId;
                this.limitStops = 5;
                this.currentData = {
                    lastUpdate: null,
                    stopData: []
                };
                //private source: ISource = new LocalSource();
                this.source = new sources_1.ZtmSource();
            }
            async init() {
            }
            async getNearestStops(stops, limit) {
                const currentPosition = await geo_3.getCurrentPosition();
                const distances = stops.map(s => distance.spherical(currentPosition, s));
                return stops
                    .map((stop, idx) => (Object.assign(Object.assign({}, stop), { distance: distances[idx] })))
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, limit);
            }
            async refresh() {
                const stops = await this.source.getStops();
                const nearest = await this.getNearestStops(stops.data, this.limitStops);
                const delays = await Promise.all(nearest
                    .map(s => this.source.getDelays(s.stopId)));
                delays.forEach(d => d.data
                    .sort((a, b) => +a.estimated - +b.estimated));
                this.currentData = {
                    stopData: nearest
                        .map((n, idx) => (Object.assign(Object.assign({}, n), { delays: delays[idx].data }))),
                    lastUpdate: stops.lastUpdate
                };
            }
            render() {
                const rootElement = document.getElementById(this.rootId);
                const stopTemplate = document.getElementById("stop-template");
                const delayRowTemplate = document.getElementById("delay-row");
                const now = new Date();
                const stopsLastUpdateElement = document.querySelector("#stop-last-update");
                const stopLastUpdateStr = this.currentData.lastUpdate.toLocaleString();
                const stopLastUpdateAgo = format_1.formatTimespan(+now - +this.currentData.lastUpdate, 'days');
                stopsLastUpdateElement.textContent = `${stopLastUpdateStr} (${stopLastUpdateAgo})`;
                const source = this.source;
                if (sources_1.isCache(source)) {
                    const refreshContainerElement = document.querySelector("#stop-update");
                    const button = document.createElement('button');
                    button.classList.add("btn-small");
                    button.textContent = "Refresh";
                    button.onclick = () => source.refresh();
                    refreshContainerElement.appendChild(button);
                }
                rootElement.innerHTML = '';
                for (let stop of this.currentData.stopData) {
                    const stopElement = document.importNode(stopTemplate.content, true);
                    const stopNameElement = stopElement.querySelector(".stop-name");
                    const stopDistanceElement = stopElement.querySelector(".stop-distance");
                    stopNameElement.textContent = stop.name;
                    stopDistanceElement.textContent = format_1.formatDistance(stop.distance);
                    const tbodyElement = stopElement.querySelector("tbody");
                    for (let delay of stop.delays) {
                        const rowElement = document.importNode(delayRowTemplate.content, true);
                        const lineNoElement = rowElement.querySelector(".line-no");
                        const lineEstimatedElement = rowElement.querySelector(".line-estimated");
                        const lineToArriveElement = rowElement.querySelector(".line-to-arrive");
                        lineNoElement.textContent = delay.routeId.toString();
                        lineToArriveElement.textContent = format_1.formatTimespan(+delay.estimated - +now);
                        lineEstimatedElement.textContent = format_1.formatTime(delay.estimated);
                        tbodyElement.appendChild(rowElement);
                    }
                    rootElement.appendChild(stopElement);
                }
            }
        }
        exports.default = App;
    });
    define("index", ["require", "exports", "app"], function (require, exports, app_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        app_1 = __importDefault(app_1);
        exports.App = app_1.default;
    });
    
    'marker:resolver';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            const dependencies = ['exports'];
            const factory = (exports) => {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch (_a) {
                    throw Error(['module "', name, '" not found.'].join(''));
                }
            };
            return { dependencies, factory };
        }
    }
    const instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        const define = get_define(name);
        instances[name] = {};
        const dependencies = define.dependencies.map(name => resolve(name));
        define.factory(...dependencies);
        const exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports.default : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve(entry[0]);
    }
})();