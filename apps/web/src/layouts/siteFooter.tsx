import { AppVersion } from "@/components/custom";

export const SiteFooter = () => (
  <footer className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 border-t px-6 py-6 text-xs text-muted-foreground">
    <span>StageGate — Built one stage at a time</span>
    <AppVersion/>
  </footer>
);
