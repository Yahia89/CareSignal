import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  hydrate,
  recordActivity,
  isInactive,
  clearActivity,
} from '../services/lifecycle';
import { logger } from '../shared/utils/logger';

/**
 * Bridges React Native's `AppState` with the lifecycle service so the
 * 24-hour inactivity check runs automatically on:
 *
 *   1. **Cold launch** — the first render hydrates the persisted
 *      timestamp and evaluates inactivity *before* the user sees any
 *      content.
 *   2. **Background → foreground transition** — every time the app
 *      resumes from the background, the elapsed time is re-evaluated.
 *
 * Returns `{ shouldReset }`:
 *   • `true`  → 24+ hours have passed — navigation should reset to the
 *               first screen of the user's role flow.
 *   • `false` → the user is within the 24-hour window.
 *
 * The hook is intentionally *read-only* for consumers.  Side effects
 * (recording a new activity timestamp after the reset) happen inside
 * `acknowledgeReset`.
 */
export function useAppLifecycle() {
  const [shouldReset, setShouldReset] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ------------------------------------------------------------------
  // 1. Cold-launch: hydrate persisted timestamp and evaluate
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await hydrate();
      if (cancelled) return;
      setHydrated(true);

      if (isInactive()) {
        logger.info('[AppLifecycle] 24hr inactivity detected on cold launch');
        setShouldReset(true);
      } else {
        // Still within 24 hours — record the app open as activity so
        // the timer effectively restarts from this moment.
        await recordActivity();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------------------------
  // 2. Foreground transition: re-evaluate on every resume
  // ------------------------------------------------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextState: AppStateStatus) => {
        const prev = appStateRef.current;
        appStateRef.current = nextState;

        // Only act on background/inactive → active transitions
        if (
          nextState === 'active' &&
          (prev === 'background' || prev === 'inactive')
        ) {
          if (isInactive()) {
            logger.info(
              '[AppLifecycle] 24hr inactivity detected on foreground resume',
            );
            setShouldReset(true);
          } else {
            // Still within the window — refresh the timestamp so the
            // 24h clock restarts from this moment.
            await recordActivity();
          }
        }
      },
    );

    return () => subscription.remove();
  }, []);

  // ------------------------------------------------------------------
  // 3. After the navigation layer has performed the reset, call this
  //    to clear the flag and start a fresh 24-hour window.
  // ------------------------------------------------------------------
  const acknowledgeReset = useCallback(async () => {
    await recordActivity();
    setShouldReset(false);
    logger.info('[AppLifecycle] reset acknowledged — new 24hr window started');
  }, []);

  // ------------------------------------------------------------------
  // 4. Logout helper — call when the user signs out so the next user
  //    doesn't inherit a stale timestamp.
  // ------------------------------------------------------------------
  const clearLifecycleData = useCallback(async () => {
    await clearActivity();
    setShouldReset(false);
  }, []);

  return { shouldReset, hydrated, acknowledgeReset, clearLifecycleData };
}
