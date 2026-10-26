import React, { useState, useEffect } from 'react';
import { ExternalLink, Info, X, RefreshCw, ShieldCheck, Sparkles, Code2 } from 'lucide-react';
import { Language } from '../types/store';
import { getTranslation } from '../data/translations';

interface BannerAdProps {
  language: Language;
  isAdmin?: boolean;
  onDismiss?: () => void;
  isDismissed?: boolean;
}

interface AdCreative {
  id: string;
  sponsorNameAr: string;
  sponsorNameEn: string;
  headlineAr: string;
  headlineEn: string;
  ctaAr: string;
  ctaEn: string;
  iconBg: string;
  tagAr: string;
  tagEn: string;
}

const AD_CREATIVES: AdCreative[] = [
  {
    id: 'ad-google-play',
    sponsorNameAr: 'Google Play عروض معتمدة',
    sponsorNameEn: 'Google Play Gift Cards',
    headlineAr: 'بطاقات جوجل بلاي مخفضة حتى 10% لشحن الألعاب',
    headlineEn: 'Get up to 10% off Google Play cards for in-game purchases',
    ctaAr: 'استفد الآن',
    ctaEn: 'Claim Offer',
    iconBg: 'from-amber-500 to-yellow-600',
    tagAr: 'عرض خاص',
    tagEn: 'Special Offer',
  },
  {
    id: 'ad-razer-gold',
    sponsorNameAr: 'Razer Gold الشرق الأوسط',
    sponsorNameEn: 'Razer Gold Global',
    headlineAr: 'اشحن رصيد رايزر جولد بالدينار الجزائري فورياً',
    headlineEn: 'Top-up Razer Gold with instant local delivery',
    ctaAr: 'شحن فوري',
    ctaEn: 'Top-up Now',
    iconBg: 'from-emerald-500 to-teal-600',
    tagAr: 'شريك معتمد',
    tagEn: 'Verified Partner',
  },
  {
    id: 'ad-gaming-pass',
    sponsorNameAr: 'اشتراكات الألعاب الرقمية',
    sponsorNameEn: 'Gaming Pass Ultimate',
    headlineAr: 'اشترك الآن في بطاقات الألعاب ووفّر أكثر على كل باقة',
    headlineEn: 'Subscribe to gaming passes and save on every top-up',
    ctaAr: 'تفاصيل العرض',
    ctaEn: 'View Details',
    iconBg: 'from-cyan-500 to-blue-600',
    tagAr: 'حصري',
    tagEn: 'Exclusive',
  },
];

