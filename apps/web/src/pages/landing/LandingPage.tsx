import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { Navbar } from '@/components/landing/Navbar';
import { Features } from '@/components/landing/Features';
import { AnimatedHero } from '@/components/landing/AnimatedHero';
import { WorkflowDiagram } from '@/components/landing/WorkflowDiagram';

export const LandingPage = () => (
  <main className="bg-background">
    <Navbar />
    <AnimatedHero />
    <Features />
    <WorkflowDiagram />
    <FAQ />
    <Footer />
  </main>
);
