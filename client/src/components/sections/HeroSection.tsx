"use client";
import Logo from "../shared/Logo";

export default function HeroSection({ banner }: { banner: any }) {
  return (
    <section className="relative w-full min-h-105 md:min-h-130 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${banner?.bannerImage})`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-14 h-full min-h-105 md:min-h-130 px-4 text-center">
        {/* Brand name */}
        <Logo logo={banner.logo} />

        {/* Hero title */}
        <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold leading-snug max-w-5xl mb-8 font-sans">
          {banner.title}
        </h1>

        {/* CTA button */}
        <a
          href="#billing"
          className="bg-primary text-(--primary-text) hover:bg-primary/90 font-semibold px-8 py-3 rounded-xl transition-colors duration-200 text-sm md:text-lg cursor-pointer"
        >
          অর্ডার করতে চাই
        </a>
      </div>
    </section>
  );
}
