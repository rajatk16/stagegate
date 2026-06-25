import slugify from 'slugify';

export const normalizeSlug = (value: string) => {
  return slugify(value, {
    trim: true,
    lower: true,
    strict: true,
  });
};
