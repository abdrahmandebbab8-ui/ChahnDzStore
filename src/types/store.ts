/**
 * Store & Applet Types for اشحنلي عبود (ChahnDz)
 */

export type Language = 'ar' | 'en';
export type Currency = 'DZD' | 'USD' | 'EUR';
export type ThemeMode = 'dark' | 'light' | 'system';

export type ProductCategory = 'all' | 'pubg' | 'freefire' | 'tiktok' | 'giftcards';

export interface ProductBundle {
  id: string;
  nameAr: string;
  nameEn: string;
  amount: number | string;
  bonus?: string;
  priceDZD: number;
  priceUSD: number;
  priceEUR: number;
  popular?: boolean;
  bestValue?: boolean;
}

export interface Product {
  id: string;
  category: ProductCategory;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  taglineEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  bannerImage: string;
  requiresPlayerId: boolean;
  requiresZoneOrServer: boolean;
  idGuideAr: string;
  idGuideEn: string;
  bundles: ProductBundle[];
  accentColor: string;
  deliveryTimeAr: string;
  deliveryTimeEn: string;
}

export type PaymentMethodId = 'baridimob' | 'ccp' | 'paysera' | 'binance' | 'redotpay';

export interface PaymentMethod {
  id: PaymentMethodId;
  nameAr: string;
  nameEn: string;
  instructionsAr: string;
  instructionsEn: string;
  accountNumber: string;
  accountHolder: string;
  additionalInfoAr?: string;
  additionalInfoEn?: string;
  badgeAr: string;
  badgeEn: string;
  feePercentage: number;
}

export interface Coupon {
  id: string;
  code: string; // e.g. "ABOUD10", "RAMADAN2026"
  discountType: 'percentage' | 'fixed'; // percentage or fixed amount
  discountValue: number; // e.g. 10 for 10% or 500 for 500 DZD
  discountValueUSD?: number; // optional fixed USD value
  minOrderDZD?: number; // optional minimum total required in DZD
  expiresAt?: string; // YYYY-MM-DD
  usageLimit?: number; // max usage counter
  usedCount: number; // current usage count
  isActive: boolean; // active/inactive toggle
  descriptionAr?: string;
  descriptionEn?: string;
}

export interface Order {
  id: string;
  timestamp: number;
  customerEmail?: string;
  customerName?: string;
  productId: string;
  productTitle: string;
  bundleId: string;
  bundleTitle: string;
  amount: string | number;
  priceDZD: number;
  priceUSD?: number;
  originalPriceDZD?: number;
  originalPriceUSD?: number;
  couponCode?: string;
  discountDZD?: number;
  discountUSD?: number;
  playerId: string;
  playerNickname?: string;
  isPlayerNameVerified?: boolean;
  playerLevel?: string;
  serverRegion?: string;
  paymentMethod: PaymentMethodId;
  receiptId: string; // Mandatory customer payment reference / transaction code
  receiptName?: string;
  receiptDataUrl?: string;
  digitalCode?: string; // Digital card PIN / voucher code delivered inside app
  codeRedemptionInstructionsAr?: string;
  codeRedemptionInstructionsEn?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  whatsappSent: boolean;
  notes?: string;
  verifiedAt?: number;
  completedAt?: number;
}

export interface CartItem {
  id: string;
  product: Product;
  bundle: ProductBundle;
  playerId: string;
  nickname?: string;
  isPlayerNameVerified?: boolean;
  serverRegion?: string;
  playerLevel?: string;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: number;
  phone?: string;
}

export interface StoreSettings {
  whatsappNumber: string;
  paymentMethods: PaymentMethod[];
}

export interface BannerPromo {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  badgeAr: string;
  badgeEn: string;
  targetProductId?: string;
}
