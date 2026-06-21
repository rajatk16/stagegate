import { useBootstrapStore } from './store';

export const useBootstrapInitialized = () =>
  useBootstrapStore((state) => state.initialized);
