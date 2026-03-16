import HeroSection from "@/components/hero-section";
import { Features } from "@/components/features";
import { CodeDemo } from "@/components/code-demo";
import { Frameworks } from "@/components/frameworks";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="dot-grid min-h-screen bg-background">
      <HeroSection />
      <Features />
      <CodeDemo />
      <Frameworks />
      <Footer />
    </div>
  );
}
