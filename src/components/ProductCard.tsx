import React, { useState } from 'react';
import { Zap, Clock, ShieldCheck, ShoppingCart, Check } from 'lucide-react';
import { Product, Language, Currency } from '../types/store';
import { getTranslation } from '../data/translations';
import { useTheme } from '../context/ThemeContext';

interface ProductCardProps {
  product: Product;
  language: Language;
  currency: Currency;
  onSelect: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  currency,
  onSelect,
  onAddToCart,
  onBuyNow,
}) => {
  const t = getTranslation(language);
  const [justAdded, setJustAdded] = useState(false);
  const { effectiveTheme } = useTheme();
  const isLight = effectiveTheme === 'light';

  // Starting price
  const minPriceDZD = Math.min(...product.bundles.map((b) => b.priceDZD));
  const minPriceUSD = Math.min(...product.bundles.map((b) => b.priceUSD));

  const formatPrice = (dzd: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toFixed(2)}`;
    return `${dzd.toLocaleString()} ${t.currencyDZD}`;
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    } else {
      onSelect(product);
    }
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      onSelect(product);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group relative rounded-2xl p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
        isLight
          ? 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 shadow-sm'
          : 'bg-[#0E1322] hover:bg-[#12192D] border-slate-800/90 hover:border-slate-700/80 shadow-md shadow-black/20'
      }`}
    >
      <div>
        {/* Card Header Image */}
        <div className={`relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 border ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800/50'
        }`}>
          <img
            src={product.bannerImage || '/src/assets/images/chahndz_store_hero_1792845100871.jpg'}
            alt={language === 'ar' ? product.titleAr : product.titleEn}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/src/assets/images/chahndz_store_hero_1792845100871.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Bonus / Popular Badge */}
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-black backdrop-blur-sm shadow-sm flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 fill-current" />
              {product.category === 'pubg' ? '+Bonus UC' : product.category === 'freefire' ? '+10% Extra' : 'Official'}
            </span>
          </div>

          {/* Delivery speed badge */}
          <div className="absolute bottom-1.5 right-2 flex items-center gap-1 text-[10px] text-slate-200 font-medium bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{language === 'ar' ? product.deliveryTimeAr : product.deliveryTimeEn}</span>
          </div>
        </div>

        {/* Product Title & Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <h3 className={`text-sm font-bold transition-colors truncate ${
              isLight
                ? 'text-slate-900 group-hover:text-amber-600'
                : 'text-white group-hover:text-amber-400'
            }`}>
              {language === 'ar' ? product.titleAr : product.titleEn}
            </h3>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>

          <p className={`text-xs line-clamp-1 leading-relaxed ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {language === 'ar' ? product.taglineAr : product.taglineEn}
          </p>
        </div>

        {/* Price Label */}
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className={`text-[10px] uppercase tracking-wider font-semibold ${
            isLight ? 'text-slate-500' : 'text-slate-500'
          }`}>
            {language === 'ar' ? 'يبدأ من' : 'Starts at'}
          </span>
          <span className={`text-sm font-black tabular-nums ${
            isLight ? 'text-amber-700' : 'text-amber-400'
          }`}>
            {formatPrice(minPriceDZD, minPriceUSD)}
          </span>
        </div>
      </div>

      {/* Side-by-Side Action Buttons: "أضف إلى السلة" and "شراء الآن" */}
      <div className={`mt-3 pt-2.5 border-t grid grid-cols-2 gap-2 ${
        isLight ? 'border-slate-100' : 'border-slate-800/70'
      }`}>
        {/* Complementary: Add to Cart Button */}
        <button
          onClick={handleAddToCartClick}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border active:scale-95 ${
            justAdded
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80 shadow-sm'
              : isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
          }`}
          title={t.addToCart}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="truncate">{t.addedToCartShort}</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{t.addToCart}</span>
            </>
          )}
        </button>

        {/* Prominent: Buy Now Button */}
        <button
          onClick={handleBuyNowClick}
          className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
          title={t.buyNow}
        >
          <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
          <span className="truncate">{t.buyNow}</span>
        </button>
      </div>
    </div>
  );
};
