import { useContext } from 'react';
import { EventWorkspaceContext } from '../context';

export const useEventWorkspace = () => {
  const workspace = useContext(EventWorkspaceContext);

  if (!workspace) {
    throw new Error('An event workspace is required.');
  }

  return workspace;
};
