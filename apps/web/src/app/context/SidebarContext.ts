import { createContext } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);
