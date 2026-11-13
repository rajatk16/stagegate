import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet } from 'react-router';

import { paths } from '@/app/router/paths';
import { cn } from '@/lib/utils';
import { usePreferencesStore } from '@/stores/preferences.store';

import { StageGateLogo } from '../branding/StageGateLogo';
import { RouteFocus } from '../common/RouteFocus';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../ui/Button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '../ui/Sheet';

import { NavigationLinks } from './NavigationLinks';

import type { NavigationItem } from './navigationConfig';

interface Props {
  title: string;
  navigation: NavigationItem[];
  homePath: string;
  alternatePortal: {
    label: string;
    to: string;
  };
}

export const WorkspaceShell = ({ title, navigation, homePath, alternatePortal }: Props) => {
  const collapsed = usePreferencesStore((state) => state.sidebarCollapsed);

  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar);

  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-100 rounded-md bg-background p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>

      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col',
          'border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex',
          'transition-[width] duration-200',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-sidebar-border',
            collapsed ? 'justify-center' : 'px-4',
          )}
        >
          <StageGateLogo compact={collapsed} to={homePath} />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {!collapsed && (
            <p className="px-3 py-3 text-xs font-medium text-muted-foreground">{title}</p>
          )}

          <NavigationLinks items={navigation} collapsed={collapsed} />
        </div>

        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className={cn(!collapsed && 'w-full justify-start')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={toggleSidebar}
          >
            <SidebarIcon aria-hidden="true" />

            {!collapsed && 'Collapse sidebar'}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open navigation">
                    <Menu aria-hidden="true" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left">
                  <div className="space-y-3 border-b p-4">
                    <SheetTitle>{title}</SheetTitle>

                    <SheetDescription className="sr-only">
                      Navigate the StageGate workspace.
                    </SheetDescription>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3">
                    <NavigationLinks
                      items={navigation}
                      onNavigate={() => {
                        setMobileOpen(false);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <span className="truncate text-sm font-medium">{title}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={alternatePortal.to}>{alternatePortal.label}</Link>
            </Button>

            <ThemeToggle />
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          <RouteFocus />

          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>

        <footer className="flex items-center justify-between gap-4 border-t px-6 py-4 text-xs text-muted-foreground">
          <span>StageGate</span>

          <Link to={paths.home} className="hover:underline">
            Public website
          </Link>
        </footer>
      </div>
    </div>
  );
};
