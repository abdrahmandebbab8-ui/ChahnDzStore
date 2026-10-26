import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Gift } from 'lucide-react';
import { Language } from '../types/store';
import { getTranslation } from '../data/translations';

interface AdMobInterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onApplyDiscount?: (code: string) => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  isOpen,
  onClose,
  language,
  onApplyDiscount,
}) => {
  if (!isOpen) return null;

  const t = getTranslation(language);
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    setCountdown(5);
    setCanClose(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClaim = () => {
    setClaimed(true);
    if (onApplyDiscount) {
      onApplyDiscount('CHAHNDZ5');
    }
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-sm bg-[#0E1424] rounded-3xl border border-slate-700/80 p-6 flex flex-col items-center text-center shadow-2xl space-y-4">
        {/* Top bar with timer / close */}
        <div className="w-full flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            AdMob Interstitial Reward (Test Ad)
          </span>

          {canClose ? (
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              aria-label="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40">
              {countdown}s
            </span>
          )}
        </div>

        {/* Ad Graphic / Hero */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-black shadow-xl shadow-amber-500/20">
          <Gift className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-white">
            {t.interstitialTitle}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {t.interstitialDesc}
          </p>
        </div>

        {/* Promo code display */}
        <div className="w-full bg-[#080B14] p-3 rounded-xl border border-dashed border-amber-500/40 flex items-center justify-between px-4">
          <span className="text-xs text-slate-400">Coupon:</span>
          <span className="font-mono text-sm font-extrabold text-amber-400 tracking-wider">
            CHAHNDZ5
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="w-full space-y-2 pt-2">
          <button
            onClick={handleClaim}
            disabled={!canClose || claimed}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              canClose && !claimed
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {claimed ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'تم تفعيل كود الخصم!' : 'Discount Applied!'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.claimDiscount}</span>
              </>
            )}
          </button>

          {canClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white underline pt-1 block mx-auto"
            >
              {t.closeAd}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
