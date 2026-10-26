import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Ticket, AlertCircle, Check, CheckCircle2 } from 'lucide-react';
import { CartItem, Language, Currency, Coupon } from '../types/store';
import { getTranslation } from '../data/translations';

interface CartViewProps {
  cart: CartItem[];
  language: Language;
  currency: Currency;
  coupons?: Coupon[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onStartShopping: () => void;
  onCheckoutCart: (appliedCoupon?: Coupon | null) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  language,
  currency,
  coupons = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onStartShopping,
  onCheckoutCart,
}) => {
  const t = getTranslation(language);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const rawTotalDZD = cart.reduce((acc, item) => acc + item.bundle.priceDZD * item.quantity, 0);
  const rawTotalUSD = cart.reduce((acc, item) => acc + item.bundle.priceUSD * item.quantity, 0);

  // Real-time discount calculation
  let discountDZD = 0;
  let discountUSD = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountDZD = Math.round(rawTotalDZD * (appliedCoupon.discountValue / 100));
      discountUSD = Number((rawTotalUSD * (appliedCoupon.discountValue / 100)).toFixed(2));
    } else {
      discountDZD = Math.min(rawTotalDZD, appliedCoupon.discountValue);
      discountUSD = appliedCoupon.discountValueUSD !== undefined
        ? Math.min(rawTotalUSD, appliedCoupon.discountValueUSD)
        : Number(Math.min(rawTotalUSD, appliedCoupon.discountValue / 200).toFixed(2));
    }
  }

  const finalTotalDZD = Math.max(0, rawTotalDZD - discountDZD);
  const finalTotalUSD = Math.max(0, Number((rawTotalUSD - discountUSD).toFixed(2)));

  const handleApplyCoupon = () => {
    const code = couponCodeInput.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!code) return;
    setCouponError(null);
    setCouponSuccess(null);

    const match = coupons.find((c) => c.code.toUpperCase() === code);
    if (!match) {
      setCouponError(t.promoInvalid);
      return;
    }

    if (!match.isActive) {
      setCouponError(t.promoInactive);
      return;
    }

    if (match.expiresAt) {
      const today = new Date().toISOString().split('T')[0];
      if (today > match.expiresAt) {
        setCouponError(t.promoExpired);
        return;
      }
    }

    if (match.usageLimit && match.usedCount >= match.usageLimit) {
      setCouponError(t.promoLimitReached);
      return;
    }

    if (match.minOrderDZD && rawTotalDZD < match.minOrderDZD) {
      setCouponError(`${t.promoMinOrderNotMet} ${match.minOrderDZD.toLocaleString()} ${t.currencyDZD}`);
      return;
    }

    setAppliedCoupon(match);
    setCouponSuccess(
      language === 'ar'
        ? `تم تطبيق الكود "${match.code}" بنجاح!`
        : `Coupon "${match.code}" applied!`
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccess(null);
    setCouponCodeInput('');
  };

  const formatPrice = (dzd: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toFixed(2)}`;
    return `${dzd.toLocaleString()} ${t.currencyDZD}`;
  };

  if (cart.length === 0) {
    return (
      <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 my-8">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-xl">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{t.emptyCartTitle}</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
            {t.emptyCartDesc}
          </p>
        </div>
        <button
          onClick={onStartShopping}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
        >
          {t.startShopping}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-bold text-white">{t.cartTitle}</h2>
          <span className="text-xs text-slate-400 font-mono">({cart.length})</span>
        </div>
        <button
          onClick={onClearCart}
          className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          {t.clearCart}
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-[#0E1322] border border-slate-800 space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                <img
                  src={item.product.bannerImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">
                  {language === 'ar' ? item.product.titleAr : item.product.titleEn}
                </h3>
                <p className="text-xs text-amber-400 font-semibold truncate">
                  {language === 'ar' ? item.bundle.nameAr : item.bundle.nameEn}
                </p>

                {item.playerId && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] mt-1">
                    <span className="text-slate-400">ID:</span>
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      {item.playerId}
                    </span>
                    {item.nickname && (
                      <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{item.nickname}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => onRemoveItem(item.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                title={t.removeCartItem}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Price & Quantity Controls */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
              <div className="flex items-center gap-2 bg-[#090D16] px-2 py-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold text-white min-w-[20px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-white tabular-nums text-sm">
                  {formatPrice(item.bundle.priceDZD * item.quantity, item.bundle.priceUSD * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary & Sticky Checkout with Promo Code Integration */}
      <div className="p-4 rounded-2xl bg-[#0D1220] border border-slate-800 space-y-3 mt-4 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{t.orderSummary}</span>
          <span>{cart.length} {language === 'ar' ? 'عناصر' : 'items'}</span>
        </div>

        {/* Promo Code Input & Instant Discount Section */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.promoCodeLabel}</span>
          </label>

          {appliedCoupon ? (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/70 to-[#0A1622] border border-emerald-500/50 flex items-center justify-between text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-white bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40 tracking-wider">
                  {appliedCoupon.code}
                </span>
                <span className="text-emerald-300 font-bold">
                  {appliedCoupon.discountType === 'percentage'
                    ? `-${appliedCoupon.discountValue}% (${discountDZD.toLocaleString()} دج)`
                    : `-${discountDZD.toLocaleString()} دج`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-[11px] text-red-400 hover:text-red-300 font-bold underline"
              >
                {t.removePromo}
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => {
                    setCouponCodeInput(e.target.value.toUpperCase());
                    if (couponError) setCouponError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder={t.promoCodePlaceholder}
                  className="flex-1 bg-[#080B14] text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-400 font-mono text-xs uppercase placeholder-slate-500 tracking-wider"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-md shadow-cyan-950/50 active:scale-95 transition-all shrink-0"
                >
                  {t.applyPromoCode}
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 shrink-0" />
                  <span>{couponSuccess}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pricing Breakdown with Discount */}
        <div className="border-t border-slate-800/80 pt-2 space-y-1">
          {discountDZD > 0 && (
            <>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>{t.originalTotal}</span>
                <span className="line-through font-mono">
                  {formatPrice(rawTotalDZD, rawTotalUSD)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
                <span>{t.discountApplied} ({appliedCoupon?.code})</span>
                <span className="font-mono">
                  -{formatPrice(discountDZD, discountUSD)}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between text-base font-bold text-white pt-1">
            <span>{discountDZD > 0 ? t.finalTotal : t.cartTotal}</span>
            <div className="text-right">
              <span className="text-lg font-extrabold text-amber-400 tabular-nums block">
                {finalTotalDZD.toLocaleString()} {t.currencyDZD}
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium block">
                (${finalTotalUSD.toFixed(2)} USD)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{language === 'ar' ? 'دفع آمن بالدينار الجزائري عبر بريدي موب مع وصل فوري' : 'Secure payment via BaridiMob & instant receipt'}</span>
        </div>

        <button
          onClick={() => onCheckoutCart(appliedCoupon)}
          className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
        >
          <span>{t.checkoutCartBtn}</span>
          <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};
