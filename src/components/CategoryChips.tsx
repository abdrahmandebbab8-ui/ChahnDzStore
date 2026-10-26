import React from 'react';
import { Crosshair, Flame, Coins, CreditCard, LayoutGrid } from 'lucide-react';
import { ProductCategory, Language } from '../types/store';
import { getTranslation } from '../data/translations';
import { useTheme } from '../context/ThemeContext';

interface CategoryChipsProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  language: Language;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  activeCategory,
  onSelectCategory,
  language,
}) => {
  const t = getTranslation(language);
  const { effectiveTheme } = useTheme();
  const isLight = effectiveTheme === 'light';

  const categories: { id: ProductCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t.catAll, icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'pubg', label: t.catPubg, icon: <Crosshair className="w-4 h-4 text-amber-500" /> },
    { id: 'freefire', label: t.catFreefire, icon: <Flame className="w-4 h-4 text-cyan-500" /> },
    { id: 'tiktok', label: t.catTiktok, icon: <Coins className="w-4 h-4 text-pink-500" /> },
    { id: 'giftcards', label: t.catGiftcards, icon: <CreditCard className="w-4 h-4 text-emerald-500" /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 border ${
              isActive
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800/80'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
