import React, { useState, useEffect } from 'react';
import { X, HelpCircle, ShieldAlert, Sparkles, Check, ChevronRight, ShoppingCart, Zap, Loader2, CheckCircle2, RefreshCw, Gamepad2 } from 'lucide-react';
import { Product, ProductBundle, Language, Currency } from '../types/store';
import { getTranslation } from '../data/translations';
import { verifyInGamePlayer, PlayerVerificationResult } from '../services/playerVerificationService';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  language: Language;
  currency: Currency;
  onProceedToCheckout: (
    product: Product,
    bundle: ProductBundle,
    playerId: string,
    nickname?: string,
    isVerified?: boolean,
    serverRegion?: string,
    playerLevel?: string
  ) => void;
  onAddToCart: (
    product: Product,
    bundle: ProductBundle,
    playerId: string,
    nickname?: string,
    isVerified?: boolean,
    serverRegion?: string,
    playerLevel?: string
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  language,
  currency,
  onProceedToCheckout,
  onAddToCart,
}) => {
  if (!product) return null;

  const t = getTranslation(language);
  const [selectedBundleId, setSelectedBundleId] = useState<string>(
    product.bundles.find((b) => b.popular)?.id || product.bundles[0].id
  );
  const [playerId, setPlayerId] = useState('');
  const [nickname, setNickname] = useState('');
  const [showIdHelp, setShowIdHelp] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState(false);

  // In-game player verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<PlayerVerificationResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Auto-inquire when player ID has 5+ digits (debounced)
  useEffect(() => {
    const cleanId = playerId.trim();
    if (!product.requiresPlayerId || cleanId.length < 5) {
      setVerifiedResult(null);
      setVerificationError(null);
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsVerifying(true);
      setVerificationError(null);
      try {
        const res = await verifyInGamePlayer(product.id, cleanId);
        if (!isCancelled) {
          setVerifiedResult(res);
          setNickname(res.playerName);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setVerificationError(err.message || 'فشل الاستعلام عن الحساب');
        }
      } finally {
        if (!isCancelled) {
          setIsVerifying(false);
        }
      }
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [playerId, product.id, product.requiresPlayerId]);

  const handleTriggerVerification = async () => {
    const cleanId = playerId.trim();
    if (!cleanId) {
      setValidationError(t.idRequiredError);
      return;
    }
    setIsVerifying(true);
    setVerificationError(null);
    try {
      const res = await verifyInGamePlayer(product.id, cleanId);
      setVerifiedResult(res);
      setNickname(res.playerName);
    } catch (err: any) {
      setVerificationError(err.message || 'فشل الاستعلام عن الحساب');
    } finally {
      setIsVerifying(false);
    }
  };

  const selectedBundle = product.bundles.find((b) => b.id === selectedBundleId) || product.bundles[0];

  const formatPrice = (dzd: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toFixed(2)}`;
    return `${dzd.toLocaleString()} ${t.currencyDZD}`;
  };

  const validateInput = (): boolean => {
    if (product.requiresPlayerId) {
      if (!playerId.trim() || playerId.trim().length < 4) {
        setValidationError(t.idRequiredError);
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleProceed = () => {
    if (!validateInput()) return;
    onProceedToCheckout(
      product,
      selectedBundle,
      playerId.trim(),
      nickname.trim() || verifiedResult?.playerName,
      Boolean(verifiedResult?.isVerified),
      verifiedResult?.serverRegion,
      verifiedResult?.level
    );
  };

  const handleAdd = () => {
    if (!validateInput()) return;
    onAddToCart(
      product,
      selectedBundle,
      playerId.trim(),
      nickname.trim() || verifiedResult?.playerName,
      Boolean(verifiedResult?.isVerified),
      verifiedResult?.serverRegion,
      verifiedResult?.level
    );
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#0D1220] rounded-t-3xl sm:rounded-3xl border border-slate-800 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="relative p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-[#0A0E1A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
              <img
                src={product.bannerImage || '/src/assets/images/chahndz_store_hero_1792845100871.jpg'}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/src/assets/images/chahndz_store_hero_1792845100871.jpg';
                }}
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {language === 'ar' ? product.titleAr : product.titleEn}
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                {t.deliverySpeed} {language === 'ar' ? product.deliveryTimeAr : product.deliveryTimeEn}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Section 1: Bundles / Denominations */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t.selectPackage}
              </span>
              <span className="text-[11px] text-slate-400">
                {product.bundles.length} {language === 'ar' ? 'باقات متوفرة' : 'packages available'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {product.bundles.map((bundle) => {
                const isSelected = bundle.id === selectedBundleId;
                return (
                  <button
                    key={bundle.id}
                    onClick={() => setSelectedBundleId(bundle.id)}
                    className={`relative p-3 rounded-xl border text-start transition-all flex flex-col justify-between select-none ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/15'
                        : bundle.popular
                        ? 'bg-amber-950/20 hover:bg-amber-950/30 border-amber-600/40 text-slate-200'
                        : bundle.bestValue
                        ? 'bg-cyan-950/20 hover:bg-cyan-950/30 border-cyan-600/40 text-slate-200'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    {/* High-visibility Promotional Badge: Most Popular (Orange) or Best Value (Cyan) */}
                    {bundle.popular && (
                      <span className="absolute -top-2.5 start-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/40 flex items-center gap-1 z-10 border border-amber-300">
                        <span>★</span>
                        <span>{t.badgeMostPopular}</span>
                      </span>
                    )}
                    {bundle.bestValue && !bundle.popular && (
                      <span className="absolute -top-2.5 start-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md shadow-cyan-500/40 flex items-center gap-1 z-10 border border-cyan-200">
                        <span>💎</span>
                        <span>{t.badgeBestValue}</span>
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">
                          {language === 'ar' ? bundle.nameAr : bundle.nameEn}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>

                      {bundle.bonus && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          {bundle.bonus}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-400 tabular-nums">
                        {formatPrice(bundle.priceDZD, bundle.priceUSD)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Player ID / Account Form & In-Game Verification */}
          {product.requiresPlayerId && (
            <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.playerIdLabel}</span>
                  <span className="text-amber-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowIdHelp(!showIdHelp)}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t.howToFindId}</span>
                </button>
              </div>

              {/* ID Guide accordion */}
              {showIdHelp && (
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-200 leading-relaxed">
                  {language === 'ar' ? product.idGuideAr : product.idGuideEn}
                </div>
              )}

              {/* Input with inline verify button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={playerId}
                    onChange={(e) => {
                      setPlayerId(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder={t.playerIdPlaceholder}
                    className={`w-full bg-[#0A0E1A] text-sm font-mono text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 border transition-all ${
                      validationError
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : verifiedResult
                        ? 'border-emerald-500/80 focus:border-emerald-400 ring-1 ring-emerald-500/20'
                        : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                  {verifiedResult && (
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold text-emerald-400 pointer-events-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleTriggerVerification}
                  disabled={isVerifying || !playerId.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span className="hidden sm:inline">{t.verifyPlayerNameBtn}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t.verifyPlayerNameBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {validationError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Inquiry Loading State */}
              {isVerifying && (
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center gap-2 text-xs text-cyan-300 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                  <span>{t.verifyingPlayer}</span>
                </div>
              )}

              {/* Verified In-Game Account Showcase Card */}
              {verifiedResult && !isVerifying && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#0C1A28] to-[#0A1820] border border-emerald-500/50 shadow-lg shadow-emerald-950/30 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-emerald-800/40 pb-1.5">
                    <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1.5 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.accountMatchedBadge}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {verifiedResult.gameTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                      🎮
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 block">{t.inGamePlayerName}</span>
                      <span className="text-sm font-black text-white font-mono tracking-wide truncate block">
                        {verifiedResult.playerName}
                      </span>
                      {(verifiedResult.serverRegion || verifiedResult.level) && (
                        <span className="text-[11px] text-cyan-300 font-medium block truncate">
                          {verifiedResult.serverRegion} {verifiedResult.level ? `· ${verifiedResult.level}` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-300/80 leading-relaxed bg-emerald-950/30 p-2 rounded-xl border border-emerald-500/20">
                    {t.instantVerificationNotice}
                  </p>
                </div>
              )}

              {/* In-game nickname display / optional manual override */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400 block">
                    {t.playerNicknameLabel}
                  </label>
                  {verifiedResult && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {language === 'ar' ? 'تم جلب الاسم تلقائياً' : 'Auto-fetched'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t.playerNicknamePlaceholder}
                  className="w-full bg-[#0A0E1A] text-sm text-white placeholder-slate-500 rounded-xl px-3.5 py-2 border border-slate-800 focus:border-amber-500 transition-all font-mono"
                />
              </div>
            </div>
          )}

          {/* Description Prose */}
          <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/30 p-3 rounded-xl border border-slate-800/40">
            {language === 'ar' ? product.descriptionAr : product.descriptionEn}
          </div>
        </div>

        {/* Pinned Bottom Actions: Add to Cart + Direct Buy */}
        <div className="p-4 border-t border-slate-800 bg-[#0A0E1A] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-slate-400">{t.totalAmount}</span>
            <span className="text-base font-extrabold text-amber-400 tabular-nums">
              {formatPrice(selectedBundle.priceDZD, selectedBundle.priceUSD)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Complementary: Add to Cart */}
            <button
              onClick={handleAdd}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                addedToast
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80 shadow-sm'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {addedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t.addedToCartSuccess}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t.addToCart}</span>
                </>
              )}
            </button>

            {/* Prominent: Buy Now */}
            <button
              onClick={handleProceed}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-current shrink-0" />
              <span>{t.buyNow}</span>
              <ChevronRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
