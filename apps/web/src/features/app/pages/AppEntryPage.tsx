import { ErrorState } from '@/components/states';
import { FullPageLoader } from '@/components/feedback';

import { useApplicationEntry } from '../hooks';

export const AppEntryPage = () => {
  const { isError, error } = useApplicationEntry();

  if (isError) {
    return (
      <ErrorState
        description={error?.message}
        title="Error loading your workspace"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <FullPageLoader
      title="Preparing your workspace"
      description="Please wait while we load your organizations."
    />
  );
};
