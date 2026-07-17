import React from "react";
import { Link } from "react-router-dom";

const AUDIENCES = [
  { label: 'Families', emoji: '👨‍👩‍👧‍👦', path: '/ReadinessQuiz' },
  { label: 'Equine', emoji: '🐎', path: '/equine' },
  { label: 'Canine', emoji: '🐕', path: '/canine' },
  { label: 'Feline', emoji: '🐈', path: '/feline' },
  { label: 'Infant', emoji: '👶', path: '/infant' },
  { label: 'Avian', emoji: '🦜', path: '/avian' },
  { label: 'Reptile', emoji: '🦎', path: '/reptile' },
  { label: 'Livestock', emoji: '🐄', path: '/livestock' },
];

export default function AudienceStories() {
  return (
    <section className="py-12 bg-[#F5F0E8] border-b border-[#D8D2C6]">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-2">Prepared for everyone</p>
        <h2 className="text-center font-serif text-2xl md:text-3xl font-bold text-[#1C1C1A] mb-8">Find your plan</h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {AUDIENCES.map(audience => (
            <Link key={audience.label} to={audience.path} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl border-2 border-[#D8D2C6] bg-white group-hover:border-[#D64A2E] group-hover:scale-105 transition-all">
                {audience.emoji}
              </div>
              <span className="text-xs font-sans font-semibold text-[#1C1C1A] group-hover:text-[#D64A2E] transition-colors">{audience.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}