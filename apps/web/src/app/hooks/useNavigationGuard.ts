import { useBlocker } from 'react-router-dom';

export function useNavigationGuard(enabled: boolean) {
  return useBlocker(enabled);
}
