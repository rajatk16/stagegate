import { useEffect } from 'react';
import { onlineManager } from '@tanstack/react-query';

import { networkManager } from './manager';

export const useOnlineManager = () => {
  useEffect(() => {
    return onlineManager.setEventListener((setOnline) => {
      const removeOnline = networkManager.addOnlineListener(() =>
        setOnline(true),
      );
      const removeOffline = networkManager.addOfflineListener(() =>
        setOnline(false),
      );

      return () => {
        removeOnline();
        removeOffline();
      };
    });
  }, []);
};
