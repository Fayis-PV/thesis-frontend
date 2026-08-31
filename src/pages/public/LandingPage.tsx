import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/features/home/HeroSection";
import { AboutSection } from "@/features/home/AboutSection";
import { LatestWorks } from "@/features/home/LatestWorks";
import { DepartmentalPathways } from "@/features/home/DepartmentalPathways";
import { VisionMission } from "@/features/home/VisionMission";
import { JournalSpotlight } from "@/features/home/JournalSpotlight";


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <LatestWorks />
        <DepartmentalPathways />
        <VisionMission />
        <JournalSpotlight />
      </main>
      <Footer />
    </div>
  );
}
