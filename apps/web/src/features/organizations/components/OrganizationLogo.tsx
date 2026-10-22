import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { isAccessError, useOrganizationLogoQuery } from '@/app/query';

type Props = {
  user: User;
  organizationId: string;
  version: string | null;
  name: string;
};

type ImageState = {
  blob: Blob;
  url: string;
};

const initial = (name: string) =>
  Array.from(name.trim())[0]?.toUpperCase() ?? 'O';

const LoadedLogo = ({ user, organizationId, version, name }: Props) => {
  const query = useOrganizationLogoQuery(user, organizationId, version);

  const blob = isAccessError(query.error) ? undefined : query.data;
  const [image, setImage] = useState<ImageState | null>(null);

  useEffect(() => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    setImage({ blob, url });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  const url = image !== null && image.blob === blob ? image.url : null;

  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted font-semibold">
      {url ? (
        <img
          src={url}
          alt={`${name} logo`}
          className="size-full object-contain p-1"
          onError={() => setImage(null)}
        />
      ) : (
        <span aria-label="Logo unavailable">{initial(name)}</span>
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
      {initial(props.name)}
    </div>
  );
