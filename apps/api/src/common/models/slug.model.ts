import z from 'zod';

import { SLUG_PATTERN } from '../constants';

export const slugSchema = z.string().min(3).max(63).regex(SLUG_PATTERN);
