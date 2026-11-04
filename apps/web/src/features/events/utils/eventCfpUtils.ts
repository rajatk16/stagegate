export const parseSubmissionLimit = (value: string): number | null => {
  const text = value.trim();

  if (text === '') return null;

  const limit = Number(text);

  if (!/^\d+$/.test(text) || !Number.isSafeInteger(limit) || limit < 1) {
    throw new RangeError(
      'Enter a positive whole number, or leave blank for no limit',
    );
  }

  return limit;
};
