import { useEffect, useState } from 'react';

import { networkManager } from './manager';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(networkManager.isOnline());

  useEffect(() => {
    const removeOnline = networkManager.addOnlineListener(() =>
      setIsOnline(true),
    );
    const removeOffline = networkManager.addOfflineListener(() =>
      setIsOnline(false),
    );

    return () => {
      removeOnline();
      removeOffline();
    };
  }, []);

  return isOnline;
};