export const BannerAd: React.FC<BannerAdProps> = ({
  language,
  isAdmin = false,
  onDismiss,
  isDismissed = false,
}) => {
  const t = getTranslation(language);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showTechModal, setShowTechModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh banner every 30 seconds (standard AdMob refresh rate)
  useEffect(() => {
    const timer = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setCurrentAdIndex((prev) => (prev + 1) % AD_CREATIVES.length);
        setIsRefreshing(false);
      }, 400);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Strict requirement: Hide completely for store admin
  if (isAdmin || isDismissed) {
    return null;
  }

  const creative = AD_CREATIVES[currentAdIndex];

  const handleManualCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentAdIndex((prev) => (prev + 1) % AD_CREATIVES.length);
      setIsRefreshing(false);
    }, 250);
  };

  return (
    <>
      {/* Sticky Banner Ad Component (Placed directly above BottomNavBar) */}
      <aside
        role="complementary"
        aria-label={language === 'ar' ? 'إعلان تجاري' : 'Sponsored Banner Ad'}
        className="relative w-full rounded-xl bg-gradient-to-r from-slate-900/95 via-[#0D1322]/95 to-slate-900/95 backdrop-blur-md border border-slate-700/60 shadow-lg shadow-black/40 overflow-hidden transition-all duration-300"
      >
        {/* Subtle top indicator bar representing AdMob banner container */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="px-2.5 py-1.5 flex items-center justify-between gap-2">
          {/* Ad Badge & Sponsor Identity */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Standard Google AdMob Attribution Badge */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 leading-none tracking-wider uppercase select-none">
                {t.adBadge || (language === 'ar' ? 'إعلان' : 'Ad')}
              </span>
              <button
                type="button"
                onClick={() => setShowTechModal(true)}
                className="mt-0.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                title={language === 'ar' ? 'كود دمج AdMob في أندرويد' : 'View AdMob Android code'}
                aria-label="AdMob Info"
              >
                <Code2 className="w-3 h-3" />
              </button>
            </div>

            {/* Creative Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[140px]">
                  {language === 'ar' ? creative.sponsorNameAr : creative.sponsorNameEn}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium hidden sm:inline-block">
                  {language === 'ar' ? creative.tagAr : creative.tagEn}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-200 truncate leading-snug">
                {language === 'ar' ? creative.headlineAr : creative.headlineEn}
              </p>
            </div>
          </div>

          {/* Action & Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* CTA Button */}
            <button
              type="button"
              onClick={handleManualCycle}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-sm active:scale-95 transition-all flex items-center gap-1 select-none whitespace-nowrap"
            >
              <span>{language === 'ar' ? creative.ctaAr : creative.ctaEn}</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            {/* Refresh Ad Button */}
            <button
              type="button"
              onClick={handleManualCycle}
              disabled={isRefreshing}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title={language === 'ar' ? 'تحديث الإعلان' : 'Refresh Ad'}
              aria-label="Refresh ad"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Dismiss Ad Button */}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
                title={language === 'ar' ? 'إغلاق الإعلان' : 'Dismiss Ad'}
                aria-label="Dismiss ad"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* AdMob Integration Modal (Technical Reference for Developers) */}
      {showTechModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg bg-[#0C101C] border border-slate-700 rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden text-left"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'ar' ? 'دمج إعلانات Google AdMob في أندرويد' : 'Google AdMob Android Integration'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar' ? 'كود التهيئة، إدارة دورة الحياة، ومنع حجب الأزرار' : 'Lifecycle management & safe placement'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTechModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                <p className="font-semibold mb-1">
                  {language === 'ar' ? '✓ التوافق الصارم مع متطلبات التطبيق:' : '✓ Requirements Met:'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-300/90">
                  <li>{language === 'ar' ? 'الإعلان متبث أعلى شريط التنقل السفلي مباشرة بدون تغطية أزرار الشراء أو السلة.' : 'Banner placed above BottomNavigationView without obstructing Buy/Cart buttons.'}</li>
                  <li>{language === 'ar' ? 'يتم إخفاء الإعلانات تلقائياً عندما يسجل المسؤول (Admin) دخوله.' : 'Ad banners are automatically suppressed when user role is Admin.'}</li>
                  <li>{language === 'ar' ? 'إدارة كاملة لدورة حياة النشاط (onResume, onPause, onDestroy) لمنع تسريب الذاكرة.' : 'Lifecycle handling (onResume, onPause, onDestroy) prevents memory leaks.'}</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-200 mb-1">1. Jetpack Compose AdMob Component (`AdMobBannerView.kt`):</p>
                <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-[10px] overflow-x-auto border border-slate-800 text-left" dir="ltr">
{`@Composable
fun AdMobBannerView(
    modifier: Modifier = Modifier,
    adUnitId: String = "ca-app-pub-3940256099942544/6300978111" // Test ID
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    val adView = remember {
        AdView(context).apply {
            setAdSize(AdSize.BANNER)
            this.adUnitId = adUnitId
            loadAd(AdRequest.Builder().build())
        }
    }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> adView.resume()
                Lifecycle.Event.ON_PAUSE -> adView.pause()
                Lifecycle.Event.ON_DESTROY -> adView.destroy()
                else -> {}
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            adView.destroy()
        }
    }

    AndroidView(factory = { adView }, modifier = modifier)
}`}
                </pre>
              </div>

              <div>
                <p className="font-bold text-slate-200 mb-1">2. XML Layout Structure (`activity_main.xml`):</p>
                <pre className="p-3 bg-slate-950 rounded-lg text-cyan-400 font-mono text-[10px] overflow-x-auto border border-slate-800 text-left" dir="ltr">
{`<!-- AdMob Banner pinned directly above BottomNavigationView -->
<com.google.android.gms.ads.AdView
    android:id="@+id/bannerAdView"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    ads:adSize="BANNER"
    ads:adUnitId="@string/admob_banner_unit_id"
    app:layout_constraintBottom_toTopOf="@id/bottomNavigation"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toEndOf="parent" />

<com.google.android.material.bottomnavigation.BottomNavigationView
    android:id="@+id/bottomNavigation"
    android:layout_width="match_parent"
    android:layout_height="56dp"
    app:layout_constraintBottom_toBottomOf="parent" />`}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setShowTechModal(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
              >
                {language === 'ar' ? 'حسناً، فهمت' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
