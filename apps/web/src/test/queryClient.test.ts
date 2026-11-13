import { describe, expect, it } from 'vitest';

import { createQueryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';

describe('query client', () => {
  it('configures the default stale time', () => {
    const client = createQueryClient();

    expect(client.getDefaultOptions().queries?.staleTime).toBe(60_000);
  });

  it('configures the garbage collection time', () => {
    const client = createQueryClient();

    expect(client.getDefaultOptions().queries?.gcTime).toBe(300_000);
  });

  it('does not automatically retry mutations', () => {
    const client = createQueryClient();

    expect(client.getDefaultOptions().mutations?.retry).toBe(false);
  });

  it('creates independent query clients', () => {
    expect(createQueryClient()).not.toBe(createQueryClient());
  });
});

describe('query keys', () => {
  it('generates organization-specific keys', () => {
    expect(queryKeys.organizations.detail('react-india')).toEqual(['organizations', 'react-india']);
  });

  it('isolates events belonging to different organizations', () => {
    expect(queryKeys.events.detail('organization-a', 'conference')).not.toEqual(
      queryKeys.events.detail('organization-b', 'conference'),
    );
  });

  it('supports tenant-scoped event invalidation', () => {
    expect(queryKeys.events.all('react-india')).toEqual(['organizations', 'react-india', 'events']);
  });
});
