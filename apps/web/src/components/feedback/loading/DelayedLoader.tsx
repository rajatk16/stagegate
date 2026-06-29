import { useEffect, useState, type PropsWithChildren } from 'react';

interface DelayedLoaderProps {
  delay?: number;
  loading: boolean;
}

export const DelayedLoader = ({
  delay = 200,
  ...props
}: PropsWithChildren<DelayedLoaderProps>) => {
  const [showDelayed, setShowDelayed] = useState(false);

  useEffect(() => {
    if (!props.loading) {
      return;
    }

    const timeout = setTimeout(() => setShowDelayed(true), delay);

    return () => {
      clearTimeout(timeout);
      setShowDelayed(false);
    };
  }, [props.loading, delay]);

  if (!props.loading || !showDelayed) return null;

  return <>{props.children}</>;
};
