import { useState, useEffect } from 'react';
// Assuming @react-native-community/netinfo would be used in a real app
// For MVP we mock online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Mock net info check / event listener
    setIsOnline(true);
  }, []);

  return isOnline;
}
