export interface QueryKeyFactory<TRoot extends readonly unknown[]> {
  all: TRoot;
  lists(): readonly [...TRoot, 'list'];
  details(): readonly [...TRoot, 'detail'];
}

export const createQueryKeys = <const TRoot extends readonly unknown[]>(
  ...root: TRoot
): QueryKeyFactory<TRoot> => ({
  all: root,
  lists: () => [...root, 'list'],
  details: () => [...root, 'detail'],
});
