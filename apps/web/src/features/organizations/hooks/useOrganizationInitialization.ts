import { useSyncOrganization } from './useSyncOrganization';
import { useCurrentOrganization } from './useCurrentOrganization';
import { useOrganizationBootstrap } from './useOrganizationBootstrap';

export const useOrganizationInitialization = () => {
  const { isBootstrapped } = useOrganizationBootstrap();
  const { isSynced } = useSyncOrganization();

  const organization = useCurrentOrganization();

  const isReady = isBootstrapped && isSynced && organization !== null;

  return {
    organization,
    isReady,
    isLoading: !isReady,
  };
};
