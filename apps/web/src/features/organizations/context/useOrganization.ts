import { useContext } from 'react';

import { OrganizationContext } from './organizationContext';

export const useOrganization = () => {
  const context = useContext(OrganizationContext);

  if (context === null) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }

  return context;
};
