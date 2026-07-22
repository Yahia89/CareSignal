import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppLifecycleContext } from '../../shared/contexts/AppLifecycleContext';
import { logger } from '../../shared/utils/logger';

/**
 * Reacts to the lifecycle service's `shouldReset` flag by resetting the
 * navigation stack to the role's first screen.
 *
 * Mount this component inside the `NavigationContainer` so it has
 * access to the navigation object. It should only be rendered when the
 * user is authenticated.
 *
 * Design notes
 * ────────────
 * • The reset uses `navigation.reset` which replaces the *entire*
 *   navigation state, discarding any deep-navigation history (this is
 *   the desired behaviour — after 24 hours the user should feel like
 *   they just opened the app).
 * • After resetting, `acknowledgeReset` records a new activity
 *   timestamp so the 24-hour window restarts.
 * • This component is deliberately *separate* from `RootNavigator` so
 *   it can be deleted / extended independently without touching nav
 *   wiring.
 *
 * @param role  The authenticated user's role — determines which stack
 *              and initial screen to reset to.
 */
export function useInactivityReset(role: 'elder' | 'family') {
  const navigation = useNavigation();
  const { shouldReset, hydrated, acknowledgeReset } =
    useAppLifecycleContext();
  const hasReset = useRef(false);

  useEffect(() => {
    if (!hydrated || !shouldReset || hasReset.current) return;

    // Determine the target state based on the user's role.
    const resetState =
      role === 'elder'
        ? {
            index: 0,
            routes: [
              {
                name: 'Elder' as const,
                state: {
                  index: 0,
                  routes: [{ name: 'CheckInHome' as const }],
                },
              },
            ],
          }
        : {
            index: 0,
            routes: [
              {
                name: 'Family' as const,
                state: {
                  index: 0,
                  routes: [{ name: 'FamilyDashboard' as const }],
                },
              },
            ],
          };

    logger.info(
      `[InactivityReset] resetting ${role} stack to first screen`,
    );

    hasReset.current = true;

    // Use navigation.reset() directly to avoid CommonActions.reset()
    // type mismatch with exactOptionalPropertyTypes.
    navigation.reset(resetState);

    // Start a new 24-hour window.
    acknowledgeReset().catch((e) =>
      logger.error('[InactivityReset] acknowledgeReset failed', e),
    );
  }, [shouldReset, hydrated, role, navigation, acknowledgeReset]);

  // Allow re-triggering on subsequent foreground transitions.
  useEffect(() => {
    if (!shouldReset) {
      hasReset.current = false;
    }
  }, [shouldReset]);
}
