import { useState } from 'react';
import { Quote } from 'lucide-react';

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      'They were extraordinarily accommodating during our Lagos Island inspection and arranged every detail for our 350-guest reception without delay. Both our banquet hall and family suites exceeded expectations.',
    author: 'Folake Adeyemi',
    role: 'Bride & Event Host · Lagos Island',
  },
  {
    quote:
      'Our executive team stayed in the Ikorodu short-let apartments for three weeks while opening a new branch. Quiet mornings, spotless housekeeping, and reliable concierge support made it effortless.',
    author: 'Chukwuma Okafor',
    role: 'Operations Director · Sterling Logistics',
  },
  {
    quote:
      'Booking an on-site hall walkthrough was seamless. We toured the acoustic stage setup, confirmed catering space, and locked in our corporate summit dates in a single afternoon.',
    author: 'Tunde Balogun',
    role: 'Head of Programs · West Coast Forum',
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = TESTIMONIALS[activeIndex];

  return (
    <section
      id="testimonials"
      className="relative bg-[#111A16] text-[#F5EFE6] py-20 sm:py-24 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/src/assets/images/wealth_hero_suite_1795298413526.jpg')",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#0E1713]/92 via-[#15121A]/88 to-[#0B120F]/95"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5EFE6]">
          Testimonials
        </h2>
        <div className="mx-auto mt-3 h-0.5 w-10 bg-[#A875BD]" />

        <div className="mt-10 flex justify-center">
          <Quote className="w-7 h-7 text-[#D8C5A8]" strokeWidth={1.5} />
        </div>

        <blockquote className="mt-6 font-display italic text-xl sm:text-2xl md:text-[1.7rem] leading-relaxed text-[#F5EFE6]/95">
          &ldquo;{current.quote}&rdquo;
        </blockquote>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#D8C5A8]">
          {current.author}
        </p>
        <p className="mt-1 text-xs text-[#BEB4A2]">{current.role}</p>

        <div
          className="mt-8 flex items-center justify-center gap-2.5"
          role="tablist"
          aria-label="Guest Testimonials"
        >
          {TESTIMONIALS.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.author}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`View testimonial from ${item.author}`}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'w-6 bg-[#A875BD]'
                    : 'w-2 bg-[#F5EFE6]/35 hover:bg-[#F5EFE6]/65'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
