import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { BannerPromo, Language } from '../types/store';

interface BannerSliderProps {
  banners: BannerPromo[];
  language: Language;
  onBannerClick: (productId?: string) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  banners,
  language,
  onBannerClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0F1424] shadow-lg shadow-black/40 group select-none">
      {/* Banner Aspect Ratio Container */}
      <div
        onClick={() => onBannerClick(activeBanner.targetProductId)}
        className="relative aspect-[16/8.5] w-full cursor-pointer overflow-hidden"
      >
        <img
          src={activeBanner.image}
          alt={language === 'ar' ? activeBanner.titleAr : activeBanner.titleEn}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Cinematic Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20" />

        {/* Banner Content Overlay */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-black shadow-sm">
              <Zap className="w-3 h-3 fill-current" />
              {language === 'ar' ? activeBanner.badgeAr : activeBanner.badgeEn}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight drop-shadow-md">
            {language === 'ar' ? activeBanner.titleAr : activeBanner.titleEn}
          </h2>
          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 drop-shadow">
            {language === 'ar' ? activeBanner.subtitleAr : activeBanner.subtitleEn}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={language === 'ar' ? handleNext : handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={language === 'ar' ? handlePrev : handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {banners.map((b, idx) => (
          <button
            key={b.id}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
