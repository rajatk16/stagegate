import { publicNavigation } from './publicNavigation';

export const DesktopNavigation = () => (
  <nav className="hidden items-center gap-8 lg:flex">
    {publicNavigation.map((item) => (
      <a
        key={item.label}
        href={item.href}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {item.label}
      </a>
    ))}
  </nav>
);
