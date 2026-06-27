import { Link } from 'react-router-dom';

import { footerNavigation } from './footerNavigation';

export const FooterLinks = () => (
  <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
    {footerNavigation.map((section) => (
      <div key={section.title}>
        <h3 className="mb-4 font-semibold">{section.title}</h3>

        <ul className="space-y-2">
          {section.links.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
