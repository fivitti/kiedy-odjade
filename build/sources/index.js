import LocalSource from './local';
import ZtmSource from './ztm';
export function isCache(source) {
    return source.refresh !== undefined;
}
export { ZtmSource, LocalSource };
//# sourceMappingURL=index.js.map