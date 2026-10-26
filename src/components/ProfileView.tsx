import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Crown,
  LogOut,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  ShoppingBag,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  Palette,
  Check,
} from 'lucide-react';
import { User, Language, Currency, ThemeMode } from '../types/store';
import { getTranslation } from '../data/translations';
import { useTheme } from '../context/ThemeContext';
import {
  getStoredAccounts,
  saveAccounts,
  saveCurrentUser,
  isAdminUser,
  StoredAccount,
} from '../data/authService';

interface ProfileViewProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  language: Language;
  onLanguageToggle: () => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onOpenOrders: () => void;
  onOpenAdminDashboard: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUserChange,
  language,
  onLanguageToggle,
  currency,
  onCurrencyChange,
  onOpenOrders,
  onOpenAdminDashboard,
}) => {
  const t = getTranslation(language);
  const { themeMode, effectiveTheme, setThemeMode } = useTheme();
  const isLight = effectiveTheme === 'light';

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const isAdmin = isAdminUser(currentUser);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const accounts = getStoredAccounts();
    const cleanEmail = email.trim().toLowerCase();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account || account.passwordHash !== password) {
      setAuthError(t.authErrorInvalid);
      return;
    }

    const loggedUser: User = {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      createdAt: account.createdAt,
      phone: account.phone,
    };

    saveCurrentUser(loggedUser);
    onUserChange(loggedUser);
    setAuthSuccess(t.authSuccessLogin);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email.trim() || !password || !name.trim()) {
      setAuthError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all fields');
      return;
    }

    const accounts = getStoredAccounts();
    const cleanEmail = email.trim().toLowerCase();
    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      setAuthError(t.authErrorExists);
      return;
    }

    // Determine role (taybawi8@gmail.com is always admin)
    const role = cleanEmail === 'taybawi8@gmail.com' || cleanEmail.includes('admin') ? 'admin' : 'user';

    const newAccount: StoredAccount = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: name.trim(),
      role,
      createdAt: Date.now(),
      passwordHash: password,
    };

    const updated = [...accounts, newAccount];
    saveAccounts(updated);

    const newUser: User = {
      id: newAccount.id,
      email: newAccount.email,
      name: newAccount.name,
      role: newAccount.role,
      createdAt: newAccount.createdAt,
    };

    saveCurrentUser(newUser);
    onUserChange(newUser);
    setAuthSuccess(t.authSuccessSignup);
  };

  const handleQuickFill = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      setEmail('taybawi8@gmail.com');
      setPassword('admin123');
      setName('Abderraouf Taybawi');
    } else {
      setEmail('customer@chahndz.com');
      setPassword('customer123');
      setName('Karim Dz');
    }
  };

  const handleLogout = () => {
    saveCurrentUser(null);
    onUserChange(null);
  };

  const themeOptions: {
    id: ThemeMode;
    title: string;
    desc: string;
    icon: React.ReactNode;
    previewColors: string[];
  }[] = [
    {
      id: 'dark',
      title: t.themeDark,
      desc: t.themeDarkDesc,
      icon: <Moon className="w-4 h-4 text-amber-400" />,
      previewColors: ['#07090E', '#0A0E1A', '#F59E0B', '#06B6D4'],
    },
    {
      id: 'light',
      title: t.themeLight,
      desc: t.themeLightDesc,
      icon: <Sun className="w-4 h-4 text-amber-600" />,
      previewColors: ['#F8FAFC', '#FFFFFF', '#D97706', '#0284C7'],
    },
    {
      id: 'system',
      title: t.themeSystem,
      desc: t.themeSystemDesc,
      icon: <Laptop className="w-4 h-4 text-cyan-500" />,
      previewColors: ['#1E293B', '#334155', '#F59E0B', '#94A3B8'],
    },
  ];

  const renderThemeCard = () => (
    <div className={`p-4 rounded-3xl border transition-all space-y-3 shadow-md ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#0E1322] border-slate-800'
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
        }`}>
          <Palette className="w-4 h-4" />
        </div>
        <div>
          <h3 className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {t.themeTitle}
          </h3>
          <p className={`text-[10px] leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {t.themeSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {themeOptions.map((opt) => {
          const isSelected = themeMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setThemeMode(opt.id)}
              className={`p-3 rounded-2xl border text-start transition-all flex items-center justify-between group active:scale-98 select-none ${
                isSelected
                  ? isLight
                    ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-1 ring-amber-500/20'
                    : 'bg-amber-950/25 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/20'
                  : isLight
                  ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/90'
                  : 'bg-[#090D18] hover:bg-[#0D1220] border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : isLight
                    ? 'bg-white text-slate-700 border-slate-200'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {opt.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold truncate ${
                      isSelected
                        ? isLight ? 'text-amber-900' : 'text-white'
                        : isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}>
                      {opt.title}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-500 text-black leading-none">
                        {t.activeThemeBadge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] block leading-tight mt-0.5 line-clamp-1 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {opt.desc}
                  </span>
                </div>
              </div>

              {/* Color dots & radio mark */}
              <div className="flex items-center gap-2 shrink-0 ms-2">
                <div className="hidden xs:flex items-center gap-1 p-1 rounded-md bg-black/5">
                  {opt.previewColors.map((col, idx) => (
                    <span
                      key={idx}
                      className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : isLight
                    ? 'border-slate-300 bg-white'
                    : 'border-slate-700 bg-slate-900'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4 select-none">
      {/* If User is Logged In */}
      {currentUser ? (
        <div className="space-y-4">
          {/* User Card */}
          <div className={`p-4 rounded-3xl border space-y-3 shadow-md relative overflow-hidden transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0E1322] border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-lg ${
                isAdmin
                  ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-black shadow-amber-500/20'
                  : 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-cyan-500/20'
              }`}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {currentUser.name}
                  </h2>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-500 text-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      <Crown className="w-3 h-3 fill-current" />
                      Admin
                    </span>
                  )}
                </div>

                <p className={`text-xs font-mono truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {currentUser.email}
                </p>

                <p className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAdmin ? t.roleAdmin : t.roleUser}</span>
                </p>
              </div>
            </div>

            {/* Admin Exclusive CTA Banner */}
            {isAdmin && (
              <div className={`pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <button
                  onClick={onOpenAdminDashboard}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
                >
                  <Crown className="w-4 h-4 fill-current" />
                  <span>{t.openAdminDashboard}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Theme Selector Card */}
          {renderThemeCard()}

          {/* Quick Settings & Navigation */}
          <div className={`rounded-2xl border divide-y text-xs transition-colors ${
            isLight
              ? 'bg-white border-slate-200 divide-slate-100'
              : 'bg-[#0C101C] border-slate-800 divide-slate-800/80'
          }`}>
            <button
              onClick={onOpenOrders}
              className={`w-full p-3.5 flex items-center justify-between transition-colors ${
                isLight ? 'text-slate-800 hover:text-black' : 'text-slate-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">{t.myOrdersTitle}</span>
              </div>
              <span className="text-slate-400 font-bold">→</span>
            </button>

            <div className="p-3.5 flex items-center justify-between">
              <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                {language === 'ar' ? 'لغة التطبيق (RTL / LTR)' : 'App Language'}
              </span>
              <button
                onClick={onLanguageToggle}
                className={`px-3 py-1 rounded-lg border font-bold transition-all ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}
              </button>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                {language === 'ar' ? 'العملة المعروضة' : 'Display Currency'}
              </span>
              <div className="flex gap-1">
                {(['DZD', 'USD'] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => onCurrencyChange(c)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      currency === c
                        ? 'bg-amber-500 text-black font-bold'
                        : isLight
                        ? 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isLight
                ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                : 'bg-slate-900/80 hover:bg-red-950/40 border-slate-800 hover:border-red-800/60 text-slate-300 hover:text-red-400'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logoutButton}</span>
          </button>
        </div>
      ) : (
        /* If User is Not Logged In -> Show Theme Settings Card + Clean Login/Signup Form */
        <div className="space-y-4">
          <div className="text-center space-y-1.5 py-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
              isLight
                ? 'bg-amber-100 text-amber-700 border-amber-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <UserIcon className="w-6 h-6" />
            </div>
            <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t.notLoggedInTitle}
            </h2>
            <p className={`text-xs max-w-xs mx-auto leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {t.notLoggedInDesc}
            </p>
          </div>

          {/* Tabs: Login vs Signup */}
          <div className={`grid grid-cols-2 p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.loginTab}</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('signup');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.signupTab}</span>
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={authMode === 'login' ? handleLogin : handleSignup}
            className={`p-4 rounded-3xl border space-y-3.5 shadow-lg transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0E1322] border-slate-800'
            }`}
          >
            {authMode === 'signup' && (
              <div>
                <label className={`text-xs font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Abderraouf Taybawi"
                  className={`w-full text-xs rounded-xl px-3 py-2.5 border focus:outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 text-slate-900 border-slate-300 focus:border-amber-500 focus:bg-white'
                      : 'bg-[#080B14] text-white border-slate-700 focus:border-amber-500'
                  }`}
                />
              </div>
            )}

            <div>
              <label className={`text-xs font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="taybawi8@gmail.com"
                  className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none font-mono transition-all ${
                    isLight
                      ? 'bg-slate-50 text-slate-900 border-slate-300 focus:border-amber-500 focus:bg-white'
                      : 'bg-[#080B14] text-white border-slate-700 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border focus:outline-none font-mono transition-all ${
                    isLight
                      ? 'bg-slate-50 text-slate-900 border-slate-300 focus:border-amber-500 focus:bg-white'
                      : 'bg-[#080B14] text-white border-slate-700 focus:border-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-md shadow-amber-500/20 active:scale-98 transition-all"
            >
              {authMode === 'login' ? t.loginButton : t.signupButton}
            </button>
          </form>

          {/* Theme Selector Card for Guest Users */}
          {renderThemeCard()}

          {/* Quick Testing Credentials */}
          <div className="space-y-2 pt-1">
            <span className={`text-[11px] block text-center uppercase tracking-wider font-semibold ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {language === 'ar' ? 'أزرار الدخول التجريبي السريع' : 'Quick Testing Credentials'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-amber-950/30 hover:bg-amber-950/60 border-amber-500/40 text-amber-300'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-500" />
                <span>{t.demoFillAdmin}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('customer')}
                className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <UserIcon className="w-3 h-3 text-cyan-500" />
                <span>{t.demoFillCustomer}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
