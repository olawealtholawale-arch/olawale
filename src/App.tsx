import { useCallback, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SpacesSection } from './components/SpacesSection';
import { ExperienceSection } from './components/ExperienceSection';
import { InspectionBookingSection } from './components/InspectionBookingSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import type { EnquiryOption } from './types/booking';

export default function App() {
  const [preselectedSpace, setPreselectedSpace] = useState<EnquiryOption | null>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleSelectSpace = useCallback(
    (space: EnquiryOption) => {
      setPreselectedSpace(space);
      scrollToSection('inspection-booking');
    },
    [scrollToSection]
  );

  const handleClearPreselection = useCallback(() => {
    setPreselectedSpace(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5EFE6] text-[#16221C]">
      <div className="relative">
        <Navbar onBookInspection={() => scrollToSection('inspection-booking')} />
        <HeroSection
          onExploreSpaces={() => scrollToSection('spaces')}
          onBookInspection={() => scrollToSection('inspection-booking')}
        />
      </div>

      <main className="flex-1">
        <SpacesSection onSelectSpace={handleSelectSpace} />
        <ExperienceSection
          onBookInspection={() => scrollToSection('inspection-booking')}
        />
        <InspectionBookingSection
          preselectedSpace={preselectedSpace}
          onPreselectionApplied={handleClearPreselection}
        />
        <TestimonialsSection />
      </main>

      <Footer />
    </div>
  );
}
