import { AppHeader } from './AppHeader';
import { AppContent } from './AppContent';
import { AppSidebar } from './AppSidebar';

export const AppLayout = () => (
  <div className="flex h-screen overflow-hidden">
    <AppSidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <AppContent />
    </div>
  </div>
);
