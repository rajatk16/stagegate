import { parseEnvironment } from './envSchema';

export const env = parseEnvironment(import.meta.env);
