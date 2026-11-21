import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface ExperienceSectionProps {
  onBookInspection: () => void;
}

export function ExperienceSection({ onBookInspection }: ExperienceSectionProps) {
  const [bathFailed, setBathFailed] = useState(false);
  const [loungeFailed, setLoungeFailed] = useState(false);

  return (
    <section
      id="experience"
      className="bg-[#143A2C] text-[#F5EFE6] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6 items-start">
            <div className="mt-8 sm:mt-12 aspect-[3/4] overflow-hidden bg-[#0E291F] border border-[#F5EFE6]/10">
              {!bathFailed ? (
                <img
                  src="/src/assets/images/wealth_experience_bath_1795298414320.jpg"
                  alt="Limestone and emerald green marble hotel suite bathroom"
                  referrerPolicy="no-referrer"
                  onError={() => setBathFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-b from-[#1A4B38] to-[#0E291F]" />
              )}
            </div>

            <div className="aspect-[3/4] overflow-hidden bg-[#0E291F] border border-[#F5EFE6]/10">
              {!loungeFailed ? (
                <img
                  src="/src/assets/images/wealth_experience_lounge_1795298413740.jpg"
                  alt="Archway courtyard dining lounge with emerald velvet sofas"
                  referrerPolicy="no-referrer"
                  onError={() => setLoungeFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-b from-[#2E1A39] to-[#0E291F]" />
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            <h2
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.12] text-[#F5EFE6]"
              style={{ textWrap: 'balance' }}
            >
              The Luxury Experience You&apos;ll Remember
            </h2>

            <div className="mt-4 h-0.5 w-10 bg-[#A875BD]" />

            <p className="mt-6 text-sm sm:text-base leading-relaxed text-[#E4DDD0]">
              From tranquil overnight stays in Ikorodu to landmark weddings and executive retreats
              on Lagos Island, every residence inside Wealth Group of Hotel is crafted around
              natural limestone textures, acoustic calm, and attentive hospitality.
            </p>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#D0C8B8]">
              Walk our halls, preview suite layouts, and discuss your celebration or extended-stay
              budget directly with our property team during a scheduled on-site tour.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={onBookInspection}
                className="inline-flex items-center gap-2 border border-[#F5EFE6]/45 bg-[#5B2D6E] hover:bg-[#472157] text-[#F5EFE6] text-xs font-semibold uppercase tracking-[0.16em] px-7 py-3.5 transition-colors duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B9E4]"
              >
                <span>Schedule Inspection</span>
                <ChevronRight className="w-4 h-4 text-[#D7B9E4]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
