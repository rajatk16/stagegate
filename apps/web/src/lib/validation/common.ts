import { z } from 'zod';

export const requiredString = (min = 1, max = 255) =>
  z.string().trim().min(min).max(max);

export const optionalString = (max = 255) =>
  z.string().trim().max(max).optional();

export const optionalUrl = () =>
  z.string().trim().url().optional().or(z.literal(''));
