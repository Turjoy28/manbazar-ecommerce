"use client";
import { Feature } from "@/types";

const IconMap: Record<string, React.ReactNode> = {
  1: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
    </svg>
  ),
  2: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  ),
  3: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M21 6.5l-4-4-14 14 4 4 14-14zm-14 11.5L4.5 15.5l10-10L17 9 7 18z"/>
    </svg>
  ),
  4: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
  ),
  5: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5l1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm11 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
    </svg>
  ),
  6: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h1v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-2v8h1c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
    </svg>
  ),
};

function FeatureCard({ feature, number }: { feature: Feature, number: number }) {
  return (
    <div className="flex flex-col items-start bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
      {/* Background number */}
      <span className="absolute top-3 right-3 text-5xl font-black text-gray-100 select-none pointer-events-none group-hover:text-orange-50 transition-colors">
        {number}
      </span>

      {/* Icon */}
      <div className="bg-primary text-(--primary-text) rounded-lg p-3 mb-3 z-10">
        {IconMap[number]}
      </div>

      {/* Text */}
      <h3 className="font-bold text-gray-800 text-sm md:text-base mb-1 z-10">
        {feature.title}
      </h3>
      <p className="text-gray-500 text-xs md:text-sm leading-relaxed z-10">
        {feature.description}
      </p>
    </div>
  );
}

export default function WhyUsSection({ specialty }: { specialty: any }) {
  return (
    <section className="py-4 px-4 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col items-center mb-4">
        <h3 className="text-primary font-bold text-sm tracking-widest uppercase mb-1">
          {specialty.subTitle}
        </h3>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
          {specialty?.title}
        </h2>
        <p className="text-gray-500 text-sm text-center max-w-xl">
          {specialty?.description}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {specialty?.cards?.map((feature: any, ind: number) => (
          <FeatureCard key={feature._id} feature={feature} number={ind+1}/>
        ))}
      </div>
    </section>
  );
}
