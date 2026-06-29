import { PageTransition, Slide } from '@/components/transitions';

import { FAQ, Features, AnimatedHero, WorkflowDiagram } from '../components';

export const LandingPage = () => (
  <PageTransition>
    <main className="bg-background">
      <Slide>
        <AnimatedHero />
      </Slide>
      <Features />
      <WorkflowDiagram />
      <FAQ />
    </main>
  </PageTransition>
);
