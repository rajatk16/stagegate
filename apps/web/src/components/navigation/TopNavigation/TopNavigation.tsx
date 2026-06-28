import { TopNavigationEnd } from './TopNavigationEnd';
import { TopNavigationStart } from './TopNavigationStart';

export const TopNavigation = () => {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-6">
      <TopNavigationStart />
      <TopNavigationEnd />
    </header>
  );
};
