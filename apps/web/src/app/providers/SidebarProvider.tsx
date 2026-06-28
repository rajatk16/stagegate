import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { SidebarContext } from '../context';

const STORAGE_KEY = 'stagegate.sidebar.collapsed';

const readCollapsedFromStorage = (): boolean => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'true';
};

export const SidebarProvider = (props: PropsWithChildren) => {
  const [collapsed, setCollapsed] = useState(readCollapsedFromStorage);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const value = useMemo(
    () => ({
      collapsed,
      mobileOpen,
      toggleSidebar: () => setCollapsed((v) => !v),
      closeMobileSidebar: () => setMobileOpen(false),
      toggleMobileSidebar: () => setMobileOpen((v) => !v),
    }),
    [collapsed, mobileOpen],
  );

  return (
    <SidebarContext.Provider value={value}>
      {props.children}
    </SidebarContext.Provider>
  );
};
