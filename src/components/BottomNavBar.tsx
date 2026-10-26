import React from 'react';
import { Home, ShoppingCart, ShoppingBag, User } from 'lucide-react';
import { Language } from '../types/store';
import { getTranslation } from '../data/translations';
import { useTheme } from '../context/ThemeContext';

export type TabView = 'home' | 'cart' | 'orders' | 'profile';

interface BottomNavBarProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  language: Language;
  cartCount: number;
  orderCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  language,
  cartCount,
  orderCount,
}) => {
  const t = getTranslation(language);
  const { effectiveTheme } = useTheme();
  const isLight = effectiveTheme === 'light';

  // STRICT 4 customer tabs: Home, Cart, Orders, Profile
  const tabs: { id: TabView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: t.navHome, icon: <Home className="w-5 h-5" /> },
    { id: 'cart', label: t.navCart, icon: <ShoppingCart className="w-5 h-5" />, badge: cartCount },
    { id: 'orders', label: t.navOrders, icon: <ShoppingBag className="w-5 h-5" />, badge: orderCount },
    { id: 'profile', label: t.navProfile, icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md transition-colors border-t max-w-full ${
      isLight
        ? 'bg-white/95 border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]'
        : 'bg-[#0A0E1A]/95 border-slate-800/80'
    }`}>
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full py-1.5 transition-all select-none ${
                isActive
                  ? isLight
                    ? 'text-amber-600 font-extrabold'
                    : 'text-amber-400 font-bold'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900 font-medium'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-black text-[9px] font-extrabold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-1 truncate max-w-[80px] leading-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                  isLight ? 'bg-amber-600' : 'bg-amber-400'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
