import { Outlet } from 'react-router-dom';

import { useNavigation } from '@/app/hooks';
import { SidebarProvider } from '@/app/providers/SidebarProvider';

import { TopNavigation, AppSidebar } from '../navigation';
import { MobileSidebar } from '../navigation/Sidebar/MobileSidebar';

export const AppLayout = () => {
  const navigation = useNavigation();
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar navigation={navigation} />
        <MobileSidebar navigation={navigation} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavigation />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
