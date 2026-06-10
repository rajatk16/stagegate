import { Menu } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">
            StageGate
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-slate-300">
            Sign In
          </button>
        </div>

        <button className="md:hidden">
          <Menu />
        </button>
      </div>
    </header>
  );
};
