import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { getOrganizationLogo } from '../services';

type Props = {
  user: User;
  organizationId: string;
  version: string | null;
  name: string;
};

const LoadedLogo = ({ user, organizationId, name }: Props) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;

    const load = async () => {
      try {
        const image = await getOrganizationLogo(
          user,
          organizationId,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        objectUrl = URL.createObjectURL(image);

        setUrl(objectUrl);
      } catch {}
    };

    void load();

    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user, organizationId]);

  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted font-semibold">
      {url ? (
        <img
          src={url}
          alt={`${name} logo`}
          className="size-full object-contain p-1"
          onError={() => setUrl(null)}
        />
      ) : (
        <span aria-label="Logo unavailable">
          {Array.from(name.trim().toUpperCase() || '0')}
        </span>
      )}
    </div>
  );
};

export const OrganizationLogo = (props: Props) =>
  props.version ? (
    <LoadedLogo
      key={`${props.user.uid}:${props.organizationId}:${props.version}`}
      {...props}
    />
  ) : (
    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border bg-muted font-semibold">
      {Array.from(props.name.trim()[0]?.toUpperCase() || '0')}
    </div>
  );
