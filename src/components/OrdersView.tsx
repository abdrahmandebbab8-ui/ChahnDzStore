import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  Hash,
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  Ticket,
} from 'lucide-react';
import { Order, Language } from '../types/store';
import { getTranslation } from '../data/translations';
import { DEFAULT_WHATSAPP_NUMBER } from '../data/storeData';

interface OrdersViewProps {
  orders: Order[];
  language: Language;
  whatsappNumber?: string;
  onStartShopping: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  language,
  whatsappNumber = DEFAULT_WHATSAPP_NUMBER,
  onStartShopping,
}) => {
  const t = getTranslation(language);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (orderId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(orderId);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2500);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-md shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.statusCompleted}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            {t.statusProcessing}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.statusFailed}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded-md animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            {t.statusPending}
          </span>
        );
    }
  };

  const handleContactSupport = (order: Order) => {
    const text = language === 'ar'
      ? `مرحباً متجر اشحنلي عبود، أستفسر بخصوص طلبي المسجل رقم #${order.id} لمعرف الوصل (${order.receiptId}) لشحن ${order.productTitle} (${order.bundleTitle}) لمعرف اللاعب ${order.playerId}.`
      : `Hello ChahnDz Store, inquiring about my registered order #${order.id} (Receipt ID: ${order.receiptId}) for ${order.productTitle} (${order.bundleTitle}) for Player ID ${order.playerId}.`;
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="p-4 space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>{t.myOrdersTitle}</span>
        </h2>
        <span className="text-xs text-slate-400 tabular-nums">
          {orders.length} {language === 'ar' ? 'طلبات' : 'orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center bg-[#0E1322] rounded-2xl border border-slate-800 space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">{t.noOrdersYet}</p>
          <button
            onClick={onStartShopping}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            {t.startFirstOrder}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const formattedDate = new Date(order.timestamp).toLocaleString(
              language === 'ar' ? 'ar-DZ' : 'en-US',
              { dateStyle: 'short', timeStyle: 'short' }
            );
            const isCompleted = order.status === 'completed';
            const isPending = order.status === 'pending';

            return (
              <div
                key={order.id}
                className={`bg-[#0E1322] rounded-2xl p-4 border space-y-3 shadow-md transition-all ${
                  isCompleted
                    ? 'border-emerald-500/40 shadow-emerald-950/20'
                    : isPending
                    ? 'border-amber-500/40 shadow-amber-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Header: ID + Date + Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-white">#{order.id}</span>
                    <span className="text-[11px] text-slate-500">{formattedDate}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Item Details */}
                <div className="flex items-start justify-between gap-2 border-t border-slate-800/80 pt-2.5 text-xs">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">{order.productTitle}</h3>
                    <p className="text-amber-400 font-semibold">{order.bundleTitle}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
                      <span className="text-slate-400">ID:</span>
                      <span className="font-mono text-cyan-400 font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {order.playerId}
                      </span>
                      {order.playerNickname && (
                        <span className="text-emerald-400 font-mono font-bold flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{order.playerNickname}</span>
                        </span>
                      )}
                    </div>

                    {/* Customer-entered Receipt Reference */}
                    {order.receiptId && (
                      <p className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5 pt-0.5">
                        <Hash className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-slate-400">{t.receiptIdSubmitted}</span>
                        <span className="text-white font-extrabold bg-[#090C16] px-2 py-0.5 rounded border border-slate-800">
                          {order.receiptId}
                        </span>
                      </p>
                    )}

                    {/* Applied Coupon Info */}
                    {order.couponCode && (
                      <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 pt-0.5">
                        <Ticket className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-slate-400">{t.couponUsedBadge}:</span>
                        <span className="text-amber-300 font-extrabold bg-[#090C16] px-1.5 py-0.5 rounded border border-amber-500/30">
                          {order.couponCode}
                        </span>
                        {order.discountDZD && (
                          <span className="text-emerald-400 font-bold">
                            (-{order.discountDZD.toLocaleString()} دج)
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {order.originalPriceDZD && (
                      <span className="text-[11px] text-slate-500 line-through font-mono block">
                        {order.originalPriceDZD.toLocaleString()} {t.currencyDZD}
                      </span>
                    )}
                    <span className="text-base font-extrabold text-amber-400 tabular-nums block">
                      {order.priceDZD.toLocaleString()} {t.currencyDZD}
                    </span>
                    {order.priceUSD && (
                      <span className="text-[11px] text-slate-400 block">
                        (${order.priceUSD.toFixed(2)} USD)
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 uppercase font-semibold mt-1 inline-block bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* FEATURE 5: DIGITAL CODE DELIVERY DIRECTLY INSIDE APP */}
                {isCompleted && order.digitalCode && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0D1526] via-[#101B33] to-[#0D1526] border border-amber-500/50 space-y-2.5 shadow-lg shadow-amber-500/5 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <span>{t.digitalCodeTitle}</span>
                        <Sparkles className="w-3 h-3 text-amber-300" />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{language === 'ar' ? 'جاهز للاستخدام' : 'Active & Ready'}</span>
                      </span>
                    </div>

                    {/* High-contrast Voucher PIN Box with Copy Code Button */}
                    <div className="flex items-center justify-between gap-2 bg-[#060810] p-2.5 rounded-lg border border-amber-500/40">
                      <span className="font-mono text-sm sm:text-base font-extrabold text-white tracking-widest truncate select-all px-1">
                        {order.digitalCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(order.id, order.digitalCode!)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                          copiedCodeId === order.id
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                        }`}
                        title={t.copyDigitalCode}
                      >
                        {copiedCodeId === order.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.codeCopiedSuccess}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.copyDigitalCode}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Redemption Instructions Tip */}
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      {language === 'ar'
                        ? order.codeRedemptionInstructionsAr || t.codeRedeemedHelp
                        : order.codeRedemptionInstructionsEn || t.codeRedeemedHelp}
                    </p>
                  </div>
                )}

                {/* Pending State Banner */}
                {isPending && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-300 leading-relaxed">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-spin" />
                    <span>{t.orderPendingNotice}</span>
                  </div>
                )}

                {/* WhatsApp Support Row */}
                <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">
                    {language === 'ar' ? 'تحتاج مساعدة بخصوص هذا الطلب؟' : 'Need help with this order?'}
                  </span>
                  <button
                    onClick={() => handleContactSupport(order)}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t.contactSupportForOrder}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
