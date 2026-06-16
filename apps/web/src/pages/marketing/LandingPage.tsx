import { CTA, Features, Footer, Hero, Navbar } from "../../components/landing";

export const LandingPage = () => (
  <main className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
    <Navbar />
    <Hero />
    <Features />
    <CTA />
    <Footer />
  </main>
);
