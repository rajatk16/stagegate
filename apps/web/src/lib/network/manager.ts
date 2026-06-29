export class NetworkManager {
  isOnline(): boolean {
    return navigator.onLine;
  }

  addOnlineListener(listener: () => void) {
    window.addEventListener('online', listener);

    return () => window.removeEventListener('online', listener);
  }

  addOfflineListener(listener: () => void) {
    window.addEventListener('offline', listener);

    return () => window.removeEventListener('offline', listener);
  }
}

export const networkManager = new NetworkManager();
