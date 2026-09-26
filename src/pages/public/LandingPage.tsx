import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrowseByDepartment } from "@/features/home/BrowseByDepartment";
import { BrowseByCategories } from "@/features/home/BrowseByCategories";
import { BestWorksSpotlight } from "@/features/home/BestWorksSpotlight";
import { AboutSection } from "@/features/home/AboutSection";
import { VisionMission } from "@/features/home/VisionMission";
import { HeroSection } from "@/features/home/HeroSection";


export default function LandingPage() {
  

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow">
        <HeroSection />

        {/* Browse by Department Section */}
        <BrowseByDepartment />

        {/* Browse by Categories Section (Sorted by Most Visits) */}
        <BrowseByCategories />

        {/* Best Works Spotlight Section */}
        <BestWorksSpotlight />

        <AboutSection />
        <VisionMission />
      </main>

      <Footer />
    </div>
  );
}
