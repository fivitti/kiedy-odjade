import { CachedZtmSource } from './cache';
import { checkLocalStorageSupport } from '../../utils/localstorage';
import { ZtmSource } from './source';

const isLocalStorageSupported = checkLocalStorageSupport();

const Source = isLocalStorageSupported ? CachedZtmSource : ZtmSource;
export default Source;