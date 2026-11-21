import { useState } from 'react';
import { ChevronRight, Building2, BedDouble, Sparkles } from 'lucide-react';
import type { EnquiryOption } from '../types/booking';

interface SpaceCardItem {
  id: EnquiryOption;
  title: string;
  meta: string;
  description: string;
  image: string;
  alt: string;
}

const SPACES: SpaceCardItem[] = [
  {
    id: 'Hotel Room',
    title: 'Hotel Room',
    meta: '2 Guests · 420 sq ft · Daily Concierge',
    description:
      'Refined king and executive suites featuring Egyptian cotton linens, calm travertine bathrooms, and 24-hour room dining.',
    image: '/src/assets/images/wealth_hotel_room_1795298414533.jpg',
    alt: 'Wealth Group of Hotel boutique bedroom with emerald velvet headboard and beige linen bedding',
  },
  {
    id: 'Event Hall',
    title: 'Event Hall',
    meta: 'Up to 600 Guests · Acoustic Stage · Banquet',
    description:
      'Columned celebration halls designed for weddings, galas, and executive summits with custom floral staging and lighting.',
    image: '/src/assets/images/wealth_event_hall_1795298413456.jpg',
    alt: 'Grand banquet and event hall with warm beige drapery, chandeliers, and emerald-plum floral tables',
  },
  {
    id: 'Short Let Apartment',
    title: 'Short Let Apartment',
    meta: '2 & 3 Bedrooms · Private Lounge · Kitchen',
    description:
      'Fully serviced residences offering private dining spaces, high-speed fiber internet, and serene gated security.',
    image: '/src/assets/images/wealth_shortlet_apartment_1795298414389.jpg',
    alt: 'Luxury serviced short-let apartment living room with green sectional sofa and plum accent chair',
  },
];

interface SpacesSectionProps {
  onSelectSpace: (space: EnquiryOption) => void;
}

export function SpacesSection({ onSelectSpace }: SpacesSectionProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section
      id="spaces"
      className="relative bg-[#111A16] py-20 sm:py-24 text-[#F5EFE6] overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-15 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/src/assets/images/wealth_hotel_room_1795298414533.jpg')",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#0E1713]/90 via-[#111A16]/85 to-[#0E1713]/95"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F5EFE6]">
            Our Rooms &amp; Event Spaces
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-10 bg-[#8F5AA4]" />
          <p className="mt-4 text-sm sm:text-base text-[#D8CFC0] leading-relaxed">
            Available for private guided tours across our Ikorodu and Lagos Island properties.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-7">
          {SPACES.map((space) => {
            const imgFailed = Boolean(failedImages[space.id]);
            return (
              <article
                key={space.id}
                className="flex flex-col bg-[#1A2620]/95 border border-[#F5EFE6]/12 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#14201B]">
                  {!imgFailed ? (
                    <img
                      src={space.image}
                      alt={space.alt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [space.id]: true }))
                      }
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#143A2C] to-[#2B1734] text-[#F5EFE6]/80 px-4 text-center">
                      {space.id === 'Event Hall' ? (
                        <Sparkles className="w-7 h-7 text-[#D8C5A8]" />
                      ) : space.id === 'Short Let Apartment' ? (
                        <Building2 className="w-7 h-7 text-[#D8C5A8]" />
                      ) : (
                        <BedDouble className="w-7 h-7 text-[#D8C5A8]" />
                      )}
                      <span className="font-display text-lg">{space.title}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="text-xs text-[#CBBFA9] tracking-wide">
                    {space.meta}
                  </p>

                  <h3 className="mt-2.5 font-sans-body text-base font-semibold uppercase tracking-[0.12em] text-[#F5EFE6]">
                    {space.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#D2C9B8]">
                    {space.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-[#F5EFE6]/10">
                    <button
                      type="button"
                      onClick={() => onSelectSpace(space.id)}
                      className="w-full inline-flex items-center justify-center gap-2 border border-[#A875BD]/60 bg-[#5B2D6E]/20 hover:bg-[#5B2D6E] text-[#F5EFE6] text-xs font-semibold uppercase tracking-[0.14em] px-5 py-3 transition-colors duration-200 cursor-pointer whitespace-nowrap"
                    >
                      <span>Book Inspection</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#D7B9E4]" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
