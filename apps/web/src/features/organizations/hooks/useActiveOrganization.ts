import { useOutletContext } from 'react-router';

import { Organization } from '../services';

export const useActiveOrganization = () => useOutletContext<Organization>();
