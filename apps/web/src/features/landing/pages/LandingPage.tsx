import { FAQ, Features, AnimatedHero, WorkflowDiagram } from '../components';

export const LandingPage = () => (
  <main className="bg-background">
    <AnimatedHero />
    <Features />
    <WorkflowDiagram />
    <FAQ />
  </main>
);
