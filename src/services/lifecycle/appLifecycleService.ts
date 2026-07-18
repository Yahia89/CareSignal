import { cache } from '../../shared/storage';
import { logger } from '../../shared/utils/logger';
import {
  STORAGE_KEY_LAST_ACTIVITY,
  INACTIVITY_THRESHOLD_MS,
} from './constants';

/**
 * Pure-logic service that tracks the timestamp of the user's last
 * meaningful activity and evaluates whether the 24-hour inactivity
 * threshold has been crossed.
 *
 * Design goals
 * ────────────
 * • **Fully isolated** — no dependency on React, navigation, auth, or
 *   notifications.  The navigation layer *reacts* to the boolean returned
 *   by `isInactive()`.
 * • **Works across cold launches & foreground resumptions** — the
 *   timestamp is persisted to AsyncStorage so a fresh JS boot can detect
 *   a stale session just as well as a background → foreground transition.
 * • **Extensible** — additional inactivity rules (e.g. the senior daily
 *   check-in cadence) can be added here without touching navigation or
 *   auth code.
 */

// ---------------------------------------------------------------------------
// In-memory mirror of the persisted timestamp.  Avoids awaiting
// AsyncStorage on every evaluation; we hydrate once on startup and
// keep it in sync on every write.
// ---------------------------------------------------------------------------
let _lastActivityTs: number | null = null;

/**
 * Hydrate the in-memory timestamp from AsyncStorage.
 * Call once during app start (before the first `isInactive` check).
 */
export async function hydrate(): Promise<void> {
  try {
    const raw = await cache.getItem(STORAGE_KEY_LAST_ACTIVITY);
    if (raw !== null) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        _lastActivityTs = parsed;
      }
    }
  } catch (e) {
    logger.error('[AppLifecycle] hydrate failed', e);
  }
}

/**
 * Record the current moment as the last meaningful activity.
 *
 * Called on:
 *   • successful check-in submission
 *   • any user-initiated interaction we consider "meaningful"
 *   • app launch / foreground transition (if not already inactive)
 */
export async function recordActivity(): Promise<void> {
  const now = Date.now();
  _lastActivityTs = now;
  try {
    await cache.setItem(STORAGE_KEY_LAST_ACTIVITY, String(now));
  } catch (e) {
    logger.error('[AppLifecycle] recordActivity write failed', e);
  }
}

/**
 * Returns `true` when 24+ hours have elapsed since the last recorded
 * activity, **or** when no activity has ever been recorded (first-run
 * experience — the user should see the first screen of their flow).
 */
export function isInactive(): boolean {
  if (_lastActivityTs === null) {
    // No recorded activity yet — treat as "inactive" so the user lands
    // on the natural starting screen of their role flow.
    return true;
  }
  return Date.now() - _lastActivityTs >= INACTIVITY_THRESHOLD_MS;
}

/**
 * Clear persisted activity data (e.g. on logout so a different user
 * doesn't inherit the previous session's timestamp).
 */
export async function clearActivity(): Promise<void> {
  _lastActivityTs = null;
  try {
    await cache.removeItem(STORAGE_KEY_LAST_ACTIVITY);
  } catch (e) {
    logger.error('[AppLifecycle] clearActivity failed', e);
  }
}

/**
 * Return the raw timestamp for debugging / logging. `null` means no
 * activity has ever been recorded.
 */
export function getLastActivityTs(): number | null {
  return _lastActivityTs;
}
