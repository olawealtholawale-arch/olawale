import { useState } from 'react';
import { Clock, Headphones, Instagram, Facebook, Twitter, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onExploreSpaces: () => void;
  onBookInspection: () => void;
}

export function HeroSection({ onExploreSpaces, onBookInspection }: HeroSectionProps) {
  const [heroLoaded, setHeroLoaded] = useState(true);

  return (
    <section id="top" className="relative w-full">
      <div className="relative min-h-[640px] lg:min-h-[760px] flex items-center bg-[#121E18] overflow-hidden">
        {heroLoaded && (
          <img
            src="/src/assets/images/wealth_hero_suite_1795298413526.jpg"
            alt="Wealth Group of Hotel penthouse suite with emerald green velvet sofa and beige travertine walls"
            referrerPolicy="no-referrer"
            onError={() => setHeroLoaded(false)}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0C1611]/90 via-[#0C1611]/60 to-[#0C1611]/30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0C1611]/75 via-transparent to-[#0C1611]/55"
        />

        <div
          aria-hidden="true"
          className="hidden lg:flex flex-col items-center gap-5 absolute left-6 top-1/2 -translate-y-1/2 z-20 text-[#F5EFE6]/75"
        >
          <a
            href="#inspection-booking"
            aria-label="Follow on Facebook"
            className="hover:text-white transition-colors p-1"
          >
            <Facebook className="w-3.5 h-3.5" />
          </a>
          <a
            href="#inspection-booking"
            aria-label="Follow on Twitter"
            className="hover:text-white transition-colors p-1"
          >
            <Twitter className="w-3.5 h-3.5" />
          </a>
          <a
            href="#inspection-booking"
            aria-label="Follow on Instagram"
            className="hover:text-white transition-colors p-1"
          >
            <Instagram className="w-3.5 h-3.5" />
          </a>
          <span className="h-8 w-px bg-[#F5EFE6]/30" />
          <button
            type="button"
            onClick={onBookInspection}
            className="text-[11px] uppercase tracking-[0.22em] text-[#F5EFE6]/85 hover:text-white transition-colors cursor-pointer [writing-mode:vertical-rl] rotate-180"
          >
            Book Now
          </button>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-20 lg:pl-16">
          <div className="max-w-xl">
            <h1
              className="font-display text-[#F5EFE6] font-semibold leading-[1.06] tracking-tight"
              style={{
                fontSize: 'clamp(2.65rem, 4.8vw, 4.35rem)',
                textWrap: 'balance',
              }}
            >
              Where Quiet Luxury Meets Grand Celebrations
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#E6DDD0] max-w-lg font-normal">
              Wealth Group of Hotel offers serene hotel suites, grand event halls, and serviced
              short-let apartments across Ikorodu and Lagos Island.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreSpaces}
                className="bg-[#5B2D6E] hover:bg-[#472157] text-[#F5EFE6] text-xs font-semibold uppercase tracking-[0.16em] px-7 py-3.5 transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B9E4]"
              >
                Choose Space
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#143A2C] text-[#F5EFE6] border-t border-[#F5EFE6]/10">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#F5EFE6]/15">
          <div className="flex items-center gap-4 px-6 py-6 sm:py-7">
            <Clock className="w-6 h-6 text-[#D8C5A8] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D8C5A8]">
                Inspection Hours
              </p>
              <p className="mt-1 text-sm text-[#F5EFE6] tabular-nums">
                Monday – Sunday: 09:00 – 18:00
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-6 sm:py-7">
            <MapPin className="w-6 h-6 text-[#D8C5A8] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D8C5A8]">
                Our Locations
              </p>
              <p className="mt-1 text-sm text-[#F5EFE6]">
                Ikorodu Mainland &amp; Lagos Island
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-6 sm:py-7">
            <Headphones className="w-6 h-6 text-[#D8C5A8] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D8C5A8]">
                Guest Concierge
              </p>
              <p className="mt-1 text-sm text-[#F5EFE6] tabular-nums">
                +234 800 932 5840
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
