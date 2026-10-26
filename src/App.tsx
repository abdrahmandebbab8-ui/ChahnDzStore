/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Currency,
  Language,
  Product,
  ProductBundle,
  ProductCategory,
  Order,
  CartItem,
  User,
  PaymentMethod,
  Coupon,
} from './types/store';
import { PRODUCTS, PROMO_BANNERS, INITIAL_ORDERS, DEFAULT_WHATSAPP_NUMBER, DEFAULT_COUPONS } from './data/storeData';
import { getTranslation } from './data/translations';
import { HeaderBar } from './components/HeaderBar';
import { BottomNavBar, TabView } from './components/BottomNavBar';
import { PhoneSimulatorFrame } from './components/PhoneSimulatorFrame';
import { BannerSlider } from './components/BannerSlider';
import { CategoryChips } from './components/CategoryChips';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrdersView } from './components/OrdersView';
import { CartView } from './components/CartView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { BannerAd } from './components/BannerAd';
import { getCurrentUser, isAdminUser } from './data/authService';
import { Shield, Zap, Headphones, MessageCircle, Sparkles } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { effectiveTheme } = useTheme();
  const isLight = effectiveTheme === 'light';
  const [language, setLanguage] = useState<Language>('ar');
  const [currency, setCurrency] = useState<Currency>('DZD');
  const [activeTab, setActiveTab] = useState<TabView>('home');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneFrameMode, setPhoneFrameMode] = useState(true);
  const [adDismissed, setAdDismissed] = useState(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Products Catalog State (persisted to localStorage so Admin edits/adds/deletions stick)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('chahndz_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return PRODUCTS;
  });

  // Cart State (persisted)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('chahndz_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Orders State (persisted)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('chahndz_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });

  // Dynamic Store Settings (Admin Configurable)
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    return localStorage.getItem('chahndz_whatsapp_number') || '213660000000';
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    try {
      const saved = localStorage.getItem('chahndz_payment_methods');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'baridimob',
        nameAr: 'بريدي موب (BaridiMob RIP)',
        nameEn: 'BaridiMob (Algeria Post RIP)',
        instructionsAr: 'قم بالتحويل عبر تطبيق بريدي موب إلى رقم الحساب (RIP) الموضح، ثم انسخ كود المعاملة أو أرفق لقطة شاشة للوصل.',
        instructionsEn: 'Transfer via BaridiMob app to the RIP number below, then provide the transaction reference or attach screenshot.',
        accountNumber: '00799999002345678921',
        accountHolder: 'ABDERRAOUF TAYBAWI (CHAHNDZ)',
        badgeAr: 'الدفع المفضل بالجزائر',
        badgeEn: 'Preferred Algerian Method',
        additionalInfoAr: 'تأكيد فوري خلال دقيقة واحدة',
        additionalInfoEn: 'Instant confirmation in 1 min',
        feePercentage: 0,
      },
      {
        id: 'ccp',
        nameAr: 'الحساب البريدي الجاري (CCP)',
        nameEn: 'Algerian Postal CCP',
        instructionsAr: 'قم بالإيداع في أقرب مكتب بريد أو تحويل بريدي، وأرفق صورة وصل الدفع مع رقم العملية.',
        instructionsEn: 'Deposit at any Algeria Post office or transfer, and attach a photo of the receipt receipt slip.',
        accountNumber: '18492031 Cle 45',
        accountHolder: 'TAYBAWI ABDERRAOUF',
        badgeAr: 'مكتب البريد الجزائري',
        badgeEn: 'Algeria Post Office',
        additionalInfoAr: 'متاح في جميع ولايات الجزائر الـ 58',
        additionalInfoEn: 'Available across all 58 Wilayas',
        feePercentage: 0,
      },
      {
        id: 'paysera',
        nameAr: 'بايسيرا (Paysera EUR)',
        nameEn: 'Paysera (EUR Transfer)',
        instructionsAr: 'أرسل المبلغ باليورو إلى حساب بايسيرا التالي مع كتابة رقم الطلب في الملاحظات.',
        instructionsEn: 'Send the EUR amount to the Paysera account with your order ID in reference.',
        accountNumber: 'EVP9810002847592',
        accountHolder: 'ChahnDz Digital Store',
        badgeAr: 'دفع باليورو أوروبا',
        badgeEn: 'European EUR Transfer',
        additionalInfoAr: 'تحويل فوري بدون عمولة',
        additionalInfoEn: 'Instant zero-fee transfer',
        feePercentage: 0,
      },
      {
        id: 'binance',
        nameAr: 'بينانس باي / دولار رقمي (Binance USDT)',
        nameEn: 'Binance Pay / USDT (Crypto)',
        instructionsAr: 'أرسل بالـ USDT عبر Binance Pay ID بدون رسوم، أو عبر شبكة TRC20 / BEP20.',
        instructionsEn: 'Pay with USDT via Binance Pay ID (0 fees) or direct TRC20 / BEP20 network transfer.',
        accountNumber: 'Binance Pay ID: 294819402',
        accountHolder: 'ChahnDz_Official',
        badgeAr: 'كريبتو فوري 0% رسوم',
        badgeEn: 'Instant Crypto 0% Fee',
        additionalInfoAr: 'يقبل USDT TRC-20 و BEP-20',
        additionalInfoEn: 'Accepts USDT TRC-20 & BEP-20',
        feePercentage: 0,
      },
      {
        id: 'redotpay',
        nameAr: 'ريدوت باي (RedotPay ID)',
        nameEn: 'RedotPay (Card & Wallet)',
        instructionsAr: 'تحويل داخلي مجاني ومباشر عبر رقم حساب ريدوت باي ID.',
        instructionsEn: 'Free and instant internal transfer via RedotPay ID.',
        accountNumber: '1842095819',
        accountHolder: 'ChahnDz Store',
        badgeAr: 'محفظة رقمية سريعة',
        badgeEn: 'Instant Digital Wallet',
        additionalInfoAr: 'تأكيد تلقائي',
        additionalInfoEn: 'Automated verification',
        feePercentage: 0,
      },
    ];
  });

  // Coupons State (persisted to localStorage)
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('chahndz_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_COUPONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('chahndz_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error(e);
    }
  }, [coupons]);

  // Modals & Single-Item Checkout State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    product?: Product;
    bundle?: ProductBundle;
    playerId?: string;
    nickname?: string;
    isVerified?: boolean;
    serverRegion?: string;
    playerLevel?: string;
    cartItems?: CartItem[];
    initialCoupon?: Coupon | null;
  } | null>(null);

  const t = getTranslation(language);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('chahndz_whatsapp_number', whatsappNumber);
  }, [whatsappNumber]);

  useEffect(() => {
    localStorage.setItem('chahndz_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  // Sync RTL / LTR dynamically to HTML root
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Persist Products changes
  useEffect(() => {
    try {
      localStorage.setItem('chahndz_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  // Persist Cart
  useEffect(() => {
    try {
      localStorage.setItem('chahndz_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Persist Orders
  useEffect(() => {
    try {
      localStorage.setItem('chahndz_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // Filter products based on active category & search query
  const filteredProducts = useMemo(() => {
    let list = products;

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.titleAr.toLowerCase().includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.taglineAr.toLowerCase().includes(q) ||
          p.taglineEn.toLowerCase().includes(q) ||
          p.descriptionAr.toLowerCase().includes(q) ||
          p.descriptionEn.toLowerCase().includes(q) ||
          p.bundles.some((b) => b.nameAr.toLowerCase().includes(q) || b.nameEn.toLowerCase().includes(q))
      );
    }

    return list;
  }, [products, activeCategory, searchQuery]);

  const handleBannerClick = (productId?: string) => {
    if (productId) {
      const found = products.find((p) => p.id === productId);
      if (found) {
        setSelectedProduct(found);
      }
    } else {
      setActiveTab('home');
    }
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    bundle: ProductBundle,
    playerId: string,
    nickname?: string,
    isVerified?: boolean,
    serverRegion?: string,
    playerLevel?: string
  ) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.bundle.id === bundle.id && item.playerId === playerId
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      const newItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random()}`,
        product,
        bundle,
        playerId,
        nickname,
        isPlayerNameVerified: isVerified,
        serverRegion,
        playerLevel,
        quantity: 1,
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedSingleCheckout = (
    product: Product,
    bundle: ProductBundle,
    playerId: string,
    nickname?: string,
    isVerified?: boolean,
    serverRegion?: string,
    playerLevel?: string
  ) => {
    setSelectedProduct(null);
    setCheckoutData({
      product,
      bundle,
      playerId,
      nickname,
      isVerified,
      serverRegion,
      playerLevel,
    });
  };

  const handleCheckoutCart = (appliedCoupon?: Coupon | null) => {
    if (cart.length === 0) return;
    setCheckoutData({ cartItems: cart, initialCoupon: appliedCoupon });
  };

  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // If order applied a coupon, increment its used count
    if (newOrder.couponCode) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === newOrder.couponCode?.toUpperCase()
            ? { ...c, usedCount: (c.usedCount || 0) + 1 }
            : c
        )
      );
    }
    // If it was a cart checkout, clear cart
    if (checkoutData?.cartItems) {
      setCart([]);
    }
    setCheckoutData(null);
    setActiveTab('orders');
  };

  // Admin Coupon Operations
  const handleAddCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const handleUpdateCoupon = (updatedCoupon: Coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === updatedCoupon.id ? updatedCoupon : c)));
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
  };

  // Admin Operations
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status'], digitalCode?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: newStatus,
          ...(digitalCode ? { digitalCode } : {}),
          ...(newStatus === 'completed' ? { completedAt: Date.now(), verifiedAt: Date.now() } : {}),
        };
      })
    );
  };

  const handleOpenWhatsAppSupport = () => {
    const text = language === 'ar'
      ? 'مرحباً متجر اشحنلي عبود، أحتاج مساعدة واستفسار بخصوص شحن الألعاب.'
      : 'Hello ChahnDz Store, I need assistance regarding gaming top-ups.';
    const cleanNumber = (whatsappNumber || DEFAULT_WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const cartTotalItemsCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  // Check if current user has Admin privileges
  const isUserAdmin = isAdminUser(currentUser);

  // Banner Ad display condition:
  // - Hidden if Admin is logged in
  // - Hidden if Admin Dashboard is open
  // - Hidden if dismissed by user
  // - Displayed only on main screens: Home, Cart, My Orders
  const showBannerAd =
    !isAdminDashboardOpen &&
    !isUserAdmin &&
    !adDismissed &&
    (activeTab === 'home' || activeTab === 'cart' || activeTab === 'orders');

  return (
    <PhoneSimulatorFrame enabled={phoneFrameMode}>
      <div className={`min-h-full flex flex-col bg-[#07090E] text-slate-100 ${showBannerAd ? 'pb-36' : 'pb-20'}`}>
        {/* Sticky App Bar */}
        <HeaderBar
          language={language}
          onLanguageToggle={handleToggleLanguage}
          currency={currency}
          onCurrencyChange={setCurrency}
          cartCount={cartTotalItemsCount}
          onOpenCart={() => {
            setIsAdminDashboardOpen(false);
            setActiveTab('cart');
          }}
          onOpenSearch={() => {
            setSearchOpen(!searchOpen);
            if (!searchOpen) {
              setIsAdminDashboardOpen(false);
              setActiveTab('home');
            }
          }}
          searchOpen={searchOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          phoneFrameMode={phoneFrameMode}
          onTogglePhoneFrame={() => setPhoneFrameMode(!phoneFrameMode)}
          currentUser={currentUser}
          onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        />

        {/* Main Content Router */}
        <main className="flex-1">
          {isAdminDashboardOpen ? (
            /* Secure Admin Dashboard */
            <AdminDashboard
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              paymentMethods={paymentMethods}
              onUpdatePaymentMethods={setPaymentMethods}
              whatsappNumber={whatsappNumber}
              onUpdateWhatsAppNumber={setWhatsappNumber}
              coupons={coupons}
              onAddCoupon={handleAddCoupon}
              onUpdateCoupon={handleUpdateCoupon}
              onDeleteCoupon={handleDeleteCoupon}
              language={language}
              onBackToApp={() => setIsAdminDashboardOpen(false)}
            />
          ) : (
            <>
              {/* TAB 1: Home Dashboard */}
              {activeTab === 'home' && (
                <div className="p-3 sm:p-4 space-y-4">
                  {/* Featured Promo Carousel */}
                  <BannerSlider
                    banners={PROMO_BANNERS}
                    language={language}
                    onBannerClick={handleBannerClick}
                  />

                  {/* Categories Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className={`text-xs font-bold uppercase tracking-wider ${
                        isLight ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {t.categoriesTitle}
                      </h2>
                      <span className={`text-[11px] font-semibold ${
                        isLight ? 'text-amber-700' : 'text-amber-400'
                      }`}>
                        {filteredProducts.length} {language === 'ar' ? 'خدمة' : 'items'}
                      </span>
                    </div>
                    <CategoryChips
                      activeCategory={activeCategory}
                      onSelectCategory={setActiveCategory}
                      language={language}
                    />
                  </div>

                  {/* Trust Badges Strip */}
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <div className={`p-2.5 rounded-xl border text-center flex flex-col items-center transition-colors ${
                      isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0C101C] border-slate-800/80'
                    }`}>
                      <Zap className="w-4 h-4 text-amber-500 mb-1" />
                      <span className={`text-[11px] font-bold block leading-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.trust1Title}</span>
                      <span className={`text-[9px] line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.trust1Desc}</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-center flex flex-col items-center transition-colors ${
                      isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0C101C] border-slate-800/80'
                    }`}>
                      <Shield className="w-4 h-4 text-emerald-500 mb-1" />
                      <span className={`text-[11px] font-bold block leading-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.trust2Title}</span>
                      <span className={`text-[9px] line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.trust2Desc}</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-center flex flex-col items-center transition-colors ${
                      isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0C101C] border-slate-800/80'
                    }`}>
                      <Headphones className="w-4 h-4 text-cyan-500 mb-1" />
                      <span className={`text-[11px] font-bold block leading-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>{t.trust3Title}</span>
                      <span className={`text-[9px] line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.trust3Desc}</span>
                    </div>
                  </div>

                  {/* Top Products Grid */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {language === 'ar' ? 'أشهر باقات الشحن والبطاقات الرقمية' : 'Popular Top-Up Services & Cards'}
                      </h2>
                      <span className={isLight ? 'text-slate-500 text-[11px]' : 'text-slate-400 text-[11px]'}>
                        {filteredProducts.length} {language === 'ar' ? 'عناصر' : 'items'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredProducts.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          language={language}
                          currency={currency}
                          onSelect={(p) => setSelectedProduct(p)}
                          onAddToCart={(p) => {
                            const bundle = p.bundles.find((b) => b.popular) || p.bundles[0];
                            handleAddToCart(p, bundle, '');
                          }}
                          onBuyNow={(p) => {
                            setSelectedProduct(p);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Cart View */}
              {activeTab === 'cart' && (
                <CartView
                  cart={cart}
                  language={language}
                  currency={currency}
                  coupons={coupons}
                  onUpdateQuantity={handleUpdateCartQuantity}
                  onRemoveItem={handleRemoveCartItem}
                  onClearCart={handleClearCart}
                  onStartShopping={() => setActiveTab('home')}
                  onCheckoutCart={handleCheckoutCart}
                />
              )}

              {/* TAB 3: Orders Tracking */}
              {activeTab === 'orders' && (
                <OrdersView
                  orders={orders}
                  language={language}
                  onStartShopping={() => setActiveTab('home')}
                  whatsappNumber={whatsappNumber}
                />
              )}

              {/* TAB 4: Profile & Authentication */}
              {activeTab === 'profile' && (
                <ProfileView
                  currentUser={currentUser}
                  onUserChange={setCurrentUser}
                  language={language}
                  onLanguageToggle={handleToggleLanguage}
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  onOpenOrders={() => setActiveTab('orders')}
                  onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Floating WhatsApp Live Button (adjusted dynamically above banner ad when visible) */}
        <button
          onClick={handleOpenWhatsAppSupport}
          className={`fixed ${showBannerAd ? 'bottom-32' : 'bottom-20'} right-4 z-30 p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/40 active:scale-95 transition-all flex items-center justify-center border border-emerald-400/40`}
          title="WhatsApp Support"
          aria-label="WhatsApp Support"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
        </button>

        {/* Sticky Banner Ad (Right above BottomNavBar, hidden for Admin) */}
        {showBannerAd && (
          <div className="fixed bottom-16 left-0 right-0 z-30 pointer-events-none px-2 flex justify-center">
            <div className="w-full max-w-lg pointer-events-auto">
              <BannerAd
                language={language}
                isAdmin={isUserAdmin}
                onDismiss={() => setAdDismissed(true)}
                isDismissed={adDismissed}
              />
            </div>
          </div>
        )}

        {/* Bottom Navigation Tabs (STRICT: Home, Cart, Orders, Profile) */}
        {!isAdminDashboardOpen && (
          <BottomNavBar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setIsAdminDashboardOpen(false);
              setActiveTab(tab);
            }}
            language={language}
            cartCount={cartTotalItemsCount}
            orderCount={orders.length}
          />
        )}

        {/* Product Details & Bundle Selection Modal (with Add-to-Cart and Buy-Directly) */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          language={language}
          currency={currency}
          onProceedToCheckout={handleProceedSingleCheckout}
          onAddToCart={handleAddToCart}
        />

        {/* Checkout & Payment Modal (handles single item or cart checkout) */}
        {checkoutData && (
          <CheckoutModal
            product={checkoutData.product}
            bundle={checkoutData.bundle}
            playerId={checkoutData.playerId}
            nickname={checkoutData.nickname}
            isPlayerNameVerified={checkoutData.isVerified}
            serverRegion={checkoutData.serverRegion}
            playerLevel={checkoutData.playerLevel}
            cartItems={checkoutData.cartItems}
            language={language}
            currency={currency}
            paymentMethods={paymentMethods}
            whatsappNumber={whatsappNumber}
            coupons={coupons}
            initialAppliedCoupon={checkoutData.initialCoupon}
            onClose={() => setCheckoutData(null)}
            onOrderCompleted={handleOrderCompleted}
            onNavigateToOrders={() => {
              setCheckoutData(null);
              setIsAdminDashboardOpen(false);
              setActiveTab('orders');
            }}
          />
        )}
      </div>
    </PhoneSimulatorFrame>
  );
}
