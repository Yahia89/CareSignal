import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Reactive online-status hook backed by `@react-native-community/netinfo`.
 *
 * `true` when the device has network connectivity AND (when known) confirmed
 * internet reachability. NetInfo can report `isInternetReachable: null` while
 * the probe is in-flight — we treat null as "trust isConnected" to avoid a
 * spurious offline flash on app launch.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then((s) => {
      if (!mounted) return;
      const reachable = s.isInternetReachable;
      setIsOnline(!!s.isConnected && reachable !== false);
    });
    const unsubscribe = NetInfo.addEventListener((s) => {
      const reachable = s.isInternetReachable;
      setIsOnline(!!s.isConnected && reachable !== false);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return isOnline;
}
