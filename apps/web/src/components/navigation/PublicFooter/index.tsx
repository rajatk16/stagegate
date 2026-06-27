import { FooterBrand } from './FooterBrand';
import { FooterLinks } from './FooterLinks';

export const PublicFooter = () => {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <FooterBrand />

          <FooterLinks />
        </div>

        <div className="mt-16 border-t pt-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} StageGate. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
