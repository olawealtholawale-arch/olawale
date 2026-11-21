import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onBookInspection: () => void;
}

export function Navbar({ onBookInspection }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-6">
        <a
          href="#top"
          className="font-display text-2xl sm:text-3xl font-semibold italic tracking-tight text-[#F5EFE6] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A875BD]"
        >
          Wealth Group of Hotel
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#F5EFE6]/90"
        >
          <a
            href="#spaces"
            className="hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap shrink-0"
          >
            Spaces
          </a>
          <a
            href="#experience"
            className="hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap shrink-0"
          >
            Experience
          </a>
          <a
            href="#inspection-booking"
            className="hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap shrink-0"
          >
            Inspection
          </a>
          <a
            href="#testimonials"
            className="hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap shrink-0"
          >
            Reviews
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBookInspection}
            className="hidden sm:inline-flex items-center justify-center bg-[#5B2D6E] hover:bg-[#472157] text-[#F5EFE6] text-xs font-semibold uppercase tracking-[0.14em] px-5 py-2.5 transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B9E4]"
          >
            Book Inspection
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#F5EFE6] hover:bg-white/10 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden mx-4 bg-[#111D17]/95 backdrop-blur-md border border-[#F5EFE6]/15 px-6 py-5 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#F5EFE6]">
            <button
              type="button"
              onClick={() => handleNavClick('spaces')}
              className="text-left py-2 border-b border-white/10"
            >
              Spaces
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('experience')}
              className="text-left py-2 border-b border-white/10"
            >
              Experience
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('inspection-booking')}
              className="text-left py-2 border-b border-white/10"
            >
              Inspection
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('testimonials')}
              className="text-left py-2 border-b border-white/10"
            >
              Reviews
            </button>
          </nav>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onBookInspection();
            }}
            className="w-full bg-[#5B2D6E] hover:bg-[#472157] text-[#F5EFE6] text-xs font-semibold uppercase tracking-[0.14em] px-5 py-3 transition-colors"
          >
            Book Inspection
          </button>
        </div>
      )}
    </header>
  );
}
