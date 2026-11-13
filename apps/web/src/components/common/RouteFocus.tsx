import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const RouteFocus = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const main = document.getElementById('main-content');

    main?.focus({
      preventScroll: true,
    });
  }, [pathname]);

  return null;
};
