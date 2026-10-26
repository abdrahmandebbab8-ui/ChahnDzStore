import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Upload, MessageCircle, AlertCircle, FileText, Hash, CheckCircle2, ShoppingBag, ShieldCheck, Zap, ArrowRight, Ticket, Tag, Percent, Loader2, RefreshCw, Gamepad2 } from 'lucide-react';
import { Product, ProductBundle, PaymentMethodId, Language, Currency, Order, CartItem, PaymentMethod, Coupon } from '../types/store';
import { getTranslation } from '../data/translations';
import { verifyInGamePlayer } from '../services/playerVerificationService';

interface CheckoutModalProps {
  product?: Product;
  bundle?: ProductBundle;
  playerId?: string;
  nickname?: string;
  isPlayerNameVerified?: boolean;
  serverRegion?: string;
  playerLevel?: string;
  cartItems?: CartItem[];
  language: Language;
  currency: Currency;
  whatsappNumber: string;
  paymentMethods: PaymentMethod[];
  coupons?: Coupon[];
  initialAppliedCoupon?: Coupon | null;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
  onNavigateToOrders?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  bundle,
  playerId,
  nickname,
  isPlayerNameVerified,
  serverRegion,
  playerLevel,
  cartItems,
  language,
  currency,
  whatsappNumber,
  paymentMethods,
  coupons = [],
  initialAppliedCoupon = null,
  onClose,
  onOrderCompleted,
  onNavigateToOrders,
}) => {
  const t = getTranslation(language);
  const [selectedMethodId, setSelectedMethodId] = useState<PaymentMethodId>('baridimob');
  const [copied, setCopied] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [receiptIdError, setReceiptIdError] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [txNotes, setTxNotes] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);

  // In-Game Player Name Verification State
  const [inGamePlayerName, setInGamePlayerName] = useState<string>(nickname || '');
  const [inGameServer, setInGameServer] = useState<string>(serverRegion || '');
  const [inGameLevel, setInGameLevel] = useState<string>(playerLevel || '');
  const [isAccountVerified, setIsAccountVerified] = useState<boolean>(Boolean(isPlayerNameVerified || nickname));
  const [isVerifyingInGame, setIsVerifyingInGame] = useState<boolean>(false);

  // Auto-inquire player name in checkout if ID is present but nickname wasn't passed
  useEffect(() => {
    if (playerId && playerId !== 'N/A' && !inGamePlayerName) {
      let isCancelled = false;
      setIsVerifyingInGame(true);
      verifyInGamePlayer(product?.id || 'topup', playerId)
        .then((res) => {
          if (!isCancelled) {
            setInGamePlayerName(res.playerName);
            setInGameServer(res.serverRegion || '');
            setInGameLevel(res.level || '');
            setIsAccountVerified(true);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!isCancelled) setIsVerifyingInGame(false);
        });
      return () => {
        isCancelled = true;
      };
    }
  }, [playerId, product?.id, inGamePlayerName]);

  const handleReverifyInGame = async () => {
    if (!playerId) return;
    setIsVerifyingInGame(true);
    try {
      const res = await verifyInGamePlayer(product?.id || 'topup', playerId);
      setInGamePlayerName(res.playerName);
      setInGameServer(res.serverRegion || '');
      setInGameLevel(res.level || '');
      setIsAccountVerified(true);
    } catch {
      // fallback
    } finally {
      setIsVerifyingInGame(false);
    }
  };

  // Promo Code / Discount System State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(initialAppliedCoupon);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(
    initialAppliedCoupon
      ? (language === 'ar' ? `تم تفعيل قسيمة الخصم "${initialAppliedCoupon.code}"` : `Coupon "${initialAppliedCoupon.code}" active`)
      : null
  );

  const activeMethod = paymentMethods.find((m) => m.id === selectedMethodId) || paymentMethods[0];

  // Base raw price calculation
  const isCartMode = Array.isArray(cartItems) && cartItems.length > 0;
  const rawPriceDZD = isCartMode
    ? cartItems.reduce((acc, it) => acc + it.bundle.priceDZD * it.quantity, 0)
    : bundle?.priceDZD || 0;
  const rawPriceUSD = isCartMode
    ? cartItems.reduce((acc, it) => acc + it.bundle.priceUSD * it.quantity, 0)
    : bundle?.priceUSD || 0;

  // Real-time Discount Calculation in DZD & USD
  let discountDZD = 0;
  let discountUSD = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountDZD = Math.round(rawPriceDZD * (appliedCoupon.discountValue / 100));
      discountUSD = Number((rawPriceUSD * (appliedCoupon.discountValue / 100)).toFixed(2));
    } else {
      discountDZD = Math.min(rawPriceDZD, appliedCoupon.discountValue);
      discountUSD = appliedCoupon.discountValueUSD !== undefined
        ? Math.min(rawPriceUSD, appliedCoupon.discountValueUSD)
        : Number(Math.min(rawPriceUSD, appliedCoupon.discountValue / 200).toFixed(2));
    }
  }

  const totalPriceDZD = Math.max(0, rawPriceDZD - discountDZD);
  const totalPriceUSD = Math.max(0, Number((rawPriceUSD - discountUSD).toFixed(2)));

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

    if (match.minOrderDZD && rawPriceDZD < match.minOrderDZD) {
      setCouponError(`${t.promoMinOrderNotMet} ${match.minOrderDZD.toLocaleString()} ${t.currencyDZD}`);
      return;
    }

    setAppliedCoupon(match);
    setCouponSuccess(
      language === 'ar'
        ? `تم تطبيق الكود "${match.code}" بنجاح!`
        : `Coupon "${match.code}" applied successfully!`
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccess(null);
    setCouponCodeInput('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateOrderMessage = (orderId: string, validReceiptId: string) => {
    const isAr = language === 'ar';

    let itemsBreakdown = '';
    if (isCartMode) {
      itemsBreakdown = cartItems
        .map(
          (it, idx) =>
            `${idx + 1}. ${isAr ? it.product.titleAr : it.product.titleEn} - ${isAr ? it.bundle.nameAr : it.bundle.nameEn} (x${it.quantity}) [ID: ${it.playerId || 'N/A'}]${it.nickname ? ` (الاسم: ${it.nickname})` : ''}`
        )
        .join('\n');
    } else {
      const activeNick = inGamePlayerName || nickname;
      itemsBreakdown = `🕹️ *الخدمة:* ${isAr ? product?.titleAr : product?.titleEn}\n📦 *الباقة:* ${isAr ? bundle?.nameAr : bundle?.nameEn}\n🆔 *معرف اللاعب (ID):* ${playerId || 'غير مطلوب'}\n🎮 *اسم اللاعب المعتمد:* ${activeNick ? `${activeNick} ✓` : 'غير محدد'}${inGameServer ? `\n🌐 *السيرفر:* ${inGameServer}` : ''}${inGameLevel ? `\n🎖️ *المستوى:* ${inGameLevel}` : ''}`;
    }

    const couponLine = appliedCoupon
      ? isAr
        ? `🏷️ *كود الخصم المطبق:* ${appliedCoupon.code} (-${discountDZD.toLocaleString()} دج)\n`
        : `🏷️ *Applied Promo Code:* ${appliedCoupon.code} (-${discountDZD.toLocaleString()} DZD)\n`
      : '';

    return isAr
      ? `🎮 *طلب شحن جديد - اشحنلي عبود (chahndz.com)*
-------------------------------------
🔖 *رقم الطلب:* #${orderId}
🧾 *رقم معرف الوصل (Transaction ID):* ${validReceiptId}
${itemsBreakdown}
${couponLine}💰 *المبلغ المستحق:* ${totalPriceDZD.toLocaleString()} دج ($${totalPriceUSD.toFixed(2)}) ${discountDZD > 0 ? `(السعر الأصلي: ${rawPriceDZD.toLocaleString()} دج)` : ''}
💳 *طريقة الدفع:* ${activeMethod.nameAr}
📎 *إثبات الدفع:* ${receiptName ? `تم إرفاق صورة الوصل (${receiptName})` : 'تم إدخال كود المعاملة وسيتم إرسال الصورة إن لزم'}
-------------------------------------
يرجى تأكيد الاستلام وشحن الحساب فوراً، شكراً!`
      : `🎮 *New Top-Up Order - ChahnDz (chahndz.com)*
-------------------------------------
🔖 *Order ID:* #${orderId}
🧾 *Receipt / Transaction ID:* ${validReceiptId}
${isCartMode ? itemsBreakdown : `🕹️ *Item:* ${product?.titleEn}\n📦 *Bundle:* ${bundle?.nameEn}\n🆔 *Player ID:* ${playerId || 'N/A'}\n🎮 *Verified Name:* ${inGamePlayerName || nickname || 'N/A'} ✓`}
${couponLine}💰 *Amount Due:* ${totalPriceDZD.toLocaleString()} DZD ($${totalPriceUSD.toFixed(2)}) ${discountDZD > 0 ? `(Original: ${rawPriceDZD.toLocaleString()} DZD)` : ''}
💳 *Payment Method:* ${activeMethod.nameEn}
📎 *Receipt Slip:* ${receiptName ? `Receipt attached (${receiptName})` : 'Transaction ID provided above'}
-------------------------------------
Please confirm receipt and recharge my account ASAP. Thank you!`;
  };

  const handleSubmitOrder = () => {
    // Validate mandatory Receipt ID / Transaction Reference
    if (!receiptId.trim() || receiptId.trim().length < 3) {
      setReceiptIdError(t.receiptIdRequiredError);
      return;
    }
    setReceiptIdError(null);

    const orderId = `CH-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      timestamp: Date.now(),
      productId: isCartMode ? 'cart-bundle' : product?.id || 'topup',
      productTitle: isCartMode
        ? (language === 'ar' ? `سلة مشتريات (${cartItems.length} عناصر)` : `Cart Order (${cartItems.length} items)`)
        : (language === 'ar' ? product?.titleAr : product?.titleEn) || 'Top-Up',
      bundleId: isCartMode ? 'multi-item' : bundle?.id || 'bundle',
      bundleTitle: isCartMode
        ? (language === 'ar' ? `${cartItems.length} باقات ألعاب وبطاقات` : `${cartItems.length} packages`)
        : (language === 'ar' ? bundle?.nameAr : bundle?.nameEn) || 'Package',
      amount: isCartMode ? cartItems.length : bundle?.amount || 1,
      priceDZD: totalPriceDZD,
      priceUSD: totalPriceUSD,
      originalPriceDZD: discountDZD > 0 ? rawPriceDZD : undefined,
      originalPriceUSD: discountUSD > 0 ? rawPriceUSD : undefined,
      couponCode: appliedCoupon?.code,
      discountDZD: discountDZD > 0 ? discountDZD : undefined,
      discountUSD: discountUSD > 0 ? discountUSD : undefined,
      playerId: isCartMode ? cartItems.map((c) => c.playerId).filter(Boolean).join(', ') : playerId || 'N/A',
      playerNickname: inGamePlayerName || nickname,
      isPlayerNameVerified: isAccountVerified,
      serverRegion: inGameServer || serverRegion,
      playerLevel: inGameLevel || playerLevel,
      paymentMethod: selectedMethodId,
      receiptId: receiptId.trim(),
      receiptName: receiptName || undefined,
      receiptDataUrl: receiptDataUrl || undefined,
      status: 'pending',
      whatsappSent: false,
      notes: txNotes,
    };

    onOrderCompleted(newOrder);
    setSubmittedOrder(newOrder);
  };

  const handleSupportWhatsApp = () => {
    if (!submittedOrder) return;
    const text = language === 'ar'
      ? `مرحباً متجر اشحنلي عبود، أستفسر بخصوص طلبي المسجل رقم #${submittedOrder.id} لمعرف الوصل (${submittedOrder.receiptId}) لشحن ${submittedOrder.productTitle} (${submittedOrder.bundleTitle}) لمعرف اللاعب ${submittedOrder.playerId}.`
      : `Hello ChahnDz Store, inquiring about my registered order #${submittedOrder.id} (Receipt ID: ${submittedOrder.receiptId}) for ${submittedOrder.productTitle} (${submittedOrder.bundleTitle}) for Player ID ${submittedOrder.playerId}.`;
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#0C111E] rounded-t-3xl sm:rounded-3xl border border-slate-800 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 bg-[#0A0E1A] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">{t.checkoutTitle}</h2>
            <p className="text-xs text-amber-400 font-medium">
              {isCartMode
                ? (language === 'ar' ? `سلة مشتريات (${cartItems.length} عناصر)` : `Cart Order (${cartItems.length} items)`)
                : `${product?.titleAr} · ${bundle?.nameAr}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {submittedOrder ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h2 className="text-base font-extrabold text-white">{t.orderSuccessTitle}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.orderSuccessDesc}
              </p>
            </div>

            {/* Order Brief Summary Card */}
            <div className="w-full bg-[#111728] rounded-2xl p-3.5 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{t.orderId}</span>
                <span className="font-mono font-bold text-white">#{submittedOrder.id}</span>
              </div>

              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{t.orderStatus}</span>
                <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[11px]">
                  {t.statusPending}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{t.receiptIdSubmitted}</span>
                <span className="font-mono font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded">
                  {submittedOrder.receiptId}
                </span>
              </div>

              {submittedOrder.playerId && submittedOrder.playerId !== 'N/A' && (
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">{t.inGamePlayerName}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {submittedOrder.playerNickname || submittedOrder.playerId}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      ID: {submittedOrder.playerId}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{t.totalAmount}</span>
                <span className="font-mono font-extrabold text-amber-400 text-sm">
                  {submittedOrder.priceDZD.toLocaleString()} دج
                  {submittedOrder.priceUSD ? ` ($${submittedOrder.priceUSD.toFixed(2)})` : ''}
                </span>
              </div>

              {/* In-app code delivery alert box */}
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-[11px] text-amber-300 leading-relaxed flex items-start gap-2 text-start">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{language === 'ar' ? 'سيتم تسليم كود الشحن الرقمي / PIN الخاص بك مباشرة داخل صفحة (طلباتي) فور مراجعة وصل الدفع.' : 'Your digital card PIN / voucher code will be delivered directly inside "My Orders" once payment is verified.'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-1">
              <button
                onClick={() => {
                  if (onNavigateToOrders) {
                    onNavigateToOrders();
                  } else {
                    onClose();
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.goToOrdersTab}</span>
              </button>

              <button
                onClick={handleSupportWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-[#141A2E] hover:bg-[#1A223C] text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.contactSupportWhatsAppBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Order Summary Box */}
            <div className="p-3.5 rounded-2xl bg-[#111728] border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t.orderSummary}
            </span>

            {isCartMode ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto divide-y divide-slate-800/60">
                {cartItems.map((it) => (
                  <div key={it.id} className="pt-1.5 first:pt-0 flex justify-between text-xs text-slate-300">
                    <div>
                      <span className="font-semibold text-white">{language === 'ar' ? it.product.titleAr : it.product.titleEn}</span>
                      <span className="text-amber-400 ml-1">({language === 'ar' ? it.bundle.nameAr : it.bundle.nameEn} x{it.quantity})</span>
                      {it.playerId && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                          <span className="text-cyan-400 font-mono">ID: {it.playerId}</span>
                          {it.nickname && (
                            <span className="text-emerald-400 font-mono font-bold flex items-center gap-0.5 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {it.nickname}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-white">{(it.bundle.priceDZD * it.quantity).toLocaleString()} دج</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{t.selectedItem}</span>
                  <span className="font-semibold text-white">{language === 'ar' ? product?.titleAr : product?.titleEn}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{t.selectedPackage}</span>
                  <span className="font-semibold text-amber-400">{language === 'ar' ? bundle?.nameAr : bundle?.nameEn}</span>
                </div>

                {/* Dedicated Verified In-Game Player Card inside Order Summary */}
                {playerId && (
                  <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 via-[#0A1624] to-[#0A1820] border border-emerald-500/40 space-y-2">
                    <div className="flex items-center justify-between border-b border-emerald-800/40 pb-1.5">
                      <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1.5 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.accountMatchedBadge}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleReverifyInGame}
                        disabled={isVerifyingInGame}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${isVerifyingInGame ? 'animate-spin text-cyan-400' : ''}`} />
                        <span>{t.reverifyPlayer}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t.playerIdLabel}</span>
                        <span className="font-mono font-black text-cyan-300 text-sm tracking-wider block">
                          {playerId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t.inGamePlayerName}</span>
                        {isVerifyingInGame ? (
                          <div className="flex items-center gap-1 text-cyan-300 text-xs py-0.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                            <span className="text-[10px] truncate">{t.verifyingPlayer}</span>
                          </div>
                        ) : (
                          <span className="font-mono font-black text-emerald-400 text-sm tracking-wide block truncate">
                            {inGamePlayerName || nickname || '✓ معتمد'}
                          </span>
                        )}
                      </div>
                    </div>

                    {(inGameServer || inGameLevel) && (
                      <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1 flex items-center justify-between">
                        <span>{inGameServer}</span>
                        <span>{inGameLevel}</span>
                      </div>
                    )}

                    {/* Pre-payment account match notice */}
                    <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-start gap-1.5 text-[10px] text-amber-200/90 leading-relaxed text-start">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{t.confirmPlayerBeforePayment}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Real-time Promo Code & Coupon Discount Section */}
            <div className="pt-2.5 border-t border-slate-800 space-y-2">
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
                    <div className="relative flex-1">
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
                        className="w-full bg-[#080B14] text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-400 font-mono text-xs uppercase placeholder-slate-500 tracking-wider"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-md shadow-cyan-950/50 active:scale-95 transition-all shrink-0"
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

            {/* Total Calculation with Discount Applied */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              {discountDZD > 0 && (
                <>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{t.originalTotal}</span>
                    <span className="line-through font-mono">{rawPriceDZD.toLocaleString()} {t.currencyDZD} (${rawPriceUSD.toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
                    <span>{t.discountApplied} ({appliedCoupon?.code})</span>
                    <span className="font-mono">-{discountDZD.toLocaleString()} {t.currencyDZD} (-${discountUSD.toFixed(2)})</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center text-sm font-bold pt-1">
                <span className="text-slate-200">{discountDZD > 0 ? t.finalTotal : t.totalAmount}</span>
                <div className="text-right">
                  <span className="text-base font-extrabold text-amber-400 tabular-nums block">
                    {totalPriceDZD.toLocaleString()} {t.currencyDZD}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    (${totalPriceUSD.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-2">
              {t.selectPaymentMethod}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((pm) => {
                const isSelected = pm.id === selectedMethodId;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setSelectedMethodId(pm.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold truncate">
                        {language === 'ar' ? pm.nameAr : pm.nameEn}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block truncate">
                      {language === 'ar' ? pm.badgeAr : pm.badgeEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Details Card (Account Number & Copy Button) */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">
                {t.accountDetails} ({language === 'ar' ? activeMethod.nameAr : activeMethod.nameEn})
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {language === 'ar' ? activeMethod.additionalInfoAr : activeMethod.additionalInfoEn}
              </span>
            </div>

            {/* Account / RIP string */}
            <div className="bg-[#0A0E1A] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block">{t.accountNumber}</span>
                <span className="text-xs font-mono font-bold text-white tracking-wide truncate block">
                  {activeMethod.accountNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(activeMethod.accountNumber)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copiedSuccess : t.copyNumber}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-300">
              <span className="text-slate-400">{t.accountHolder} </span>
              <span className="font-semibold text-white">{activeMethod.accountHolder}</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
              {language === 'ar' ? activeMethod.instructionsAr : activeMethod.instructionsEn}
            </p>
          </div>

          {/* Mandatory Step: Receipt ID / Transaction Reference Number */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-amber-400" />
              <span>{t.receiptIdLabel}</span>
              <span className="text-amber-400 font-extrabold">*</span>
            </label>

            <input
              type="text"
              required
              value={receiptId}
              onChange={(e) => {
                setReceiptId(e.target.value);
                if (receiptIdError) setReceiptIdError(null);
              }}
              placeholder={t.receiptIdPlaceholder}
              className={`w-full bg-[#0A0E1A] text-xs font-mono text-white placeholder-slate-500 rounded-xl px-3 py-2.5 border transition-all ${
                receiptIdError
                  ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-slate-700 focus:border-amber-500'
              }`}
            />

            {receiptIdError ? (
              <p className="text-[11px] text-red-400 font-medium">{receiptIdError}</p>
            ) : (
              <p className="text-[10px] text-slate-400">
                {language === 'ar'
                  ? 'أدخل رقم الحوالة من تطبيق بريدي موب أو رقم الوصل الورقي ليتمكن المشرف من تأكيد طلبك فورياً.'
                  : 'Enter the transaction reference from BaridiMob or receipt number for instant verification.'}
              </p>
            )}
          </div>

          {/* Optional: Receipt Screenshot Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              {t.stepUploadReceipt}
            </label>

            {!receiptName ? (
              <label className="flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-900/40 cursor-pointer transition-colors group">
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-400 mb-1" />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                  {t.uploadReceiptBtn}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-200 truncate font-medium">
                    {receiptName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptName(null);
                    setReceiptDataUrl(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold ml-2"
                >
                  {t.removeReceipt}
                </button>
              </div>
            )}
          </div>

          {/* Notice: Dedicated In-App Processing */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{t.directNotice}</span>
          </div>
        </div>
        )}

        {/* Pinned Bottom CTA: In-App Order Submission */}
        {!submittedOrder && (
          <div className="p-4 border-t border-slate-800 bg-[#0A0E1A] shrink-0">
            <button
              onClick={handleSubmitOrder}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>{t.submitOrderApp}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
