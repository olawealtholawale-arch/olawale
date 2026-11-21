export function Footer() {
  return (
    <footer className="bg-[#0B130F] text-[#BFB6A6] border-t border-[#F5EFE6]/10">
      <div className="mx-auto max-w-6xl px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} Wealth Group of Hotel &mdash; Ikorodu &amp; Lagos Island
        </p>

        <div className="flex items-center gap-6">
          <a href="#spaces" className="hover:text-[#F5EFE6] transition-colors">
            Spaces
          </a>
          <a href="#experience" className="hover:text-[#F5EFE6] transition-colors">
            Experience
          </a>
          <a href="#inspection-booking" className="hover:text-[#F5EFE6] transition-colors">
            Book Inspection
          </a>
          <a href="#testimonials" className="hover:text-[#F5EFE6] transition-colors">
            Reviews
          </a>
        </div>
      </div>
    </footer>
  );
}
