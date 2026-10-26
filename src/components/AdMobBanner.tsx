import React, { useState } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { Language } from '../types/store';

interface AdMobBannerProps {
  language: Language;
  onOpenInterstitial?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  language,
  onOpenInterstitial,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="flex justify-center my-2">
        <button
          onClick={() => setDismissed(false)}
          className="text-[10px] text-slate-500 hover:text-slate-400 underline"
        >
          {language === 'ar' ? 'إظهار مساحة الإعلان (AdMob Test)' : 'Show Ad Space (AdMob Test)'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative my-3 mx-1 bg-gradient-to-r from-[#0C1222] via-[#10172B] to-[#0C1222] rounded-xl p-2.5 border border-slate-800 shadow-sm overflow-hidden select-none">
      {/* Sponsored Pill */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
          {language === 'ar' ? 'إعلان راعي · AdMob Banner' : 'Sponsored · AdMob 320x50'}
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-300 p-0.5"
          aria-label="Dismiss Ad"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Ad Content */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shrink-0 text-black font-extrabold text-xs shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">
              {language === 'ar' ? 'خصم 5% على أول طلب شحن!' : 'Get 5% Off Your Next Top-Up!'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {language === 'ar' ? 'اضغط لمشاهدة الإعلان وتفعيل كود التخفيض' : 'Tap to preview interstitial reward ad'}
            </p>
          </div>
        </div>

        {onOpenInterstitial && (
          <button
            onClick={onOpenInterstitial}
            className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1"
          >
            <span>{language === 'ar' ? 'تفعيل' : 'Claim'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
