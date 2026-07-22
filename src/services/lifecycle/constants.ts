/**
 * Constants for the app lifecycle / inactivity service.
 *
 * Isolated so both the service and tests can reference them without
 * pulling in React or AsyncStorage.
 */

/** AsyncStorage key that persists the last-activity epoch (ms). */
export const STORAGE_KEY_LAST_ACTIVITY = '@caresignal/last_activity_ts';

/** 24 hours expressed in milliseconds. */
export const INACTIVITY_THRESHOLD_MS = 24 * 60 * 60 * 1000;
