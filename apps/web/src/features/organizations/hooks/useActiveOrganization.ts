import { useOutletContext } from 'react-router';

import { Organization } from '../types';

export const useActiveOrganization = () => useOutletContext<Organization>();
