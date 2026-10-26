import React, { useState } from 'react';
import { RotateCw, ArrowLeft, ArrowRight, Lock, ExternalLink, WifiOff, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Language } from '../types/store';
import { getTranslation } from '../data/translations';
import { OFFICIAL_STORE_URL } from '../data/storeData';

interface WebViewSimulatorProps {
  language: Language;
}

export const WebViewSimulator: React.FC<WebViewSimulatorProps> = ({ language }) => {
  const t = getTranslation(language);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [loadCount, setLoadCount] = useState(1);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLoadCount((prev) => prev + 1);
    }, 700);
  };

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* Title & Architecture Switcher Banner */}
      <div className="bg-[#0E1322] rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t.storeModeTitle}</h2>
              <p className="text-[11px] text-slate-400">{t.webViewNotice}</p>
            </div>
          </div>

          <button
            onClick={() => setSimulateOffline(!simulateOffline)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
              simulateOffline
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {simulateOffline
              ? (language === 'ar' ? 'اختبار: لا يوجد إنترنت' : 'Test: Offline Mode')
              : (language === 'ar' ? 'محاكاة انقطاع النت' : 'Simulate Offline')}
          </button>
        </div>
      </div>

      {/* Native Android WebView Frame */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#0A0D17] shadow-xl flex flex-col">
        {/* In-App Browser Address Bar */}
        <div className="bg-[#111728] px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-1.5 text-slate-400">
            <button
              onClick={handleRefresh}
              className="p-1 hover:text-white rounded"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRefresh}
              className="p-1 hover:text-white rounded"
              title="Forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRefresh}
              className={`p-1 hover:text-white rounded ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
              title={t.pullToRefresh}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SSL URL Bar */}
          <div className="flex-1 max-w-xs mx-auto bg-[#090C16] border border-slate-700/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs text-slate-300">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="font-mono text-[11px] truncate text-slate-300">
              chahndz.com
            </span>
          </div>

          <a
            href={OFFICIAL_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-slate-400 hover:text-white rounded"
            title={t.openInBrowser}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* WebView Screen Canvas */}
        <div className="relative min-h-[460px] bg-[#07090F] flex flex-col items-center justify-center p-4">
          {simulateOffline ? (
            /* Offline Recovery State */
            <div className="max-w-xs text-center space-y-3 p-6 rounded-2xl bg-[#0E1322] border border-slate-800 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center mx-auto text-red-400">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">{t.offlineError}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.offlineDesc}</p>
              <button
                onClick={() => {
                  setSimulateOffline(false);
                  handleRefresh();
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
              >
                {t.retryConnection}
              </button>
            </div>
          ) : (
            /* Loaded Store Preview Canvas */
            <div className="w-full h-full flex flex-col items-center text-center space-y-4 py-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-extrabold text-lg shadow-lg shadow-amber-500/20">
                عبود
              </div>

              <div>
                <h3 className="text-base font-bold text-white">متجر اشحنلي عبود - chahndz.com</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  {language === 'ar'
                    ? 'متجرك الإلكتروني على منصة YouCan جاهز للتصفح والطلب المباشر أو الربط السلس مع التطبيق الأصلي.'
                    : 'Your YouCan digital top-up store is loaded inside the native Android WebView container.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  SSL 256-bit Encrypted
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Pull-To-Refresh Enabled
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  {t.pullToRefresh}
                </button>
                <a
                  href={OFFICIAL_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>{t.openInBrowser}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Engineering Recommendation Guide */}
      <div className="bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-cyan-950/20 rounded-2xl p-4 border border-amber-500/20 space-y-2">
        <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
          <Zap className="w-3.5 h-3.5" />
          {t.recommendationTitle}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t.recommendationBody}
        </p>
      </div>
    </div>
  );
};
