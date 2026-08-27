import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Header & Navigation */}
      <Navbar />

      {/* Main Page Sections */}
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
