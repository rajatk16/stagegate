import { useContext } from 'react';

import { OrganizationsContext } from '../context';

export const useOrganizations = () => {
  const context = useContext(OrganizationsContext);

  if (context === undefined) {
    throw new Error(
      'useOrganizations must be used inside OrganizationsProvider',
    );
  }

  return context;
};
