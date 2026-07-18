export { STORAGE_KEY_LAST_ACTIVITY, INACTIVITY_THRESHOLD_MS } from './constants';
export {
  hydrate,
  recordActivity,
  isInactive,
  clearActivity,
  getLastActivityTs,
} from './appLifecycleService';
