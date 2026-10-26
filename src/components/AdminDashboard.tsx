import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShoppingBag,
  Layers,
  ArrowLeft,
  X,
  Save,
  MessageCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  CreditCard,
  Phone,
  Hash,
  KeyRound,
  Sparkles,
  Zap,
  Image as ImageIcon,
  UploadCloud,
  FolderOpen,
  RefreshCw,
  Eye,
  Ticket,
  Tag,
  Percent,
  Star,
  Award,
} from 'lucide-react';
import { Product, ProductBundle, Order, Language, ProductCategory, PaymentMethod, Coupon } from '../types/store';
import { getTranslation } from '../data/translations';

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status'], digitalCode?: string) => void;
  paymentMethods: PaymentMethod[];
  onUpdatePaymentMethods: (updatedMethods: PaymentMethod[]) => void;
  whatsappNumber: string;
  onUpdateWhatsAppNumber: (newNumber: string) => void;
  coupons?: Coupon[];
  onAddCoupon?: (newCoupon: Coupon) => void;
  onUpdateCoupon?: (updatedCoupon: Coupon) => void;
  onDeleteCoupon?: (couponId: string) => void;
  language: Language;
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders,
  onUpdateOrderStatus,
  paymentMethods,
  onUpdatePaymentMethods,
  whatsappNumber,
  onUpdateWhatsAppNumber,
  coupons = [],
  onAddCoupon,
  onUpdateCoupon,
  onDeleteCoupon,
  language,
  onBackToApp,
}) => {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'payments' | 'security'>('products');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [orderCodes, setOrderCodes] = useState<Record<string, string>>({});
  const [orderCodeErrors, setOrderCodeErrors] = useState<Record<string, string>>({});
  const [orderSuccessToast, setOrderSuccessToast] = useState<string | null>(null);
  const [copiedDeliveredCodeId, setCopiedDeliveredCodeId] = useState<string | null>(null);

  // Edit / Add Product Modal State (with dual DZD & USD price inputs, descriptions, and package bundles)
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('pubg');
  const [formPriceDZD, setFormPriceDZD] = useState('1000');
  const [formPriceUSD, setFormPriceUSD] = useState('5.00');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formRequiresId, setFormRequiresId] = useState(true);
  const [formBundles, setFormBundles] = useState<ProductBundle[]>([]);

  // Coupon Management State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [formCouponCode, setFormCouponCode] = useState('');
  const [formCouponType, setFormCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [formCouponValue, setFormCouponValue] = useState('10');
  const [formCouponMinOrder, setFormCouponMinOrder] = useState('');
  const [formCouponExpiry, setFormCouponExpiry] = useState('');
  const [formCouponLimit, setFormCouponLimit] = useState('');
  const [formCouponDescAr, setFormCouponDescAr] = useState('');
  const [formCouponDescEn, setFormCouponDescEn] = useState('');
  const [formCouponIsActive, setFormCouponIsActive] = useState(true);
  const [couponToast, setCouponToast] = useState<string | null>(null);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // Gallery Image Picker & Cloud Storage state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [copiedStorageRules, setCopiedStorageRules] = useState(false);

  // Orders Filter
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');

  // Payment Accounts & WhatsApp Management State
  const [adminWhatsApp, setAdminWhatsApp] = useState(whatsappNumber);
  const [localPaymentMethods, setLocalPaymentMethods] = useState<PaymentMethod[]>(paymentMethods);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Stats calculation
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completed').length;
  const totalRevenueDZD = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.priceDZD, 0);

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const handleSelectGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'ar' ? 'حجم الصورة كبير جداً، الحد الأقصى المسموح هو 5 ميجابايت' : 'Image exceeds maximum 5MB size limit');
      return;
    }

    setSelectedFileName(file.name);
    setIsUploadingImage(true);
    setUploadProgress(25);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadProgress(70);

      // Simulate cloud upload to Firebase Storage bucket and generating secure URL
      setTimeout(() => {
        setUploadProgress(100);
        setIsUploadingImage(false);
        setFormImageUrl(dataUrl);
        setUploadSuccessToast(true);
        setTimeout(() => setUploadSuccessToast(false), 3500);
      }, 450);
    };

    reader.onerror = () => {
      setIsUploadingImage(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setFormTitleAr('');
    setFormTitleEn('');
    setFormDescAr('شحن رسمي ومضمون فوراً عبر المعرف الرسمي ID.');
    setFormDescEn('Instant official top-up delivery directly via Player ID.');
    setFormCategory('pubg');
    setFormPriceDZD('1000');
    setFormPriceUSD('5.00');
    setFormImageUrl('/src/assets/images/pubg_mobile_banner_1792845101593.jpg');
    setSelectedFileName(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setUploadSuccessToast(false);
    setShowManualUrlInput(false);
    setFormRequiresId(true);
    setFormBundles([
      {
        id: `bundle-${Date.now()}-1`,
        nameAr: 'باقة 60 شدة / جوهرة',
        nameEn: '60 UC / Diamonds',
        amount: '60',
        priceDZD: 220,
        priceUSD: 1.1,
        priceEUR: 1.0,
        popular: false,
        bestValue: false,
      },
      {
        id: `bundle-${Date.now()}-2`,
        nameAr: 'باقة 325 شدة (شعبية)',
        nameEn: '325 UC Popular Bundle',
        amount: '325',
        bonus: '+25 Bonus',
        priceDZD: 1050,
        priceUSD: 5.2,
        priceEUR: 4.8,
        popular: true, // "الأكثر طلباً"
        bestValue: false,
      },
      {
        id: `bundle-${Date.now()}-3`,
        nameAr: 'باقة 660 رويال باس (أفضل توفير)',
        nameEn: '660 Royale Pass (Best Value)',
        amount: '660',
        bonus: '+60 Bonus',
        priceDZD: 2100,
        priceUSD: 10.4,
        priceEUR: 9.6,
        popular: false,
        bestValue: true, // "أفضل توفير"
      },
    ]);
    setIsEditing(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormTitleAr(prod.titleAr);
    setFormTitleEn(prod.titleEn);
    setFormDescAr(prod.descriptionAr);
    setFormDescEn(prod.descriptionEn);
    setFormCategory(prod.category);
    setFormPriceDZD(String(prod.bundles[0]?.priceDZD || 1000));
    setFormPriceUSD(String(prod.bundles[0]?.priceUSD || 5.0));
    setFormImageUrl(prod.bannerImage);
    setSelectedFileName(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setUploadSuccessToast(false);
    setShowManualUrlInput(false);
    setFormRequiresId(prod.requiresPlayerId);
    setFormBundles(
      prod.bundles && prod.bundles.length > 0
        ? prod.bundles.map((b) => ({ ...b }))
        : [
            {
              id: `${prod.id}-b1`,
              nameAr: `باقة أساسية`,
              nameEn: `Standard Bundle`,
              amount: 'Standard',
              priceDZD: 1000,
              priceUSD: 5.0,
              priceEUR: 4.6,
              popular: true,
              bestValue: false,
            },
          ]
    );
    setIsEditing(true);
  };

  const handleAddBundleTier = () => {
    const newTier: ProductBundle = {
      id: `b-${Date.now()}`,
      nameAr: `باقة جديدة`,
      nameEn: `New Tier`,
      amount: '100',
      priceDZD: 500,
      priceUSD: 2.5,
      priceEUR: 2.3,
      popular: false,
      bestValue: false,
    };
    setFormBundles((prev) => [...prev, newTier]);
  };

  const handleRemoveBundleTier = (id: string) => {
    if (formBundles.length <= 1) return;
    setFormBundles((prev) => prev.filter((b) => b.id !== id));
  };

  const handleUpdateBundleTier = (id: string, updates: Partial<ProductBundle>) => {
    setFormBundles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const handleSetBundleBadge = (bundleId: string, badgeType: 'none' | 'popular' | 'bestValue') => {
    setFormBundles((prev) =>
      prev.map((b) => {
        if (b.id === bundleId) {
          return {
            ...b,
            popular: badgeType === 'popular',
            bestValue: badgeType === 'bestValue',
          };
        }
        // If this bundle gets a badge, ensure other bundles don't conflict if desired, or keep independent
        if (badgeType === 'popular' && b.popular) {
          return { ...b, popular: false };
        }
        if (badgeType === 'bestValue' && b.bestValue) {
          return { ...b, bestValue: false };
        }
        return b;
      })
    );
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBundles = formBundles.length > 0 ? formBundles : [
      {
        id: `b-${Date.now()}`,
        nameAr: `باقة أساسية`,
        nameEn: `Standard Tier`,
        amount: '1',
        priceDZD: parseInt(formPriceDZD, 10) || 1000,
        priceUSD: parseFloat(formPriceUSD) || 5.0,
        priceEUR: 4.6,
        popular: true,
        bestValue: false,
      },
    ];

    const dzd = finalBundles[0]?.priceDZD || (parseInt(formPriceDZD, 10) || 1000);
    const usd = finalBundles[0]?.priceUSD || (parseFloat(formPriceUSD) || Number((dzd / 200).toFixed(2)));

    if (editingProductId) {
      // Update existing
      const existing = products.find((p) => p.id === editingProductId);
      if (existing) {
        const updated: Product = {
          ...existing,
          titleAr: formTitleAr.trim(),
          titleEn: formTitleEn.trim() || formTitleAr.trim(),
          descriptionAr: formDescAr.trim(),
          descriptionEn: formDescEn.trim(),
          category: formCategory,
          bannerImage: formImageUrl.trim(),
          requiresPlayerId: formRequiresId,
          bundles: finalBundles,
        };
        onUpdateProduct(updated);
      }
    } else {
      // Add new
      const newId = `item-${Date.now()}`;
      const newProduct: Product = {
        id: newId,
        category: formCategory,
        titleAr: formTitleAr.trim(),
        titleEn: formTitleEn.trim() || formTitleAr.trim(),
        taglineAr: 'شحن فوري ومعتمد',
        taglineEn: 'Instant top-up delivery',
        descriptionAr: formDescAr.trim() || 'شحن فوري ومضمون 100% عبر الحساب الرسمي.',
        descriptionEn: formDescEn.trim() || 'Instant and guaranteed digital card top-up.',
        icon: 'Crosshair',
        bannerImage: formImageUrl.trim() || '/src/assets/images/chahndz_store_hero_1792845100871.jpg',
        requiresPlayerId: formRequiresId,
        requiresZoneOrServer: false,
        idGuideAr: 'أدخل معرف اللاعب أو اسم الحساب المراد شحنه.',
        idGuideEn: 'Enter in-game player ID or account handle.',
        deliveryTimeAr: 'من دقيقة إلى 5 دقائق',
        deliveryTimeEn: '1 to 5 minutes',
        accentColor: '#F59E0B',
        bundles: finalBundles,
      };
      onAddProduct(newProduct);
    }

    setIsEditing(false);
  };

  // Coupon Management Handlers
  const handleOpenAddCouponModal = () => {
    setEditingCouponId(null);
    setFormCouponCode('');
    setFormCouponType('percentage');
    setFormCouponValue('10');
    setFormCouponMinOrder('');
    setFormCouponExpiry('');
    setFormCouponLimit('100');
    setFormCouponDescAr('خصم حصري على باقات الشحن');
    setFormCouponDescEn('Special discount on gaming top-ups');
    setFormCouponIsActive(true);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCouponModal = (cpn: Coupon) => {
    setEditingCouponId(cpn.id);
    setFormCouponCode(cpn.code);
    setFormCouponType(cpn.discountType);
    setFormCouponValue(String(cpn.discountValue));
    setFormCouponMinOrder(cpn.minOrderDZD ? String(cpn.minOrderDZD) : '');
    setFormCouponExpiry(cpn.expiresAt || '');
    setFormCouponLimit(cpn.usageLimit ? String(cpn.usageLimit) : '');
    setFormCouponDescAr(cpn.descriptionAr || '');
    setFormCouponDescEn(cpn.descriptionEn || '');
    setFormCouponIsActive(cpn.isActive);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formCouponCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) return;

    const val = parseFloat(formCouponValue) || 10;
    const minOrder = formCouponMinOrder ? parseInt(formCouponMinOrder, 10) : undefined;
    const limit = formCouponLimit ? parseInt(formCouponLimit, 10) : undefined;
    const usdVal = formCouponType === 'fixed' ? Number((val / 200).toFixed(2)) : undefined;

    if (editingCouponId) {
      const existing = coupons.find((c) => c.id === editingCouponId);
      if (existing && onUpdateCoupon) {
        onUpdateCoupon({
          ...existing,
          code: cleanCode,
          discountType: formCouponType,
          discountValue: val,
          discountValueUSD: usdVal,
          minOrderDZD: minOrder,
          expiresAt: formCouponExpiry || undefined,
          usageLimit: limit,
          isActive: formCouponIsActive,
          descriptionAr: formCouponDescAr.trim() || undefined,
          descriptionEn: formCouponDescEn.trim() || undefined,
        });
        setCouponToast(language === 'ar' ? `تم تحديث كود الخصم ${cleanCode} بنجاح!` : `Coupon ${cleanCode} updated!`);
      }
    } else if (onAddCoupon) {
      const newCoupon: Coupon = {
        id: `cpn-${Date.now()}`,
        code: cleanCode,
        discountType: formCouponType,
        discountValue: val,
        discountValueUSD: usdVal,
        minOrderDZD: minOrder,
        expiresAt: formCouponExpiry || undefined,
        usageLimit: limit,
        usedCount: 0,
        isActive: formCouponIsActive,
        descriptionAr: formCouponDescAr.trim() || undefined,
        descriptionEn: formCouponDescEn.trim() || undefined,
      };
      onAddCoupon(newCoupon);
      setCouponToast(language === 'ar' ? `تم إنشاء كود الخصم ${cleanCode} بنجاح!` : `New coupon ${cleanCode} created!`);
    }

    setIsCouponModalOpen(false);
    setTimeout(() => setCouponToast(null), 3000);
  };

  const handleToggleCouponStatus = (cpn: Coupon) => {
    if (onUpdateCoupon) {
      onUpdateCoupon({ ...cpn, isActive: !cpn.isActive });
    }
  };

  const handleDeleteCouponAction = (couponId: string) => {
    if (window.confirm(t.confirmDeleteCoupon)) {
      if (onDeleteCoupon) onDeleteCoupon(couponId);
    }
  };

  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(null), 2000);
  };

  // Payment Accounts & WhatsApp settings update
  const handlePaymentMethodFieldChange = (
    id: PaymentMethod['id'],
    field: 'accountNumber' | 'accountHolder' | 'instructionsAr',
    val: string
  ) => {
    setLocalPaymentMethods((prev) =>
      prev.map((pm) => (pm.id === id ? { ...pm, [field]: val } : pm))
    );
  };

  const handleSaveSettings = () => {
    onUpdateWhatsAppNumber(adminWhatsApp.trim());
    onUpdatePaymentMethods(localPaymentMethods);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  const handleGenerateSampleCode = (order: Order) => {
    let prefix = 'DZ-TOPUP-';
    const prodLower = (order.productId || '').toLowerCase();
    if (prodLower.includes('pubg')) prefix = 'PUBG-UC660-';
    else if (prodLower.includes('free') || prodLower.includes('fire')) prefix = 'FF-530-';
    else if (prodLower.includes('tiktok')) prefix = 'TIKTOK-';
    else if (prodLower.includes('gift') || prodLower.includes('google')) prefix = 'GPLAY-DZ-';

    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generated = `${prefix}${part1}-${part2}`;

    setOrderCodes((prev) => ({ ...prev, [order.id]: generated }));
    setOrderCodeErrors((prev) => ({ ...prev, [order.id]: '' }));
  };

  const handleConfirmAndSendCode = (order: Order) => {
    const code = (orderCodes[order.id] || '').trim();
    if (!code) {
      setOrderCodeErrors((prev) => ({
        ...prev,
        [order.id]: t.adminCodeRequiredError,
      }));
      return;
    }

    setOrderCodeErrors((prev) => ({ ...prev, [order.id]: '' }));
    onUpdateOrderStatus(order.id, 'completed', code);
    setOrderSuccessToast(
      language === 'ar'
        ? `تم اعتماد الطلب #${order.id} وإرسال الكود (${code}) بنجاح داخل شاشة طلباتي للزبون!`
        : `Order #${order.id} confirmed and code (${code}) delivered to customer's "My Orders"!`
    );
    setTimeout(() => setOrderSuccessToast(null), 3500);
  };

  const handleCopyDeliveredCode = (orderId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedDeliveredCodeId(orderId);
    setTimeout(() => setCopiedDeliveredCodeId(null), 2000);
  };

  const handleMessageCustomerWhatsApp = (order: Order) => {
    const text = language === 'ar'
      ? `مرحباً، بخصوص طلب الشحن #${order.id} لمعرف الوصل (${order.receiptId}) للعبة ${order.productTitle}: حالياً (${order.status}).`
      : `Hello, regarding your top-up order #${order.id} (Receipt ID: ${order.receiptId}) for ${order.productTitle}: Status is (${order.status}).`;
    const cleanNumber = adminWhatsApp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Check if requesting user is store admin
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == 'taybawi8@gmail.com' ||
        request.auth.token.email == 'admin@chahndz.com' ||
        request.auth.token.role == 'admin'
      );
    }

    // Products & Pricing Catalog (Dual DZD & USD)
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin(); // Admin only: Add, Edit, Delete
    }

    // App Store Settings & Payment Accounts
    match /settings/{docId} {
      allow read: if true;
      allow write: if isAdmin(); // Admin only: update WhatsApp number & BaridiMob RIP
    }

    // Customer Incoming Orders
    match /orders/{orderId} {
      // Must submit mandatory receiptId
      allow create: if request.auth != null && request.resource.data.receiptId != null;
      allow read: if request.auth != null && (
        resource.data.customerEmail == request.auth.token.email ||
        isAdmin()
      );
      // ONLY Admin can confirm orders (change pending to completed)
      allow update, delete: if isAdmin();
    }
  }
}`;

  const storageRulesCode = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 1. Product Images uploaded from phone gallery by Store Admin
    match /products/{imageId} {
      allow read: if true; // Public read for customers viewing catalog
      allow write: if request.auth != null && (
        request.auth.token.email == 'taybawi8@gmail.com' ||
        request.auth.token.email == 'admin@chahndz.com' ||
        request.auth.token.role == 'admin'
      ) && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    // 2. Customer Payment Receipts
    match /receipts/{orderId}/{receiptId} {
      allow create: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
      allow read: if request.auth != null;
    }
  }
}`;

  return (
    <div className="min-h-full bg-[#080B14] p-3 sm:p-4 space-y-4 select-none">
      {/* Top Admin Header */}
      <div className="bg-[#0E1322] rounded-3xl p-4 border border-amber-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black font-extrabold shadow-md shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>{t.adminTitle}</span>
              </h1>
              <p className="text-xs text-amber-400 font-medium">{t.adminSubtitle}</p>
            </div>
          </div>

          <button
            onClick={onBackToApp}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <span>{language === 'ar' ? 'الرجوع للمتجر' : 'Back to Store'}</span>
          </button>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
          <div className="bg-[#090C16] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.totalIncomingOrders}</span>
            <span className="text-base font-extrabold text-white tabular-nums">{totalOrdersCount}</span>
          </div>
          <div className="bg-[#090C16] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">{t.pendingCount}</span>
            <span className="text-base font-extrabold text-amber-400 tabular-nums">{pendingOrdersCount}</span>
          </div>
          <div className="bg-[#090C16] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold block">{t.completedCount}</span>
            <span className="text-base font-extrabold text-emerald-400 tabular-nums">{completedOrdersCount}</span>
          </div>
          <div className="bg-[#090C16] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-cyan-400 uppercase font-semibold block">{language === 'ar' ? 'إجمالي المبيعات' : 'Revenue'}</span>
            <span className="text-base font-extrabold text-cyan-400 tabular-nums">{totalRevenueDZD.toLocaleString()} دج</span>
          </div>
        </div>

        {/* Navigation Tabs inside Admin (5 Tabs) */}
        <div className="grid grid-cols-5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'products' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tabProducts}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all relative ${
              activeTab === 'orders' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tabOrders}</span>
            {pendingOrdersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-2 px-1 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'coupons' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tabCoupons}</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-1 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'payments' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tabPaymentSettings}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'security' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tabRules}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Product Catalog & Dual-Price Management */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {language === 'ar' ? 'المنتجات والبطاقات الحالية' : 'Store Catalog Items'} ({products.length})
            </span>

            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewProduct}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((p) => {
              const minPriceDZD = p.bundles[0]?.priceDZD || 0;
              const minPriceUSD = p.bundles[0]?.priceUSD || (minPriceDZD / 200);
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-[#0E1322] border border-slate-800 space-y-2.5 flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                      <img src={p.bannerImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{p.titleAr}</span>
                        <span className="text-[10px] text-amber-400 font-semibold uppercase bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{p.titleEn}</p>
                      
                      {/* Real-time Dual Price Display (DZD & USD) */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-extrabold text-amber-400 tabular-nums">
                          {minPriceDZD.toLocaleString()} دج
                        </span>
                        <span className="text-xs font-semibold text-cyan-400 font-mono tabular-nums">
                          (${minPriceUSD.toFixed(2)})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{language === 'ar' ? 'تعديل السعر والبيانات' : 'Edit'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(t.confirmDelete)) {
                          onDeleteProduct(p.id);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Incoming Orders Management with Manual Confirmation & Receipt ID */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orderSuccessToast && (
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{orderSuccessToast}</span>
            </div>
          )}

          {/* Order status filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  orderFilter === st
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                {st === 'all' && (language === 'ar' ? 'جميع الطلبات' : 'All Orders')}
                {st === 'pending' && t.statusPending}
                {st === 'processing' && t.statusProcessing}
                {st === 'completed' && t.statusCompleted}
                {st === 'failed' && t.statusFailed}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center bg-[#0E1322] rounded-2xl border border-slate-800 text-slate-400 text-xs">
              {t.noOrdersYet}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isPending = order.status === 'pending';
                const isCompleted = order.status === 'completed';

                return (
                  <div
                    key={order.id}
                    className={`p-3.5 rounded-2xl bg-[#0E1322] border space-y-3 shadow-sm transition-all ${
                      isPending ? 'border-amber-500/50 shadow-amber-500/5' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">#{order.id}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(order.timestamp).toLocaleString(language === 'ar' ? 'ar-DZ' : 'en-US', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : isPending
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {order.status === 'completed' && t.statusCompleted}
                        {order.status === 'pending' && t.statusPending}
                        {order.status === 'processing' && t.statusProcessing}
                        {order.status === 'failed' && t.statusFailed}
                      </span>
                    </div>

                    {/* Order Details and Mandatory Receipt ID box */}
                    <div className="bg-[#090C16] p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-white">{order.productTitle}</span>
                        <span className="font-extrabold text-amber-400 tabular-nums">
                          {order.priceDZD.toLocaleString()} دج
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>{t.selectedPackage} {order.bundleTitle}</span>
                        <span className="uppercase font-semibold text-slate-300">{order.paymentMethod}</span>
                      </div>

                      {/* Applied Coupon Info if any */}
                      {order.couponCode && (
                        <div className="flex items-center justify-between text-[11px] bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-lg">
                          <span className="text-amber-300 font-bold flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t.couponUsedBadge}: <span className="font-mono text-white font-extrabold">{order.couponCode}</span></span>
                          </span>
                          <span className="text-emerald-400 font-bold font-mono">
                            -{order.discountDZD?.toLocaleString()} دج {order.discountUSD ? `(-$${order.discountUSD.toFixed(2)})` : ''}
                          </span>
                        </div>
                      )}

                      {/* SUBMITTED RECEIPT ID (KEY FEATURE) */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between bg-amber-950/20 p-2 rounded-lg border border-amber-500/30">
                        <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5" />
                          <span>{t.receiptIdSubmitted}</span>
                        </span>
                        <span className="font-mono text-xs font-extrabold text-white bg-black/60 px-2 py-0.5 rounded border border-amber-500/40">
                          {order.receiptId || 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px] pt-1">
                        <span className="text-slate-400">
                          Player ID: <span className="font-mono text-cyan-400 font-bold">{order.playerId}</span>
                        </span>
                        {order.playerNickname && (
                          <span className="text-slate-400">Nick: {order.playerNickname}</span>
                        )}
                      </div>
                    </div>

                    {/* FEATURE 5 & 6: Digital Voucher Fulfillment Section */}
                    {isPending && (
                      <div className="p-3 rounded-xl bg-[#070912] border border-amber-500/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{t.adminDigitalCodeLabel}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleGenerateSampleCode(order)}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded transition-all active:scale-95"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>{t.adminGenerateSampleCode}</span>
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            value={orderCodes[order.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrderCodes((prev) => ({ ...prev, [order.id]: val }));
                              if (orderCodeErrors[order.id]) {
                                setOrderCodeErrors((prev) => ({ ...prev, [order.id]: '' }));
                              }
                            }}
                            placeholder={t.adminDigitalCodePlaceholder}
                            className={`w-full bg-[#0C101D] border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono ${
                              orderCodeErrors[order.id]
                                ? 'border-red-500 ring-1 ring-red-500'
                                : 'border-slate-700 focus:border-amber-500'
                            }`}
                          />
                        </div>

                        {orderCodeErrors[order.id] && (
                          <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>{orderCodeErrors[order.id]}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Delivered Digital Code Display for Completed Orders */}
                    {isCompleted && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 block">{t.adminDeliveredCodeLabel}</span>
                            <span className="font-mono font-bold text-white tracking-wider">
                              {order.digitalCode || 'DZ-AUTO-FULFILLED-UC660'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyDeliveredCode(order.id, order.digitalCode || 'DZ-AUTO-FULFILLED-UC660')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/60 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          {copiedDeliveredCodeId === order.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>{t.codeCopiedSuccess}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{t.copyDigitalCode}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Action Row: Manual Confirm Order Button + WhatsApp Contact + Receipt Preview */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        {order.receiptDataUrl ? (
                          <button
                            onClick={() => setSelectedReceipt(order.receiptDataUrl || null)}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{t.viewReceipt}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">{t.noReceipt}</span>
                        )}

                        <button
                          onClick={() => handleMessageCustomerWhatsApp(order)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>واتساب العميل</span>
                        </button>
                      </div>

                      {/* Manual Confirmation & Code Delivery Button */}
                      {isPending ? (
                        <button
                          onClick={() => handleConfirmAndSendCode(order)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t.adminConfirmAndSendCode}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                          <Check className="w-3.5 h-3.5" />
                          <span>تم التأكيد وإرسال الكود للزبون ✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Promo Codes & Discount Coupons Management */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          {couponToast && (
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{couponToast}</span>
            </div>
          )}

          {/* Header & Create Promo Code Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0E1322] p-4 rounded-3xl border border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-cyan-400" />
                <span>{t.couponsTitle}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.couponsSubtitle}
              </p>
            </div>

            <button
              onClick={handleOpenAddCouponModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/40 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewCoupon}</span>
            </button>
          </div>

          {/* Coupon Statistics Ribbon */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#090C16] p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{language === 'ar' ? 'إجمالي القسائم' : 'Total Coupons'}</span>
              <span className="text-base font-extrabold text-white tabular-nums">{coupons.length}</span>
            </div>
            <div className="bg-[#090C16] p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold block">{language === 'ar' ? 'القسائم النشطة' : 'Active'}</span>
              <span className="text-base font-extrabold text-emerald-400 tabular-nums">
                {coupons.filter((c) => c.isActive).length}
              </span>
            </div>
            <div className="bg-[#090C16] p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">{language === 'ar' ? 'مرات الاستخدام' : 'Total Used'}</span>
              <span className="text-base font-extrabold text-amber-400 tabular-nums">
                {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
              </span>
            </div>
          </div>

          {/* Coupons List */}
          {coupons.length === 0 ? (
            <div className="p-8 text-center bg-[#0E1322] rounded-3xl border border-slate-800 space-y-3">
              <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">{t.noCouponsFound}</p>
              <button
                onClick={handleOpenAddCouponModal}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
              >
                {t.addNewCoupon}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coupons.map((coupon) => {
                const isExpired = coupon.expiresAt && new Date().toISOString().split('T')[0] > coupon.expiresAt;
                const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

                return (
                  <div
                    key={coupon.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      !coupon.isActive
                        ? 'bg-[#0A0D16]/60 border-slate-800/60 opacity-60'
                        : isExpired || isLimitReached
                        ? 'bg-[#0E1322] border-amber-900/40'
                        : 'bg-[#0E1322] border-slate-800 hover:border-cyan-500/30'
                    }`}
                  >
                    {/* Top Row: Code + Copy + Status Toggle */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-white bg-[#060810] px-2.5 py-1 rounded-lg border border-slate-700 tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopyCouponCode(coupon.code)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title={language === 'ar' ? 'نسخ الكود' : 'Copy Code'}
                        >
                          {copiedCouponCode === coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Active/Inactive Switch */}
                      <button
                        onClick={() => handleToggleCouponStatus(coupon)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all border ${
                          coupon.isActive
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${coupon.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <span>{coupon.isActive ? t.statusActive : t.statusInactive}</span>
                      </button>
                    </div>

                    {/* Value Badge & Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {coupon.discountType === 'percentage' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/50">
                            <Percent className="w-3 h-3" />
                            <span>{coupon.discountValue}% {language === 'ar' ? 'خصم مئوي' : 'Off'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/50">
                            <Tag className="w-3 h-3" />
                            <span>{coupon.discountValue.toLocaleString()} دج (${coupon.discountValueUSD || (coupon.discountValue / 200).toFixed(2)})</span>
                          </span>
                        )}

                        {coupon.minOrderDZD && (
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {language === 'ar' ? 'الحد الأدنى:' : 'Min:'} {coupon.minOrderDZD.toLocaleString()} دج
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {language === 'ar'
                          ? coupon.descriptionAr || 'تخفيض خاص لعملاء المتجر'
                          : coupon.descriptionEn || 'Special discount for store customers'}
                      </p>
                    </div>

                    {/* Usage Progress & Expiration Status */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>
                          {t.usedTimes}: <span className="font-mono font-bold text-white">{coupon.usedCount}</span>
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ` (${t.unlimited})`}
                        </span>
                        <span>
                          {coupon.expiresAt ? (
                            <span className={isExpired ? 'text-red-400 font-bold' : 'text-slate-400'}>
                              {isExpired ? (language === 'ar' ? 'منتهي' : 'Expired') : `${t.expiryDate}: ${coupon.expiresAt}`}
                            </span>
                          ) : (
                            <span className="text-emerald-400">{t.noExpiry}</span>
                          )}
                        </span>
                      </div>

                      {coupon.usageLimit && (
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${isLimitReached ? 'bg-red-500' : 'bg-cyan-400'}`}
                            style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Edit / Delete */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditCouponModal(coupon)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t.editCoupon}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCouponAction(coupon.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.deleteCoupon}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Payment Accounts & Admin WhatsApp Number Management */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-[#0E1322] p-4 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{t.adminWhatsAppLabel}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.adminWhatsAppHelp}
              </p>
            </div>

            <div className="bg-[#090C16] p-3 rounded-2xl border border-slate-800 flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/50 px-2 py-1 rounded border border-amber-800/40">
                WhatsApp
              </span>
              <input
                type="text"
                value={adminWhatsApp}
                onChange={(e) => setAdminWhatsApp(e.target.value)}
                placeholder="213660000000"
                className="flex-1 bg-transparent text-sm font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Accounts Configuration (BaridiMob, CCP, Paysera, Binance, RedotPay) */}
          <div className="bg-[#0E1322] p-4 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>تعديل أرقام حسابات الدفع (تنعكس فورياً عند الزبائن)</span>
            </h2>

            <div className="space-y-3">
              {localPaymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="p-3.5 rounded-2xl bg-[#090C16] border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{pm.nameAr}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{pm.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {language === 'ar' ? 'رقم الحساب أو الـ RIP:' : 'Account / RIP Number:'}
                      </label>
                      <input
                        type="text"
                        value={pm.accountNumber}
                        onChange={(e) =>
                          handlePaymentMethodFieldChange(pm.id, 'accountNumber', e.target.value)
                        }
                        className="w-full bg-[#0E1322] text-xs font-mono text-white p-2 rounded-xl border border-slate-700 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {language === 'ar' ? 'اسم صاحب الحساب:' : 'Beneficiary Name:'}
                      </label>
                      <input
                        type="text"
                        value={pm.accountHolder}
                        onChange={(e) =>
                          handlePaymentMethodFieldChange(pm.id, 'accountHolder', e.target.value)
                        }
                        className="w-full bg-[#0E1322] text-xs text-white p-2 rounded-xl border border-slate-700 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {settingsSavedToast && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-xs text-emerald-300 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t.settingsSavedSuccess}</span>
              </div>
            )}

            <button
              onClick={handleSaveSettings}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Database Rules */}
      {activeTab === 'security' && (
        <div className="space-y-3">
          <div className="bg-[#0E1322] p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Firestore Security Rules (قواعد أمان قاعدة البيانات)</span>
              </span>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(firestoreRulesCode);
                  setCopiedRules(true);
                  setTimeout(() => setCopiedRules(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1"
              >
                {copiedRules ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRules ? 'تم النسخ!' : 'نسخ القواعد'}</span>
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              تحمي متجرك بالكامل: تفرض وجود معرف الوصل (receiptId) في كل طلب، وتمنع تغيير الأسعار أو الحسابات إلا لحساب المسؤول taybawi8@gmail.com.
            </p>
            <pre className="p-3 bg-[#07090F] rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800/80 max-h-72">
              <code>{firestoreRulesCode}</code>
            </pre>
          </div>

          <div className="bg-[#0E1322] p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>Firebase Storage Rules (قواعد أمان رفع الصور والتخزين السحابي)</span>
              </span>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(storageRulesCode);
                  setCopiedStorageRules(true);
                  setTimeout(() => setCopiedStorageRules(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1"
              >
                {copiedStorageRules ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStorageRules ? 'تم النسخ!' : 'نسخ قواعد التخزين'}</span>
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              تسمح للمسؤول فقط برفع وتعديل صور منتجات المعرض (PNG/JPEG) بحجم أقصى 5 ميجابايت، وتتيح لجميع الزبائن استعراض الصور بسرعة.
            </p>
            <pre className="p-3 bg-[#07090F] rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800/80 max-h-72">
              <code>{storageRulesCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal with Dual Prices (DZD & USD) and Descriptions */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#0D1220] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0A0E1A]">
              <h2 className="text-sm font-bold text-white">
                {editingProductId ? t.editProduct : t.addNewProduct}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">{t.productTitleAr} *</label>
                <input
                  type="text"
                  required
                  value={formTitleAr}
                  onChange={(e) => setFormTitleAr(e.target.value)}
                  placeholder="مثال: شدات ببجي موبايل أو بطاقة ستيم"
                  className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">{t.productTitleEn}</label>
                <input
                  type="text"
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder="e.g. Steam Gift Card 10$"
                  className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700 focus:border-amber-500"
                />
              </div>

              {/* Real-time Dual Price Management: DZD and USD */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                <div>
                  <label className="text-amber-400 font-bold block mb-1">{t.priceDZDLabel} *</label>
                  <input
                    type="number"
                    required
                    value={formPriceDZD}
                    onChange={(e) => {
                      setFormPriceDZD(e.target.value);
                      const num = parseFloat(e.target.value) || 0;
                      setFormPriceUSD((num / 200).toFixed(2));
                    }}
                    className="w-full bg-[#080B14] text-white p-2 rounded-xl border border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-cyan-400 font-bold block mb-1">{t.priceUSDLabel} *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPriceUSD}
                    onChange={(e) => setFormPriceUSD(e.target.value)}
                    className="w-full bg-[#080B14] text-white p-2 rounded-xl border border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">{t.productCategory}</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                  className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700"
                >
                  <option value="pubg">ببجي موبايل (PUBG)</option>
                  <option value="freefire">فري فاير (Free Fire)</option>
                  <option value="tiktok">تيك توك (TikTok)</option>
                  <option value="giftcards">بطاقات رقمية (Gift Cards)</option>
                </select>
              </div>

              {/* GALLERY IMAGE PICKER & CLOUD STORAGE UPLOAD */}
              <div className="p-3 rounded-2xl bg-[#090D18] border border-cyan-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-cyan-300 font-bold flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>{t.imagePreviewLabel}</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    PNG / JPEG (Max 5MB)
                  </span>
                </div>

                {/* Hidden Native File Input (Simulates Android Storage Access Framework / ACTION_GET_CONTENT) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleSelectGalleryImage}
                  className="hidden"
                />

                {/* Main Action Button: Select Image from Gallery */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-950/50 active:scale-98 transition-all disabled:opacity-50"
                >
                  <FolderOpen className="w-4 h-4 text-cyan-200" />
                  <span>{formImageUrl ? t.changeImageFromGallery : t.selectFromGallery}</span>
                </button>

                {/* Uploading Progress Bar */}
                {isUploadingImage && (
                  <div className="space-y-1.5 py-1">
                    <div className="flex items-center justify-between text-[11px] text-cyan-300">
                      <span className="flex items-center gap-1 font-semibold">
                        <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                        <span>{t.uploadingImageToCloud}</span>
                      </span>
                      <span className="font-mono font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Success Toast */}
                {uploadSuccessToast && (
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{t.imageUploadSuccess}</span>
                  </div>
                )}

                {/* Live Image Preview Card */}
                {formImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950/80 group">
                    <img
                      src={formImageUrl}
                      alt="Product preview"
                      className="w-full h-28 object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Top status badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-black font-extrabold flex items-center gap-1 shadow-sm">
                        <UploadCloud className="w-3 h-3" />
                        <span>Firebase Storage Ready</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setFormImageUrl('');
                          setSelectedFileName(null);
                        }}
                        className="p-1 rounded-full bg-red-600/90 hover:bg-red-500 text-white shadow-sm transition-all"
                        title={language === 'ar' ? 'حذف الصورة' : 'Remove Image'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom file details */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300">
                      <span className="truncate max-w-[200px] font-mono">
                        {selectedFileName || (formImageUrl.startsWith('data:') ? 'Gallery image (uploaded)' : formImageUrl.split('/').pop())}
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        {language === 'ar' ? 'تغيير' : 'Change'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 hover:border-slate-500 cursor-pointer transition-all"
                  >
                    <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
                    <span className="text-[11px] font-medium">{t.noImageSelected}</span>
                    <span className="text-[9px] text-slate-600">{t.gallerySupportedFormats}</span>
                  </div>
                )}

                {/* Quick Presets for Store Admin */}
                <div className="pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                    {t.samplePresets}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'ببجي موبايل', url: '/src/assets/images/pubg_mobile_banner_1792845101593.jpg' },
                      { name: 'فري فاير', url: '/src/assets/images/freefire_diamonds_banner_1792845101565.jpg' },
                      { name: 'تيك توك', url: '/src/assets/images/tiktok_giftcards_banner_1792845101174.jpg' },
                      { name: 'متجر عبود', url: '/src/assets/images/chahndz_store_hero_1792845100871.jpg' },
                    ].map((pre) => (
                      <button
                        key={pre.name}
                        type="button"
                        onClick={() => {
                          setFormImageUrl(pre.url);
                          setSelectedFileName(pre.name);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                          formImageUrl === pre.url
                            ? 'bg-amber-500 text-black border-amber-400 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {pre.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Manual URL field toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                    className="text-[10px] text-slate-500 hover:text-slate-400 underline"
                  >
                    {showManualUrlInput
                      ? (language === 'ar' ? 'إخفاء الرابط المباشر' : 'Hide direct URL')
                      : (language === 'ar' ? 'أو تعديل الرابط يدوياً (Manual URL)' : 'Or edit URL manually')}
                  </button>

                  {showManualUrlInput && (
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://... or data:image/..."
                      className="mt-1 w-full bg-[#06080F] text-white p-2 rounded-lg border border-slate-800 font-mono text-[10px]"
                    />
                  )}
                </div>
              </div>

              {/* PACKAGES & PROMOTIONAL BADGES MANAGEMENT (KEY FEATURE) */}
              <div className="p-3.5 rounded-2xl bg-[#090D18] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>{t.managePackages}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({formBundles.length})</span>
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {t.packageBadgeHelp}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBundleTier}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addPackage}</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {formBundles.map((b, idx) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-[#05070E] border border-slate-800 space-y-2 relative"
                    >
                      {/* Bundle Header & Delete button */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">
                          {language === 'ar' ? `الباقة #${idx + 1}` : `Tier #${idx + 1}`}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {b.popular && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500 text-black">
                              ★ {t.badgeMostPopular}
                            </span>
                          )}
                          {b.bestValue && !b.popular && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-cyan-500 text-black">
                              💎 {t.badgeBestValue}
                            </span>
                          )}

                          {formBundles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBundleTier(b.id)}
                              className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                              title={t.deletePackage}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Package Names (AR & EN) */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">{t.packageNameAr}</label>
                          <input
                            type="text"
                            value={b.nameAr}
                            onChange={(e) => handleUpdateBundleTier(b.id, { nameAr: e.target.value })}
                            placeholder="مثال: 325 شدة"
                            className="w-full bg-[#090C16] text-white p-1.5 rounded-lg border border-slate-700 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">{t.packageNameEn}</label>
                          <input
                            type="text"
                            value={b.nameEn}
                            onChange={(e) => handleUpdateBundleTier(b.id, { nameEn: e.target.value })}
                            placeholder="e.g. 325 UC"
                            className="w-full bg-[#090C16] text-white p-1.5 rounded-lg border border-slate-700 text-xs"
                          />
                        </div>
                      </div>

                      {/* Pricing Dual Inputs: DZD and USD */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-amber-400 font-bold block mb-0.5">دج (DZD) *</label>
                          <input
                            type="number"
                            value={b.priceDZD}
                            onChange={(e) => {
                              const d = parseInt(e.target.value, 10) || 0;
                              handleUpdateBundleTier(b.id, {
                                priceDZD: d,
                                priceUSD: Number((d / 200).toFixed(2)),
                              });
                            }}
                            className="w-full bg-[#090C16] text-white p-1.5 rounded-lg border border-slate-700 font-mono text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-cyan-400 font-bold block mb-0.5">USD ($) *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={b.priceUSD}
                            onChange={(e) =>
                              handleUpdateBundleTier(b.id, {
                                priceUSD: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-[#090C16] text-white p-1.5 rounded-lg border border-slate-700 font-mono text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-emerald-400 font-bold block mb-0.5">{t.packageBonus}</label>
                          <input
                            type="text"
                            value={b.bonus || ''}
                            onChange={(e) => handleUpdateBundleTier(b.id, { bonus: e.target.value || undefined })}
                            placeholder="+25 Bonus"
                            className="w-full bg-[#090C16] text-white p-1.5 rounded-lg border border-slate-700 text-xs"
                          />
                        </div>
                      </div>

                      {/* PROMOTIONAL BADGE SELECTION (REQUIREMENT 4) */}
                      <div className="pt-1.5 border-t border-slate-800/80">
                        <label className="text-[10px] text-slate-300 font-bold block mb-1">
                          {t.badgeSelection}
                        </label>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {/* Option 1: None */}
                          <button
                            type="button"
                            onClick={() => handleSetBundleBadge(b.id, 'none')}
                            className={`py-1 px-1.5 rounded-lg font-bold border transition-all text-center ${
                              !b.popular && !b.bestValue
                                ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                                : 'bg-[#090C16] text-slate-400 border-slate-800 hover:text-slate-300'
                            }`}
                          >
                            {t.badgeNone}
                          </button>

                          {/* Option 2: Most Popular (Orange / Amber Badge) */}
                          <button
                            type="button"
                            onClick={() => handleSetBundleBadge(b.id, 'popular')}
                            className={`py-1 px-1.5 rounded-lg font-bold border transition-all flex items-center justify-center gap-1 ${
                              b.popular
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-300 shadow-sm shadow-amber-500/20'
                                : 'bg-[#090C16] text-amber-400 border-amber-900/40 hover:border-amber-700'
                            }`}
                          >
                            <span>★</span>
                            <span>{t.badgeMostPopular}</span>
                          </button>

                          {/* Option 3: Best Value (Cyan / Blue Badge) */}
                          <button
                            type="button"
                            onClick={() => handleSetBundleBadge(b.id, 'bestValue')}
                            className={`py-1 px-1.5 rounded-lg font-bold border transition-all flex items-center justify-center gap-1 ${
                              b.bestValue
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black border-cyan-300 shadow-sm shadow-cyan-500/20'
                                : 'bg-[#090C16] text-cyan-400 border-cyan-900/40 hover:border-cyan-700'
                            }`}
                          >
                            <span>💎</span>
                            <span>{t.badgeBestValue}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">{t.productDescAr}</label>
                <textarea
                  rows={2}
                  value={formDescAr}
                  onChange={(e) => setFormDescAr(e.target.value)}
                  className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">{t.productDescEn}</label>
                <textarea
                  rows={2}
                  value={formDescEn}
                  onChange={(e) => setFormDescEn(e.target.value)}
                  className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqId"
                  checked={formRequiresId}
                  onChange={(e) => setFormRequiresId(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <label htmlFor="reqId" className="text-slate-300 cursor-pointer">
                  {t.productRequiresId}
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.saveChanges}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROMO CODE MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-md bg-[#0D1220] rounded-3xl border border-slate-700 p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-cyan-400" />
                <span>{editingCouponId ? t.editCoupon : t.addNewCoupon}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3.5 text-xs">
              {/* Coupon Code Input */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">{t.couponCode} *</label>
                <input
                  type="text"
                  required
                  value={formCouponCode}
                  onChange={(e) => setFormCouponCode(e.target.value.toUpperCase())}
                  placeholder={t.couponCodePlaceholder}
                  className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700 focus:border-cyan-400 font-mono font-black text-sm tracking-widest uppercase"
                />
              </div>

              {/* Discount Type Selector (Percentage vs Fixed) */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">{t.discountType}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCouponType('percentage')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      formCouponType === 'percentage'
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>{t.discountPercentage}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCouponType('fixed')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      formCouponType === 'fixed'
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{t.discountFixed}</span>
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {t.discountValue} ({formCouponType === 'percentage' ? '%' : 'دج DZD'}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={formCouponType === 'percentage' ? '100' : '100000'}
                  value={formCouponValue}
                  onChange={(e) => setFormCouponValue(e.target.value)}
                  placeholder={formCouponType === 'percentage' ? '10' : '500'}
                  className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700 font-mono text-sm font-bold"
                />
              </div>

              {/* Optional Minimum Order & Usage Limit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">{t.minOrderAmount}</label>
                  <input
                    type="number"
                    value={formCouponMinOrder}
                    onChange={(e) => setFormCouponMinOrder(e.target.value)}
                    placeholder="500"
                    className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">{t.usageLimit}</label>
                  <input
                    type="number"
                    value={formCouponLimit}
                    onChange={(e) => setFormCouponLimit(e.target.value)}
                    placeholder="100"
                    className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Expiration Date */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">{t.expiryDate}</label>
                <input
                  type="date"
                  value={formCouponExpiry}
                  onChange={(e) => setFormCouponExpiry(e.target.value)}
                  className="w-full bg-[#080B14] text-white p-2.5 rounded-xl border border-slate-700 font-mono text-xs"
                />
              </div>

              {/* Descriptions in AR & EN */}
              <div className="space-y-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-0.5">{t.couponDescAr}</label>
                  <input
                    type="text"
                    value={formCouponDescAr}
                    onChange={(e) => setFormCouponDescAr(e.target.value)}
                    placeholder="مثال: خصم 10% بمناسبة رمضان"
                    className="w-full bg-[#080B14] text-white p-2 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-0.5">{t.couponDescEn}</label>
                  <input
                    type="text"
                    value={formCouponDescEn}
                    onChange={(e) => setFormCouponDescEn(e.target.value)}
                    placeholder="e.g. 10% Ramadan special discount"
                    className="w-full bg-[#080B14] text-white p-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              {/* Active / Inactive Switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#080B14] border border-slate-800">
                <span className="text-slate-300 font-bold">{t.statusActive}</span>
                <input
                  type="checkbox"
                  checked={formCouponIsActive}
                  onChange={(e) => setFormCouponIsActive(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.saveChanges}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-[#0E1322] rounded-3xl border border-slate-800 overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{t.viewReceipt}</span>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-800">
              <img src={selectedReceipt} alt="Payment Receipt" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
