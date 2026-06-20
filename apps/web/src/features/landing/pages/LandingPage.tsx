import {
  FAQ,
  Footer,
  Navbar,
  Features,
  AnimatedHero,
  WorkflowDiagram,
} from '../components';

const LandingPage = () => (
  <main className="bg-background">
    <Navbar />
    <AnimatedHero />
    <Features />
    <WorkflowDiagram />
    <FAQ />
    <Footer />
  </main>
);

export default LandingPage;
