import { Button } from '@/components/ui';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const Navbar = () => (
  <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
    <div className="container mx-auto flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">StageGate</span>
      </div>
      <div className="flex gap-3">
        <ThemeToggle />
        <Button variant="ghost">Login/Signup</Button>
      </div>
    </div>
  </header>
);
