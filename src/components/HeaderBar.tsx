import React from 'react';
import { Globe, Search, ShoppingCart, Smartphone, Monitor, ShieldAlert, Sun, Moon } from 'lucide-react';
import { Currency, Language, User } from '../types/store';
import { getTranslation } from '../data/translations';
import { isAdminUser } from '../data/authService';
import { useTheme } from '../context/ThemeContext';

interface HeaderBarProps {
  language: Language;
  onLanguageToggle: () => void;
  currency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  searchOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  phoneFrameMode: boolean;
  onTogglePhoneFrame: () => void;
  currentUser: User | null;
  onOpenAdmin?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  language,
  onLanguageToggle,
  currency,
  onCurrencyChange,
  cartCount,
  onOpenCart,
  onOpenSearch,
  searchOpen,
  searchQuery,
  onSearchChange,
  phoneFrameMode,
  onTogglePhoneFrame,
  currentUser,
  onOpenAdmin,
}) => {
  const t = getTranslation(language);
  const isAdmin = isAdminUser(currentUser);
  const { effectiveTheme, toggleTheme } = useTheme();
  const isLight = effectiveTheme === 'light';

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md px-4 py-3 select-none transition-colors border-b ${
      isLight
        ? 'bg-white/95 border-slate-200 shadow-sm text-slate-900'
        : 'bg-[#0A0E1A]/95 border-slate-800/80 text-white'
    }`}>
      <div className="flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 border border-amber-400/30">
            <span className="font-extrabold text-black text-sm tracking-tight">عبود</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className={`text-base font-bold tracking-tight leading-tight truncate ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {language === 'ar' ? 'اشحنلي عبود' : 'ChahnDz Top-Up'}
              </h1>
              {isAdmin && (
                <span className="text-[9px] bg-amber-500 text-black font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className={`text-[11px] font-medium tracking-tight truncate ${
              isLight ? 'text-amber-700' : 'text-amber-400'
            }`}>
              chahndz.com · {language === 'ar' ? 'شحن فوري بالآيدي' : 'Instant ID Recharge'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Admin Access Button for Admins */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 rounded-lg flex items-center gap-1 transition-colors"
              title={t.openAdminDashboard}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">{t.navAdmin}</span>
            </button>
          )}

          {/* Quick Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-all active:scale-95 border ${
              isLight
                ? 'bg-amber-100/80 hover:bg-amber-200/80 border-amber-300 text-amber-800 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-amber-400'
            }`}
            title={t.quickThemeToggle}
            aria-label={t.quickThemeToggle}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Desktop Frame Toggle */}
          <button
            onClick={onTogglePhoneFrame}
            className={`hidden md:flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300 border-slate-700/60'
            }`}
            title={phoneFrameMode ? t.simulatorFrameOff : t.simulatorFrameOn}
          >
            {phoneFrameMode ? (
              <Monitor className="w-3.5 h-3.5 text-cyan-500" />
            ) : (
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>

          {/* Currency Toggle */}
          <div className={`flex items-center rounded-lg p-0.5 border ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900/90 border-slate-800'
          }`}>
            {(['DZD', 'USD'] as Currency[]).map((curr) => (
              <button
                key={curr}
                onClick={() => onCurrencyChange(curr)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  currency === curr
                    ? 'bg-amber-500 text-black shadow-sm font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr === 'DZD' ? (language === 'ar' ? 'دج' : 'DZD') : '$'}
              </button>
            ))}
          </div>

          {/* Language Switcher */}
          <button
            onClick={onLanguageToggle}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors active:scale-95 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
            title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-[11px] font-bold">{language === 'ar' ? 'EN' : 'العربية'}</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className={`p-2 rounded-lg transition-colors border ${
              searchOpen
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className={`relative p-2 rounded-lg border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 text-amber-500" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-black text-[9px] font-extrabold flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {searchOpen && (
        <div className={`mt-2.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              autoFocus
              className={`w-full text-sm placeholder-slate-400 rounded-xl py-2 ${
                language === 'ar' ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
              } border transition-all ${
                isLight
                  ? 'bg-white text-slate-900 border-slate-300 focus:border-amber-500 shadow-sm'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700 focus:border-amber-500'
              }`}
            />
          </div>
        </div>
      )}
    </header>
  );
};
