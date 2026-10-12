import React, { useState } from 'react';
import {
  User,
  MapPin,
  Heart,
  Truck,
  MessageCircle,
  HelpCircle,
  Send,
  ShieldCheck,
  Lock,
  BadgeCheck,
  CreditCard,
  Smartphone,
  Banknote,
  Star,
  Trash2,
  Users,
  ShoppingBag,
  AlertTriangle,
  Store,
  BarChart3,
  Settings,
  Layers,
  Edit3,
  Plus,
  Package,
  Check,
  Coins,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  XCircle,
  Bell,
} from 'lucide-react';
import {
  Language,
  UserRole,
  ProductCategory,
  UserAccount,
  ShopProfile,
  ProductItem,
  OrderRecord,
  ProductReview,
  SupportTicket,
  OrderStatus,
  PaymentStatus,
  SellerApprovalStatus,
  SubscriptionTier,
  PromotionPackageId,
  SubscriptionPlanConfig,
  PromotionPackageConfig,
  RevenueTransaction,
  CAMEROON_CITIES,
  FAQ_ITEMS,
  TRANSLATIONS,
  formatXaf,
  buildWhatsAppUrl,
  summarizeText,
  HERO_IMAGE_URL,
} from './marketplaceData';

export interface MarketplaceSettings {
  marketplaceName: string;
  commissionPercent: number;
  subscriptionPlans: SubscriptionPlanConfig[];
  promotionPackages: PromotionPackageConfig[];
  localDeliveryFeeXaf: number;
  intercityBusFeeXaf: number;
  supportWhatsApp: string;
  mtnMomoActive: boolean;
  orangeMoneyActive: boolean;
  cardPaymentsActive: boolean;
  cashOnDeliveryActive: boolean;
  requireSellerVerification: boolean;
  enabledCategories: Record<ProductCategory, boolean>;
}

/**
 * Payment Methods Banner
 * Highlights FCFA currency and Cameroonian payment methods:
 * MTN Mobile Money, Orange Money, Bank/Card, and Cash on Delivery.
 */
export function CameroonPaymentBanner({
  lang,
  onOpenCheckout,
  cartCount,
}: {
  lang: Language;
  onOpenCheckout: () => void;
  cartCount: number;
}) {
  const isFr = lang === 'fr';
  return (
    <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#064e3b] text-white p-5 sm:p-6 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isFr
                ? 'Franc CFA (FCFA) · Paiements Sécurisés'
                : 'CFA Franc (FCFA) · Secure Payments'}
            </span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
            {isFr
              ? 'Payez par MTN MoMo, Orange Money, Carte ou Cash à la Livraison'
              : 'Pay via MTN MoMo, Orange Money, Card, or Cash on Delivery'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-xs">
            <Smartphone className="w-4 h-4 text-slate-950 shrink-0" />
            <span>MTN MoMo (*126#)</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-orange-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs">
            <Smartphone className="w-4 h-4 text-white shrink-0" />
            <span>Orange Money (#150#)</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/10 text-white border border-white/20 font-extrabold text-xs flex items-center gap-2 shadow-xs">
            <CreditCard className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{isFr ? 'Carte Visa / Mastercard' : 'Bank / Visa Card'}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-extrabold text-xs flex items-center gap-2 shadow-xs">
            <Banknote className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{isFr ? 'Cash à la Livraison' : 'Cash on Delivery'}</span>
          </div>
          {cartCount > 0 && (
            <button
              type="button"
              onClick={onOpenCheckout}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs transition-colors shadow-sm cursor-pointer"
            >
              {isFr ? `Payer (${cartCount})` : `Checkout (${cartCount})`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * CUSTOMER DASHBOARD:
 * - Manage profile & save delivery addresses
 * - View order history & live order tracking
 * - View & manage saved favorite products
 */
export function CustomerAccountView({
  lang,
  userProfile,
  orders,
  favoriteProducts,
  onSaveProfile,
  onToggleFavorite,
  onAddToCart,
  onOpenAuth,
  onCreateShopWithPersonalDetails,
}: {
  lang: Language;
  userProfile: UserAccount | null;
  orders: OrderRecord[];
  favoriteProducts: ProductItem[];
  onSaveProfile: (name: string, phone: string, city: string, address: string) => Promise<void>;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (product: ProductItem) => void;
  onOpenAuth: () => void;
  onCreateShopWithPersonalDetails?: () => void;
}) {
  const t = TRANSLATIONS[lang];
  const isFr = lang === 'fr';

  const [nameInput, setNameInput] = useState(userProfile?.displayName || '');
  const [phoneInput, setPhoneInput] = useState(userProfile?.phone || '');
  const [cityInput, setCityInput] = useState(userProfile?.defaultCity || 'Douala');
  const [addressInput, setAddressInput] = useState(userProfile?.defaultAddress || '');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('');

  if (!userProfile) {
    return (
      <div className="p-8 sm:p-12 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] max-w-xl mx-auto text-center space-y-5">
        <User className="w-12 h-12 text-[var(--accent-primary)] mx-auto" />
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          {t.accountHeading}
        </h2>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">
          {t.accountSubheading}
        </p>
        <button
          type="button"
          onClick={onOpenAuth}
          className="h-11 px-6 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors"
        >
          {t.signInBtn} / {t.authSubmitSignUp}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    await onSaveProfile(nameInput, phoneInput, cityInput, addressInput);
    setSaving(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const myOrders = orders.filter((o) => {
    const matchesUser = o.customerId === userProfile.uid;
    const matchesTrack =
      !trackingQuery.trim() ||
      o.orderNumber.toLowerCase().includes(trackingQuery.trim().toLowerCase());
    return matchesUser && matchesTrack;
  });

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 1;
      case 'confirmed':
        return 2;
      case 'in_transit':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-10">
      <div className="border-b-2 border-[var(--border-hairline)] pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-extrabold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5" />
          <span>{isFr ? 'Accès Rôle : Client' : 'Role Access: Customer Account'}</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--text-primary)]">
          {t.accountHeading}
        </h1>
        <p className="text-sm font-bold text-[var(--text-secondary)] mt-1">
          {t.accountSubheading}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile & Delivery Address Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 p-6 rounded-2xl border-2 border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4 self-start"
        >
          <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>{t.profileCardTitle}</span>
          </h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
              {t.authNameLabel}
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
              {t.savedPhoneLabel}
            </label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="237696751829"
              className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
              {t.shopCityLabel}
            </label>
            <select
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
            >
              {CAMEROON_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
              {t.savedAddressLabel}
            </label>
            <textarea
              rows={2}
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder={
                isFr
                  ? 'ex: Bonapriso Rue Njo-Njo, Immeuble Palmier...'
                  : 'e.g. Bonapriso Rue Njo-Njo, near pharmacy...'
              }
              className="w-full p-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-semibold"
            />
          </div>

          {savedNotice && (
            <p className="text-xs font-extrabold text-[var(--accent-primary)]">
              ✓ {isFr ? 'Profil et adresse enregistrés !' : 'Profile & delivery address saved!'}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-11 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors shadow-xs cursor-pointer"
          >
            {saving ? t.savingBtn : t.saveProfileBtn}
          </button>

          {onCreateShopWithPersonalDetails && (
            <div className="pt-3 border-t border-[var(--border-hairline)] space-y-2">
              <button
                type="button"
                onClick={onCreateShopWithPersonalDetails}
                className="w-full h-11 px-4 rounded-xl border-2 border-[var(--accent-primary)] bg-[var(--bg-canvas)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Store className="w-4 h-4" />
                <span>
                  {isFr
                    ? 'Créer Ma Boutique avec Mes Coordonnées Personnelles'
                    : 'Create My Shop with My Personal Details'}
                </span>
              </button>
              <p className="text-[11px] font-semibold text-[var(--text-secondary)] text-center">
                {isFr
                  ? 'Transmet votre demande à l’administrateur pour approbation de la boutique.'
                  : 'Submits your shop creation request to the Admin for approval.'}
              </p>
            </div>
          )}
        </form>

        {/* Order History & Live Tracking */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border-2 border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
              <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[var(--accent-primary)]" />
                <span>{t.orderHistoryTitle}</span>
              </h2>
              <input
                type="search"
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder={t.trackOrderLookupLabel}
                className="h-9 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-bold"
              />
            </div>

            {myOrders.length === 0 ? (
              <p className="py-8 text-center text-sm font-bold text-[var(--text-muted)]">
                {t.noOrdersYet}
              </p>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => {
                  const step = getStepIndex(order.orderStatus);
                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/70 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]">
                            #{order.orderNumber}
                          </span>
                          <span className="mx-2 text-[var(--text-muted)]">·</span>
                          <span className="text-xs font-extrabold text-[var(--text-primary)]">
                            {order.shopName}
                          </span>
                        </div>
                        <span className="font-mono-tabular text-sm font-extrabold text-[var(--accent-primary)]">
                          {formatXaf(order.totalXaf)}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[var(--text-secondary)] whitespace-pre-line">
                        {order.itemsSummary}
                      </p>

                      <div className="text-[11px] font-bold text-[var(--text-muted)] flex flex-wrap gap-3">
                        <span>
                          {isFr ? 'Livraison :' : 'Delivery:'} {order.deliveryCity} (
                          {order.deliveryAddress})
                        </span>
                        <span>·</span>
                        <span>
                          {isFr ? 'Paiement :' : 'Payment:'}{' '}
                          {order.paymentMethod.replace(/_/g, ' ').toUpperCase()} (
                          {order.paymentStatus.toUpperCase()})
                        </span>
                      </div>

                      {/* 4-Step Visual Order Tracking Bar */}
                      <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-extrabold">
                        {[
                          { idx: 1, label: isFr ? '1. Reçue' : '1. Placed' },
                          { idx: 2, label: isFr ? '2. Confirmée' : '2. Confirmed' },
                          { idx: 3, label: isFr ? '3. En Route' : '3. In Transit' },
                          { idx: 4, label: isFr ? '4. Livrée' : '4. Delivered' },
                        ].map((s) => (
                          <div
                            key={s.idx}
                            className={`p-2 rounded-lg text-center border ${
                              step >= s.idx
                                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                                : 'bg-[var(--bg-canvas)] text-[var(--text-muted)] border-[var(--border-hairline)]'
                            }`}
                          >
                            {s.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Favorite Products */}
          <div className="p-6 rounded-2xl border-2 border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4">
            <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Heart className="w-5 h-5 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
              <span>
                {t.favoritesTabTitle} ({favoriteProducts.length})
              </span>
            </h2>

            {favoriteProducts.length === 0 ? (
              <p className="py-6 text-center text-sm font-bold text-[var(--text-muted)]">
                {t.noFavoritesYet}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = HERO_IMAGE_URL;
                        }}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                          {prod.title}
                        </p>
                        <p className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]">
                          {formatXaf(prod.priceXaf)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onAddToCart(prod)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-[11px] font-extrabold"
                      >
                        + {t.cartBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(prod.id)}
                        className="p-1.5 rounded-lg text-[var(--accent-warm)] hover:bg-[var(--accent-primary)]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SELLER ORDERS, COMMISSIONS, SUBSCRIPTION & PROMOTED PRODUCTS PANEL
 * Clearly displays:
 * - Gross sales, Platform Commission % and amount deducted, Subscription Fee, Promotion Fees, and Net Seller Earnings
 * - Subscription plan selection & upgrade
 * - Paid product promotion packages
 */
export function SellerOrdersAndSalesPanel({
  lang,
  myShopName,
  myShop,
  sellerProducts,
  sellerProductsCount,
  sellerTotalStockUnits,
  sellerOrders,
  commissionPercent,
  subscriptionPlans,
  promotionPackages,
  sellerRevenueTransactions,
  onSelectSubscriptionPlan,
  onPromoteProduct,
  onUpdateOrderStatus,
}: {
  lang: Language;
  myShopName: string;
  myShop?: ShopProfile | null;
  sellerProducts: ProductItem[];
  sellerProductsCount: number;
  sellerTotalStockUnits: number;
  sellerOrders: OrderRecord[];
  commissionPercent: number;
  subscriptionPlans: SubscriptionPlanConfig[];
  promotionPackages: PromotionPackageConfig[];
  sellerRevenueTransactions: RevenueTransaction[];
  onSelectSubscriptionPlan: (plan: SubscriptionPlanConfig) => Promise<void>;
  onPromoteProduct: (product: ProductItem, pkg: PromotionPackageConfig) => Promise<void>;
  onUpdateOrderStatus: (
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus: PaymentStatus
  ) => Promise<void>;
}) {
  const isFr = lang === 'fr';
  const [selectedPromoPkgId, setSelectedPromoPkgId] = useState<PromotionPackageId>(
    promotionPackages[0]?.id || 'spotlight_7d'
  );
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [promotingProdId, setPromotingProdId] = useState<string | null>(null);

  const validOrders = sellerOrders.filter((o) => o.orderStatus !== 'cancelled');
  const totalGrossSalesXaf = validOrders.reduce((sum, o) => sum + o.totalXaf, 0);

  const totalCommissionDeductedXaf = validOrders.reduce((sum, o) => {
    const comm =
      o.adminCommissionXaf !== undefined
        ? o.adminCommissionXaf
        : Math.round((o.subtotalXaf * (o.commissionPercent ?? commissionPercent)) / 100);
    return sum + comm;
  }, 0);

  const totalSubscriptionPaidXaf = sellerRevenueTransactions
    .filter((tx) => tx.type === 'subscription')
    .reduce((sum, tx) => sum + tx.adminEarnedXaf, 0);

  const totalPromotionPaidXaf = sellerRevenueTransactions
    .filter((tx) => tx.type === 'promotion')
    .reduce((sum, tx) => sum + tx.adminEarnedXaf, 0);

  const netSellerPayoutXaf = Math.max(0, totalGrossSalesXaf - totalCommissionDeductedXaf);
  const currentTier: SubscriptionTier = myShop?.subscriptionTier || 'free';

  const handleActivatePlan = async (plan: SubscriptionPlanConfig) => {
    setSubscribingId(plan.id);
    try {
      await onSelectSubscriptionPlan(plan);
    } finally {
      setSubscribingId(null);
    }
  };

  const handleBoostProduct = async (product: ProductItem) => {
    const pkg =
      promotionPackages.find((p) => p.id === selectedPromoPkgId) || promotionPackages[0];
    if (!pkg) return;
    setPromotingProdId(product.id);
    try {
      await onPromoteProduct(product, pkg);
    } finally {
      setPromotingProdId(null);
    }
  };

  return (
    <div className="space-y-8 pt-6 border-t-2 border-[var(--border-strong)]">
      {/* Seller Financial Breakdown */}
      <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-primary)]">
              <Coins className="w-4 h-4" />
              <span>
                {isFr ? 'Revenus & Commissions' : 'Earnings & Commissions'}
              </span>
            </span>
            <h3 className="font-display text-xl font-extrabold text-[var(--text-primary)] mt-1">
              {myShopName} —{' '}
              {isFr
                ? `Commission : ${commissionPercent}% / vente`
                : `Commission: ${commissionPercent}% / sale`}
            </h3>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold">
            {isFr ? `Forfait : ${currentTier.toUpperCase()}` : `Plan: ${currentTier.toUpperCase()}`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            <p className="text-xs font-extrabold text-[var(--text-secondary)] uppercase">
              {isFr ? 'Ventes Brutes' : 'Gross Sales'}
            </p>
            <p className="font-mono-tabular text-xl font-extrabold text-[var(--text-primary)] mt-1.5">
              {formatXaf(totalGrossSalesXaf)}
            </p>
            <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1">
              {validOrders.length} {isFr ? 'commandes' : 'orders'} · {sellerProductsCount}{' '}
              {isFr ? 'produits' : 'items'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
            <p className="text-xs font-extrabold text-[var(--accent-primary)] uppercase">
              {isFr
                ? `Commission (${commissionPercent}%)`
                : `Commission (${commissionPercent}%)`}
            </p>
            <p className="font-mono-tabular text-xl font-extrabold text-[var(--accent-primary)] mt-1.5">
              - {formatXaf(totalCommissionDeductedXaf)}
            </p>
            <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-1">
              {isFr ? 'Par vente réussie' : 'Per completed order'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            <p className="text-xs font-extrabold text-[var(--text-secondary)] uppercase">
              {isFr ? 'Abonnement & Promo' : 'Sub & Promo Fees'}
            </p>
            <p className="font-mono-tabular text-xl font-extrabold text-[var(--text-primary)] mt-1.5">
              {formatXaf(totalSubscriptionPaidXaf + totalPromotionPaidXaf)}
            </p>
            <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1">
              Sub: {formatXaf(totalSubscriptionPaidXaf)} · Promo: {formatXaf(totalPromotionPaidXaf)}
            </p>
          </div>

          <div className="p-4 rounded-xl border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)]/10">
            <p className="text-xs font-extrabold text-[var(--accent-primary)] uppercase">
              {isFr ? 'Net Vendeur' : 'Net Payout'}
            </p>
            <p className="font-mono-tabular text-xl font-extrabold text-[var(--accent-primary)] mt-1.5">
              {formatXaf(netSellerPayoutXaf)}
            </p>
            <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-1">
              {isFr ? 'Après commission' : 'After commission'}
            </p>
          </div>
        </div>
      </div>

      {/* Seller Subscription Plans & Paid Product Promotion Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Seller Subscription Plans */}
        <div className="lg:col-span-6 p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>
                {isFr ? '1. Abonnements Vendeur' : '1. Seller Subscriptions'}
              </span>
            </h3>
          </div>
          <p className="text-xs font-bold text-[var(--text-secondary)]">
            {isFr
              ? 'Badge vérifié et visibilité prioritaire.'
              : 'Unlock verified badge and priority placement.'}
          </p>

          <div className="space-y-3">
            {subscriptionPlans.map((plan) => {
              const isCurrent = currentTier === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[var(--text-primary)]">
                        {isFr ? plan.nameFr : plan.nameEn}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-md bg-[var(--accent-primary)] text-white text-[10px] font-extrabold uppercase">
                          {isFr ? 'Actif' : 'Active'}
                        </span>
                      )}
                    </div>
                    <p className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)] mt-0.5">
                      {formatXaf(plan.priceXaf)} / {isFr ? plan.periodFr : plan.periodEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={subscribingId === plan.id}
                    onClick={() => handleActivatePlan(plan)}
                    className="h-9 px-4 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-extrabold cursor-pointer shrink-0"
                  >
                    {subscribingId === plan.id
                      ? isFr
                        ? 'Activation...'
                        : 'Activating...'
                      : isCurrent
                      ? isFr
                        ? 'Renouveler Forfait'
                        : 'Renew Plan'
                      : isFr
                      ? `Souscrire (${formatXaf(plan.priceXaf)})`
                      : `Subscribe (${formatXaf(plan.priceXaf)})`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paid Product Promotions */}
        <div className="lg:col-span-6 p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4">
          <h3 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
            <span>
              {isFr ? '2. Promouvoir vos Produits' : '2. Promote Products'}
            </span>
          </h3>
          <p className="text-xs font-bold text-[var(--text-secondary)]">
            {isFr
              ? 'Affichez vos produits en tête du catalogue.'
              : 'Feature your products at the top of the catalog.'}
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
              {isFr ? 'Pack de Promotion :' : 'Select Promotion Package:'}
            </label>
            <select
              value={selectedPromoPkgId}
              onChange={(e) => setSelectedPromoPkgId(e.target.value as PromotionPackageId)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold text-[var(--text-primary)]"
            >
              {promotionPackages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {isFr ? pkg.nameFr : pkg.nameEn} ({pkg.days} {isFr ? 'jours' : 'days'}) —{' '}
                  {formatXaf(pkg.priceXaf)}
                </option>
              ))}
            </select>
          </div>

          {sellerProducts.length === 0 ? (
            <p className="text-xs font-bold text-[var(--text-muted)] py-4">
              {isFr
                ? 'Publiez d’abord un produit ci-dessus pour pouvoir le promouvoir.'
                : 'Publish a product above first to promote it across the marketplace.'}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {sellerProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                        {prod.title}
                      </p>
                      {prod.isPromoted && (
                        <span className="px-2 py-0.5 rounded-md bg-[var(--accent-primary)] text-white text-[10px] font-extrabold">
                          ★ {isFr ? 'Sponsorisé' : 'Promoted'}
                        </span>
                      )}
                    </div>
                    <p className="font-mono-tabular text-[11px] font-bold text-[var(--text-secondary)]">
                      {formatXaf(prod.priceXaf)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={promotingProdId === prod.id}
                    onClick={() => handleBoostProduct(prod)}
                    className="h-8 px-3 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-[11px] font-extrabold cursor-pointer shrink-0"
                  >
                    {promotingProdId === prod.id
                      ? '...'
                      : prod.isPromoted
                      ? isFr
                        ? 'Re-Booster'
                        : 'Boost Again'
                      : isFr
                      ? 'Promouvoir'
                      : 'Promote'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seller Incoming Orders & Per-Order Commission Breakdown */}
      <div className="p-6 rounded-2xl border-2 border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-xl font-extrabold text-[var(--text-primary)]">
            {isFr
              ? `Commandes & Détail des Commissions (${myShopName})`
              : `My Shop Orders & Commission Breakdown (${myShopName})`}
          </h3>
          <span className="px-3 py-1 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-extrabold">
            {isFr
              ? `Commission : ${commissionPercent}% · Net Vendeur : ${100 - commissionPercent}%`
              : `Commission: ${commissionPercent}% · Seller Net: ${100 - commissionPercent}%`}
          </span>
        </div>

        {sellerOrders.length === 0 ? (
          <p className="text-sm font-bold text-[var(--text-muted)] py-4">
            {isFr
              ? 'Aucune commande reçue pour votre boutique pour le moment.'
              : 'No customer orders received for your shop yet.'}
          </p>
        ) : (
          <div className="space-y-3">
            {sellerOrders.map((ord) => {
              const rate = ord.commissionPercent ?? commissionPercent;
              const commXaf =
                ord.adminCommissionXaf !== undefined
                  ? ord.adminCommissionXaf
                  : Math.round((ord.subtotalXaf * rate) / 100);
              const sellerNetXaf =
                ord.sellerNetPayoutXaf !== undefined
                  ? ord.sellerNetPayoutXaf
                  : Math.max(0, ord.totalXaf - commXaf);

              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-xs font-extrabold text-[var(--text-primary)]">
                        {ord.customerName} ({ord.customerPhone})
                      </span>
                      <span className="text-xs font-bold text-[var(--text-secondary)]">
                        → {ord.deliveryCity}, {ord.deliveryAddress}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[var(--text-secondary)]">
                      {ord.itemsSummary}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono-tabular font-extrabold pt-1">
                      <span className="text-[var(--text-primary)]">
                        {isFr ? 'Brut :' : 'Gross:'} {formatXaf(ord.totalXaf)}
                      </span>
                      <span className="text-[var(--accent-warm)]">
                        {isFr ? `Commission (${rate}%) :` : `Commission (${rate}%):`} -
                        {formatXaf(commXaf)}
                      </span>
                      <span className="text-[var(--accent-primary)]">
                        {isFr ? 'Net Vendeur :' : 'Your Net Payout:'} {formatXaf(sellerNetXaf)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) =>
                        onUpdateOrderStatus(
                          ord.id,
                          e.target.value as OrderStatus,
                          ord.paymentStatus
                        )
                      }
                      className="h-9 px-3 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold"
                    >
                      <option value="placed">{isFr ? 'Reçue' : 'Placed'}</option>
                      <option value="confirmed">{isFr ? 'Confirmée' : 'Confirmed'}</option>
                      <option value="in_transit">{isFr ? 'En Livraison' : 'In Transit'}</option>
                      <option value="delivered">{isFr ? 'Livrée' : 'Delivered'}</option>
                      <option value="cancelled">{isFr ? 'Annulée' : 'Cancelled'}</option>
                    </select>

                    <select
                      value={ord.paymentStatus}
                      onChange={(e) =>
                        onUpdateOrderStatus(
                          ord.id,
                          ord.orderStatus,
                          e.target.value as PaymentStatus
                        )
                      }
                      className="h-9 px-3 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold"
                    >
                      <option value="paid">{isFr ? 'Payé' : 'Paid'}</option>
                      <option value="cod_pending">{isFr ? 'Cash à Percevoir' : 'COD Pending'}</option>
                      <option value="pending">{isFr ? 'En Attente' : 'Pending'}</option>
                      <option value="refunded">{isFr ? 'Remboursé' : 'Refunded'}</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * DEDICATED ADMIN CONTROL CONSOLE:
 * Full marketplace governance + Admin Revenue System:
 * 1. Revenue & Earnings (Total Commissions, Subscription Revenue, Promotion Revenue, Transactions & Fee Configuration)
 * 2. Products (All marketplace products, stock, add/edit/delete)
 * 3. Sellers (Boutiques approval, verification, removal)
 * 4. Users (Roles, accounts, deletion)
 * 5. Orders (All platform orders & fulfillment statuses)
 * 6. Payments (MTN MoMo, Orange Money, Bank Card, COD breakdown)
 * 7. Categories (6 Cameroonian marketplace categories)
 * 8. Reviews & Support Tickets
 * 9. Settings
 */
export function AdminMarketplaceDashboard({
  lang,
  allUsers,
  allShops,
  allProducts,
  allOrders,
  allReviews,
  allTickets,
  revenueTransactions,
  settings,
  onSaveSettings,
  onUpdateUserRole,
  onUpdateUserSellerStatus,
  onDeleteUser,
  onUpdateShopStatus,
  onDeleteShop,
  onUpdateProductStock,
  onEditProduct,
  onDeleteProduct,
  onOpenNewProductModal,
  onUpdateOrderStatus,
  onDeleteReview,
  onResolveTicket,
  getCategoryLabel,
  onApproveProduct,
  onApproveAllSellerProducts,
}: {
  lang: Language;
  allUsers: UserAccount[];
  allShops: ShopProfile[];
  allProducts: ProductItem[];
  allOrders: OrderRecord[];
  allReviews: ProductReview[];
  allTickets: SupportTicket[];
  revenueTransactions: RevenueTransaction[];
  settings: MarketplaceSettings;
  onSaveSettings: (next: MarketplaceSettings) => void;
  onUpdateUserRole: (uid: string, role: UserRole) => Promise<void>;
  onUpdateUserSellerStatus: (uid: string, status: SellerApprovalStatus) => Promise<void>;
  onDeleteUser: (uid: string) => Promise<void>;
  onUpdateShopStatus: (shopId: string, status: SellerApprovalStatus) => Promise<void>;
  onDeleteShop: (shopId: string) => Promise<void>;
  onUpdateProductStock: (product: ProductItem, nextStock: number) => Promise<void>;
  onEditProduct: (product: ProductItem) => void;
  onDeleteProduct: (product: ProductItem) => void;
  onOpenNewProductModal: () => void;
  onUpdateOrderStatus: (
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus: PaymentStatus
  ) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onResolveTicket: (ticketId: string) => Promise<void>;
  getCategoryLabel: (cat: ProductCategory) => string;
  onApproveProduct?: (productId: string, approve: boolean) => Promise<void>;
  onApproveAllSellerProducts?: (sellerId: string) => Promise<void>;
}) {
  const isFr = lang === 'fr';
  type AdminTab =
    | 'revenue'
    | 'products'
    | 'sellers'
    | 'users'
    | 'orders'
    | 'payments'
    | 'categories'
    | 'reviews'
    | 'settings';

  const [activeTab, setActiveTab] = useState<AdminTab>('revenue');
  const [adminProdSearch, setAdminProdSearch] = useState('');
  const [adminProdFilter, setAdminProdFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminUserFilter, setAdminUserFilter] = useState<
    'all' | 'pending' | 'sellers' | 'customers' | 'has_shop'
  >('all');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const validOrders = allOrders.filter((o) => o.orderStatus !== 'cancelled');
  const totalGmvXaf = validOrders.reduce((sum, o) => sum + o.totalXaf, 0);

  // 1. Commission Revenue from Orders + Commission Transactions
  const orderCommissionsXaf = validOrders.reduce((sum, o) => {
    const comm =
      o.adminCommissionXaf !== undefined
        ? o.adminCommissionXaf
        : Math.round((o.subtotalXaf * (o.commissionPercent ?? settings.commissionPercent)) / 100);
    return sum + comm;
  }, 0);

  const txCommissionsXaf = revenueTransactions
    .filter((tx) => tx.type === 'commission')
    .reduce((sum, tx) => sum + tx.adminEarnedXaf, 0);

  const totalCommissionsXaf = Math.max(orderCommissionsXaf, txCommissionsXaf);

  // 2. Seller Subscription Revenue
  const subscriptionRevenueXaf = revenueTransactions
    .filter((tx) => tx.type === 'subscription')
    .reduce((sum, tx) => sum + tx.adminEarnedXaf, 0);

  // 3. Paid Promoted Products Revenue
  const promotionRevenueXaf = revenueTransactions
    .filter((tx) => tx.type === 'promotion')
    .reduce((sum, tx) => sum + tx.adminEarnedXaf, 0);

  // Overall Marketplace Admin Earnings
  const overallAdminEarningsXaf =
    totalCommissionsXaf + subscriptionRevenueXaf + promotionRevenueXaf;

  const paidRevenueXaf = allOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalXaf, 0);

  const codPendingXaf = allOrders
    .filter((o) => o.paymentStatus === 'cod_pending' || o.paymentStatus === 'pending')
    .reduce((sum, o) => sum + o.totalXaf, 0);

  const mtnMomoTotalXaf = validOrders
    .filter((o) => o.paymentMethod === 'mtn_momo')
    .reduce((sum, o) => sum + o.totalXaf, 0);

  const orangeMoneyTotalXaf = validOrders
    .filter((o) => o.paymentMethod === 'orange_money')
    .reduce((sum, o) => sum + o.totalXaf, 0);

  const cardTotalXaf = validOrders
    .filter((o) => o.paymentMethod === 'bank_card')
    .reduce((sum, o) => sum + o.totalXaf, 0);

  const codTotalXaf = validOrders
    .filter((o) => o.paymentMethod === 'cash_on_delivery')
    .reduce((sum, o) => sum + o.totalXaf, 0);

  const pendingAdminProductsCount = allProducts.filter(
    (p) => p.approvalStatus === 'pending' || p.isApproved === false
  ).length;
  const approvedAdminProductsCount = allProducts.filter(
    (p) => p.approvalStatus === 'approved' || p.isApproved !== false
  ).length;

  const filteredAdminProducts = allProducts.filter((p) => {
    const isPending = p.approvalStatus === 'pending' || p.isApproved === false;
    if (adminProdFilter === 'pending' && !isPending) return false;
    if (adminProdFilter === 'approved' && isPending) return false;
    return (
      !adminProdSearch.trim() ||
      p.title.toLowerCase().includes(adminProdSearch.toLowerCase()) ||
      p.shopName.toLowerCase().includes(adminProdSearch.toLowerCase())
    );
  });

  const categoriesList: ProductCategory[] = [
    'gourmet',
    'fashion',
    'beauty',
    'electronics',
    'household',
    'crafts',
  ];

  const adminTabs: { id: AdminTab; label: string; count?: number }[] = [
    {
      id: 'revenue',
      label: isFr ? '1. Revenus & Commissions' : '1. Revenue & Earnings',
      count: revenueTransactions.length,
    },
    {
      id: 'products',
      label: isFr ? '2. Produits & Stock' : '2. Products & Stock',
      count: allProducts.length,
    },
    {
      id: 'sellers',
      label: isFr ? '3. Vendeurs & Boutiques' : '3. Sellers & Shops',
      count: allShops.length,
    },
    {
      id: 'users',
      label: isFr ? '4. Utilisateurs & Rôles' : '4. Users & Roles',
      count: allUsers.length,
    },
    {
      id: 'orders',
      label: isFr ? '5. Commandes' : '5. Orders',
      count: allOrders.length,
    },
    {
      id: 'payments',
      label: isFr ? '6. Paiements (FCFA)' : '6. Payments (FCFA)',
      count: allOrders.length,
    },
    {
      id: 'categories',
      label: isFr ? '7. Catégories' : '7. Categories',
      count: categoriesList.length,
    },
    {
      id: 'reviews',
      label: isFr ? '8. Avis & Support' : '8. Reviews & Tickets',
      count: allReviews.length + allTickets.length,
    },
    {
      id: 'settings',
      label: isFr ? '9. Paramètres' : '9. Settings',
    },
  ];

  const handleUpdateSubscriptionPrice = (tierId: SubscriptionTier, priceXaf: number) => {
    const updated = settings.subscriptionPlans.map((p) =>
      p.id === tierId ? { ...p, priceXaf: Math.max(0, priceXaf) } : p
    );
    onSaveSettings({
      ...settings,
      subscriptionPlans: updated,
    });
  };

  const handleUpdatePromotionPackage = (
    pkgId: PromotionPackageId,
    field: 'priceXaf' | 'days',
    val: number
  ) => {
    const updated = settings.promotionPackages.map((pkg) =>
      pkg.id === pkgId ? { ...pkg, [field]: Math.max(1, val) } : pkg
    );
    onSaveSettings({
      ...settings,
      promotionPackages: updated,
    });
  };

  return (
    <div className="space-y-8">
      {/* Executive Marketplace & Revenue KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border-2 border-[var(--accent-primary)] bg-[var(--bg-elevated)] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--accent-primary)] uppercase">
            <Coins className="w-4 h-4" />
            <span>
              {isFr ? 'Revenus Totaux Admin (FCFA)' : 'Overall Marketplace Earnings'}
            </span>
          </div>
          <p className="font-mono-tabular text-2xl font-extrabold text-[var(--accent-primary)] mt-2">
            {formatXaf(overallAdminEarningsXaf)}
          </p>
          <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-1">
            {isFr
              ? 'Commissions + Abonnements + Promotions'
              : 'Commissions + Subscriptions + Promotions'}
          </p>
        </div>

        <div className="p-5 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-secondary)] uppercase">
            <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>
              {isFr
                ? `Total Commissions (${settings.commissionPercent}%)`
                : `Total Commissions (${settings.commissionPercent}%)`}
            </span>
          </div>
          <p className="font-mono-tabular text-2xl font-extrabold text-[var(--text-primary)] mt-2">
            {formatXaf(totalCommissionsXaf)}
          </p>
          <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-1">
            {isFr ? 'Volume GMV :' : 'From GMV:'} {formatXaf(totalGmvXaf)}
          </p>
        </div>

        <div className="p-5 rounded-2xl border-2 border-[var(--border-hairline)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-secondary)] uppercase">
            <Award className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>{isFr ? 'Revenus Abonnements' : 'Subscription Revenue'}</span>
          </div>
          <p className="font-mono-tabular text-2xl font-extrabold text-[var(--text-primary)] mt-2">
            {formatXaf(subscriptionRevenueXaf)}
          </p>
          <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-1">
            {allShops.length} {isFr ? 'boutiques inscrites' : 'registered shops'}
          </p>
        </div>

        <div className="p-5 rounded-2xl border-2 border-[var(--border-hairline)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-secondary)] uppercase">
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>{isFr ? 'Revenus Produits Promus' : 'Promotion Revenue'}</span>
          </div>
          <p className="font-mono-tabular text-2xl font-extrabold text-[var(--text-primary)] mt-2">
            {formatXaf(promotionRevenueXaf)}
          </p>
          <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-1">
            {allProducts.filter((p) => p.isPromoted).length}{' '}
            {isFr ? 'produits sponsorisés' : 'promoted products'}
          </p>
        </div>
      </div>

      {/* 9-Module Admin Navigation Bar */}
      <div className="flex items-center gap-2 p-2 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] overflow-x-auto">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer border ${
              activeTab === tab.id
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xs'
                : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:bg-[var(--accent-primary)]/10'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="font-mono-tabular text-[11px] px-1.5 py-0.5 rounded-md bg-black/15">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: ADMIN REVENUE SYSTEM (Commissions, Subscriptions, Promoted Products & Pricing Config) */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Streams Breakdown Cards */}
          <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
              <div>
                <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[var(--accent-primary)]" />
                  <span>
                    {isFr
                      ? 'Revenus Admin & Configuration des Frais'
                      : 'Admin Revenue & Fee Configuration'}
                  </span>
                </h2>
                <p className="text-xs font-bold text-[var(--text-secondary)] mt-1">
                  {isFr
                    ? 'Commissions, abonnements vendeurs et promotions payantes.'
                    : 'Commissions, seller subscriptions, and product promotions.'}
                </p>
              </div>
              {settingsSaved && (
                <span className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-extrabold">
                  ✓ {isFr ? 'Tarifs mis à jour !' : 'Revenue settings saved!'}
                </span>
              )}
            </div>

            {/* Configuration of Commission %, Subscription Prices & Promotion Packages */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 1. Commission Rate Config */}
              <div className="p-5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent-primary)]">
                    {isFr ? '1. Commission sur Transactions' : '1. Transaction Commission'}
                  </span>
                  <span className="font-mono-tabular text-sm font-extrabold text-[var(--accent-primary)]">
                    {settings.commissionPercent}%
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-secondary)]">
                  {isFr
                    ? '% prélevé sur chaque vente vendeur.'
                    : '% earned on every seller order.'}
                </p>
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-extrabold text-[var(--text-primary)]">
                    {isFr ? 'Pourcentage de Commission (%)' : 'Commission Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={settings.commissionPercent}
                    onChange={(e) => {
                      onSaveSettings({
                        ...settings,
                        commissionPercent: Math.max(0, Math.min(50, Number(e.target.value))),
                      });
                      setSettingsSaved(true);
                      setTimeout(() => setSettingsSaved(false), 2500);
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] font-mono-tabular text-sm font-extrabold text-[var(--accent-primary)]"
                  />
                </div>
              </div>

              {/* 2. Seller Subscription Prices Config */}
              <div className="p-5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent-primary)] block">
                  {isFr ? '2. Tarifs Abonnements Vendeurs (FCFA)' : '2. Seller Subscription Prices'}
                </span>
                <div className="space-y-2.5">
                  {settings.subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between gap-2">
                      <label className="text-xs font-extrabold text-[var(--text-primary)]">
                        {isFr ? plan.nameFr : plan.nameEn}
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={plan.priceXaf}
                        onChange={(e) => {
                          handleUpdateSubscriptionPrice(plan.id, Number(e.target.value));
                          setSettingsSaved(true);
                          setTimeout(() => setSettingsSaved(false), 2500);
                        }}
                        className="w-28 h-9 px-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] font-mono-tabular text-xs font-extrabold text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Product Promotion Packages Config */}
              <div className="p-5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent-primary)] block">
                  {isFr ? '3. Packs Produits Promus (FCFA)' : '3. Promotion Packages (FCFA)'}
                </span>
                <div className="space-y-2.5">
                  {settings.promotionPackages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                        {isFr ? pkg.nameFr : pkg.nameEn} ({pkg.days}d)
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={pkg.priceXaf}
                        onChange={(e) => {
                          handleUpdatePromotionPackage(pkg.id, 'priceXaf', Number(e.target.value));
                          setSettingsSaved(true);
                          setTimeout(() => setSettingsSaved(false), 2500);
                        }}
                        className="w-28 h-9 px-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] font-mono-tabular text-xs font-extrabold text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* All Revenue & Commission Transactions Ledger */}
          <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
              <h3 className="font-display text-lg font-extrabold text-[var(--text-primary)]">
                {isFr
                  ? `Journal des Transactions & Gains Admin (${revenueTransactions.length})`
                  : `Marketplace Revenue & Commission Transactions (${revenueTransactions.length})`}
              </h3>
              <span className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]">
                {isFr ? 'Total Cumulé :' : 'Total Earned:'} {formatXaf(overallAdminEarningsXaf)}
              </span>
            </div>

            {revenueTransactions.length === 0 ? (
              <p className="text-xs font-bold text-[var(--text-muted)] py-6 text-center">
                {isFr
                  ? 'Aucune transaction enregistrée.'
                  : 'No revenue transactions recorded yet.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {revenueTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            tx.type === 'commission'
                              ? 'bg-[var(--accent-primary)] text-white'
                              : tx.type === 'subscription'
                              ? 'bg-slate-800 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {tx.type === 'commission'
                            ? isFr
                              ? 'Commission Vente'
                              : 'Order Commission'
                            : tx.type === 'subscription'
                            ? isFr
                              ? 'Abonnement Vendeur'
                              : 'Seller Subscription'
                            : isFr
                            ? 'Produit Sponsorisé'
                            : 'Promoted Product'}
                        </span>
                        <span className="text-xs font-extrabold text-[var(--text-primary)]">
                          {tx.shopName}
                        </span>
                        <span className="text-[11px] font-bold text-[var(--text-muted)]">
                          · {tx.createdAt}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">
                        {tx.description}
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-mono-tabular text-sm font-extrabold text-[var(--accent-primary)]">
                        + {formatXaf(tx.adminEarnedXaf)}
                      </p>
                      <p className="font-mono-tabular text-[11px] font-bold text-[var(--text-muted)]">
                        {isFr ? 'Montant Brut :' : 'Gross:'} {formatXaf(tx.grossAmountXaf)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT (All Marketplace Products) */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
            <div>
              <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)]">
                {isFr
                  ? `Produits & Stock (${allProducts.length})`
                  : `Products & Stock (${allProducts.length})`}
              </h2>
              <p className="text-xs font-bold text-[var(--text-secondary)]">
                {isFr
                  ? 'Gérez et approuvez les produits de toutes les boutiques.'
                  : 'Manage and approve products listed across all shops.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="search"
                value={adminProdSearch}
                onChange={(e) => setAdminProdSearch(e.target.value)}
                placeholder={isFr ? 'Filtrer produits ou boutiques...' : 'Search product or shop...'}
                className="h-10 px-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-bold"
              />
              <button
                type="button"
                onClick={onOpenNewProductModal}
                className="h-10 px-4 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isFr ? 'Ajouter un Produit (Admin)' : 'Add Product to Any Shop'}</span>
              </button>
            </div>
          </div>

          {/* Filter Pills: All / Pending Approval / Approved */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAdminProdFilter('all')}
              className={`h-9 px-3.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                adminProdFilter === 'all'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)]'
              }`}
            >
              {isFr ? 'Tous les Produits' : 'All Products'} ({allProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setAdminProdFilter('pending')}
              className={`h-9 px-3.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                adminProdFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : pendingAdminProductsCount > 0
                  ? 'bg-amber-50 border-2 border-amber-400 text-amber-900 animate-pulse'
                  : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isFr ? 'En Attente d’Approbation' : 'Pending Approval'}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[11px]">
                {pendingAdminProductsCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAdminProdFilter('approved')}
              className={`h-9 px-3.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                adminProdFilter === 'approved'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isFr ? 'Approuvés & En Ligne' : 'Approved & Live'}</span>
              <span>({approvedAdminProductsCount})</span>
            </button>
          </div>

          {filteredAdminProducts.length === 0 ? (
            <p className="text-sm font-bold text-[var(--text-muted)] py-8 text-center">
              {isFr
                ? 'Aucun produit ne correspond aux critères sélectionnés.'
                : 'No products match the selected filter.'}
            </p>
          ) : (
            <div className="divide-y divide-[var(--border-hairline)]">
              {filteredAdminProducts.map((prod) => {
                const isDeviceUpload = prod.imageUrl.startsWith('data:image');
                const isProdPending =
                  prod.approvalStatus === 'pending' || prod.isApproved === false;
                return (
                  <div
                    key={prod.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = HERO_IMAGE_URL;
                        }}
                        className="w-16 h-16 rounded-xl object-cover bg-[var(--bg-surface)] border-2 border-[var(--border-strong)] shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-[var(--accent-primary)]">
                          <span>{getCategoryLabel(prod.category)}</span>
                          <span>·</span>
                          <span>
                            {prod.shopName} ({prod.shopCity})
                          </span>
                          <span>·</span>
                          <span
                            className={`px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-[11px] font-extrabold ${
                              isProdPending
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                            }`}
                          >
                            {isProdPending ? (
                              <>
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>
                                  {isFr ? '⏳ En Attente Approbation' : '⏳ Pending Approval'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                <span>{isFr ? '✓ Approuvé' : '✓ Approved'}</span>
                              </>
                            )}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                          {prod.title}
                        </h3>
                        <p className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]">
                          {formatXaf(prod.priceXaf)} · Stock: {prod.stock ?? 15}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                      {isProdPending ? (
                        <button
                          type="button"
                          onClick={() => onApproveProduct?.(prod.id, true)}
                          className="h-9 px-3 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isFr ? 'Approuver Produit' : 'Approve Product'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onApproveProduct?.(prod.id, false)}
                          className="h-9 px-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-bold inline-flex items-center gap-1 cursor-pointer text-[var(--text-muted)]"
                          title="Set product back to pending"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isFr ? 'Mettre en Attente' : 'Set Pending'}</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1 px-2 py-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
                        <span className="text-[10px] font-extrabold text-[var(--text-secondary)] mr-1">
                          Stock:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateProductStock(prod, Math.max(0, (prod.stock ?? 15) - 1))
                          }
                          className="w-6 h-6 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs font-extrabold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={9999}
                          value={prod.stock ?? 15}
                          onChange={(e) => onUpdateProductStock(prod, Number(e.target.value))}
                          aria-label="Stock quantity"
                          className="w-12 h-6 px-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-center font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateProductStock(prod, (prod.stock ?? 15) + 1)}
                          className="w-6 h-6 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs font-extrabold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onEditProduct(prod)}
                        className="h-9 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Modifier' : 'Edit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(prod)}
                        className="h-9 px-3 rounded-xl border border-red-200 bg-red-50 text-xs font-extrabold text-red-700 hover:bg-red-100 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Supprimer' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SELLERS & BOUTIQUES CONTROL */}
      {activeTab === 'sellers' && (
        <div className="p-4 sm:p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
                <span>
                  {isFr
                    ? `Vendeurs & Boutiques (${allShops.length})`
                    : `Sellers & Shops (${allShops.length})`}
                </span>
              </h2>
              <p className="text-xs font-bold text-[var(--text-secondary)] mt-1">
                {isFr
                  ? 'Approuvez, suspendez ou supprimez vendeurs et boutiques.'
                  : 'Approve, suspend, ban, or delete sellers and shops.'}
              </p>
            </div>
          </div>

          {/* Section A: Seller Accounts Approval */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--accent-primary)]">
              {isFr
                ? '1. Comptes Vendeurs — Approbation (En Attente / Approuvé / Suspendu / Banni)'
                : '1. Seller Accounts — Approval Status (Pending / Approved / Suspended / Banned)'}
            </h3>
            {allUsers.filter((u) => u.role === 'shop_owner').length === 0 ? (
              <p className="text-xs font-bold text-[var(--text-muted)] py-2">
                {isFr
                  ? 'Aucun utilisateur inscrit avec le rôle Vendeur pour le moment.'
                  : 'No registered user accounts with Seller role yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allUsers
                  .filter((u) => u.role === 'shop_owner')
                  .map((sellerUser) => {
                    const st: SellerApprovalStatus = sellerUser.sellerStatus || 'pending';
                    return (
                      <div
                        key={sellerUser.uid}
                        className="p-4 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-extrabold text-[var(--text-primary)]">
                              {sellerUser.displayName}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase ${
                                st === 'approved'
                                  ? 'bg-[var(--accent-primary)] text-white'
                                  : st === 'pending'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {st}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[var(--text-secondary)] break-all">
                            {sellerUser.email} · {sellerUser.defaultCity || 'Cameroon'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-hairline)]">
                          <button
                            type="button"
                            onClick={() => onUpdateUserSellerStatus(sellerUser.uid, 'approved')}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                              st === 'approved'
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)]'
                            }`}
                          >
                            {isFr ? 'Approuver' : 'Approve Seller'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateUserSellerStatus(sellerUser.uid, 'pending')}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] cursor-pointer"
                          >
                            {isFr ? 'En Attente' : 'Set Pending'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateUserSellerStatus(sellerUser.uid, 'suspended')}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-amber-700 cursor-pointer"
                          >
                            {isFr ? 'Suspendre' : 'Suspend'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateUserSellerStatus(sellerUser.uid, 'banned')}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-red-600 text-white cursor-pointer"
                          >
                            {isFr ? 'Bannir' : 'Ban Seller'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteUser(sellerUser.uid)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isFr ? 'Supprimer' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Section B: All Marketplace Shops / Boutiques */}
          <div className="space-y-3 pt-4 border-t-2 border-[var(--border-hairline)]">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--accent-primary)]">
              {isFr
                ? `2. Boutiques du Marché (${allShops.length})`
                : `2. Marketplace Shops & Boutiques (${allShops.length})`}
            </h3>
            {allShops.length === 0 ? (
              <p className="text-xs font-bold text-[var(--text-muted)] py-2">
                {isFr ? 'Aucune boutique créée pour le moment.' : 'No shops created yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allShops.map((s) => {
                  const prodCount = allProducts.filter((p) => p.shopId === s.ownerId).length;
                  const shopSt: SellerApprovalStatus =
                    s.status || (s.isVerified === false ? 'pending' : 'approved');
                  return (
                    <div
                      key={s.ownerId}
                      className="p-4 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-[var(--text-primary)]">
                            {s.shopName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-[var(--accent-primary)] text-white">
                            {shopSt} · {(s.subscriptionTier || 'free').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-secondary)]">
                          {s.city} · +{s.whatsappNumber} · {prodCount}{' '}
                          {isFr ? 'produits' : 'products'}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                          {summarizeText(s.bio, 70)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-hairline)]">
                        <button
                          type="button"
                          onClick={() => onUpdateShopStatus(s.ownerId, 'approved')}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-[var(--accent-primary)] text-white cursor-pointer"
                        >
                          {isFr ? 'Approuver' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateShopStatus(s.ownerId, 'pending')}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] cursor-pointer"
                        >
                          {isFr ? 'En Attente' : 'Pending'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateShopStatus(s.ownerId, 'suspended')}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--accent-warm)] cursor-pointer"
                        >
                          {isFr ? 'Suspendre' : 'Suspend'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteShop(s.ownerId)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isFr ? 'Supprimer' : 'Delete Shop'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: USERS & ROLE-BASED ACCESS CONTROL */}
      {activeTab === 'users' && (() => {
        const pendingUsersCount = allUsers.filter(
          (u) =>
            (u.sellerStatus === 'pending' || u.accountStatus === 'pending') &&
            u.role === 'shop_owner'
        ).length;
        const sellersCount = allUsers.filter((u) => u.role === 'shop_owner').length;
        const customersCount = allUsers.filter((u) => u.role === 'customer').length;
        const withShopsCount = allUsers.filter(
          (u) => u.hasShop || !!u.shopName || allShops.some((s) => s.ownerId === u.uid)
        ).length;

        const filteredUsers = allUsers.filter((u) => {
          const userShop =
            allShops.find((s) => s.ownerId === u.uid) ||
            (u.hasShop || u.shopName
              ? { shopName: u.shopName || '', city: u.shopCity || '' }
              : null);

          if (adminUserFilter === 'pending') {
            const isPending =
              u.sellerStatus === 'pending' ||
              u.accountStatus === 'pending' ||
              (userShop && 'status' in userShop && userShop.status === 'pending');
            if (!isPending) return false;
          } else if (adminUserFilter === 'sellers') {
            if (u.role !== 'shop_owner') return false;
          } else if (adminUserFilter === 'customers') {
            if (u.role !== 'customer') return false;
          } else if (adminUserFilter === 'has_shop') {
            if (!userShop) return false;
          }

          if (!adminUserSearch.trim()) return true;
          const q = adminUserSearch.toLowerCase();
          return (
            u.displayName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.phone && u.phone.toLowerCase().includes(q)) ||
            (u.defaultCity && u.defaultCity.toLowerCase().includes(q)) ||
            (userShop && userShop.shopName.toLowerCase().includes(q))
          );
        });

        return (
          <div className="p-4 sm:p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
                  <span>
                    {isFr
                      ? `Gestion des Utilisateurs, Boutiques & Rôles (${allUsers.length})`
                      : `User Accounts, Shops & Role Management (${allUsers.length})`}
                  </span>
                </h2>
                <p className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">
                  {isFr
                    ? 'Supervisez tous les détails créés par les clients et vendeurs (coordonnées, boutiques, produits et approbations).'
                    : 'Manage all details submitted by customers and sellers (contact info, created shops, products, and approvals).'}
                </p>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="search"
                  value={adminUserSearch}
                  onChange={(e) => setAdminUserSearch(e.target.value)}
                  placeholder={
                    isFr
                      ? 'Rechercher nom, email, boutique, ville...'
                      : 'Search name, email, shop, city...'
                  }
                  className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-bold"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAdminUserFilter('all')}
                className={`h-9 px-3.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                  adminUserFilter === 'all'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)]'
                }`}
              >
                {isFr ? 'Tous les Comptes' : 'All Accounts'} ({allUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setAdminUserFilter('pending')}
                className={`h-9 px-3.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  adminUserFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : pendingUsersCount > 0
                    ? 'bg-amber-50 border-2 border-amber-400 text-amber-900 animate-pulse'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isFr ? 'En Attente d’Approbation' : 'Pending Approval'}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[11px]">
                  {pendingUsersCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAdminUserFilter('sellers')}
                className={`h-9 px-3.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  adminUserFilter === 'sellers'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)]'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{isFr ? 'Vendeurs' : 'Sellers'}</span>
                <span>({sellersCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminUserFilter('has_shop')}
                className={`h-9 px-3.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  adminUserFilter === 'has_shop'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)]'
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>{isFr ? 'Avec Boutique Créée' : 'With Created Shop'}</span>
                <span>({withShopsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminUserFilter('customers')}
                className={`h-9 px-3.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  adminUserFilter === 'customers'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{isFr ? 'Clients' : 'Customers'}</span>
                <span>({customersCount})</span>
              </button>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="text-xs font-bold text-[var(--text-muted)] py-6 text-center">
                {isFr
                  ? 'Aucun utilisateur ne correspond à ce filtre.'
                  : 'No users match this filter.'}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((u) => {
                  const sellerSt: SellerApprovalStatus = u.sellerStatus || 'pending';
                  const isAccountPending =
                    sellerSt === 'pending' || u.accountStatus === 'pending';

                  // 1. Linked Shop Profile (if any)
                  const userShop: ShopProfile | null =
                    allShops.find((s) => s.ownerId === u.uid) ||
                    (u.hasShop || u.shopName
                      ? {
                          ownerId: u.uid,
                          shopName: u.shopName || `${u.displayName}'s Boutique`,
                          city: u.shopCity || u.defaultCity || 'Douala',
                          whatsappNumber:
                            u.shopWhatsapp ||
                            u.phone?.replace(/[^0-9]/g, '') ||
                            '237696751829',
                          bio: 'Boutique enregistrée sur SWMARKETPLACE',
                          category: 'fashion',
                          status: sellerSt,
                          isVerified: sellerSt === 'approved',
                          isPublic: true,
                        }
                      : null);

                  const shopSt: SellerApprovalStatus = userShop
                    ? userShop.status ||
                      (userShop.isVerified === false ? 'pending' : 'approved')
                    : 'pending';

                  // 2. Linked Products added by this user / shop
                  const userProducts = allProducts.filter(
                    (p) =>
                      p.ownerId === u.uid || (userShop && p.shopId === userShop.ownerId)
                  );
                  const pendingUserProducts = userProducts.filter(
                    (p) =>
                      p.approvalStatus === 'pending' || p.isApproved === false
                  );

                  // 3. User Orders (customer orders + seller fulfilled orders)
                  const userCustomerOrders = allOrders.filter(
                    (o) => o.customerId === u.uid
                  );
                  const userSellerOrders = allOrders.filter(
                    (o) => userShop && o.shopId === userShop.ownerId
                  );
                  const totalSpentXaf = userCustomerOrders.reduce(
                    (sum, o) => sum + o.totalXaf,
                    0
                  );

                  const isExpanded = expandedUserId === u.uid;

                  return (
                    <div
                      key={u.uid}
                      className="p-5 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-4 shadow-xs"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 flex items-center justify-center font-display text-base font-extrabold text-[var(--accent-primary)] shrink-0">
                            {u.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                                {u.displayName}
                              </h3>
                              <span className="text-xs font-mono-tabular text-[var(--text-secondary)] break-all">
                                ({u.email})
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-hairline)] font-mono text-[10px] text-[var(--text-muted)]">
                                UID: {u.uid.slice(0, 8)}...
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">
                              {u.defaultCity || 'Cameroon'} ·{' '}
                              {u.phone ||
                                (isFr ? 'Sans téléphone' : 'No phone')}
                            </p>
                          </div>
                        </div>

                        {/* Status, Role and Quick Actions */}
                        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                          {/* Role Selector */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase">
                              {isFr ? 'Rôle :' : 'Role:'}
                            </span>
                            <select
                              value={u.role}
                              onChange={(e) =>
                                onUpdateUserRole(u.uid, e.target.value as UserRole)
                              }
                              className="h-9 px-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold cursor-pointer"
                            >
                              <option value="customer">
                                {isFr ? '🛒 Client' : '🛒 Customer'}
                              </option>
                              <option value="shop_owner">
                                {isFr ? '🏪 Vendeur (Boutique)' : '🏪 Seller (Shop)'}
                              </option>
                              <option value="admin">
                                {isFr ? '🛡️ Admin' : '🛡️ Admin'}
                              </option>
                            </select>
                          </div>

                          {/* Approval Status Badge & Selector for Seller/Account */}
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold uppercase inline-flex items-center gap-1 ${
                              sellerSt === 'approved'
                                ? 'bg-[var(--accent-primary)] text-white'
                                : sellerSt === 'pending'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {sellerSt === 'approved' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isFr ? 'Approuvé' : 'Approved'}</span>
                              </>
                            ) : sellerSt === 'pending' ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-700" />
                                <span>{isFr ? 'En Attente' : 'Pending'}</span>
                              </>
                            ) : (
                              <span>{sellerSt}</span>
                            )}
                          </span>

                          {/* Direct Approve Button if Pending */}
                          {isAccountPending ? (
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateUserSellerStatus(u.uid, 'approved')
                              }
                              className="h-9 px-3 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {isFr ? 'Approuver Compte' : 'Approve Account'}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateUserSellerStatus(u.uid, 'pending')
                              }
                              className="h-9 px-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-bold inline-flex items-center gap-1 cursor-pointer text-[var(--text-muted)]"
                              title="Set status back to pending"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{isFr ? 'Mettre en Attente' : 'Set Pending'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeleteUser(u.uid)}
                            className="h-9 px-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isFr ? 'Supprimer' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Section 1: Customer Profile & Contact Details (Every detail created by customer) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs">
                        <div>
                          <span className="font-extrabold text-[var(--text-muted)] block text-[10px] uppercase">
                            {isFr ? 'Téléphone' : 'Phone'}
                          </span>
                          <span className="font-mono-tabular font-bold text-[var(--text-primary)]">
                            {u.phone || (isFr ? 'Non renseigné' : 'Not provided')}
                          </span>
                        </div>
                        <div>
                          <span className="font-extrabold text-[var(--text-muted)] block text-[10px] uppercase">
                            {isFr ? 'Ville de Livraison' : 'Delivery City'}
                          </span>
                          <span className="font-bold text-[var(--text-primary)]">
                            {u.defaultCity ||
                              (isFr ? 'Non renseignée' : 'Not specified')}
                          </span>
                        </div>
                        <div>
                          <span className="font-extrabold text-[var(--text-muted)] block text-[10px] uppercase">
                            {isFr ? 'Adresse & Quartier' : 'Street Address'}
                          </span>
                          <span
                            className="font-bold text-[var(--text-primary)] truncate block"
                            title={u.defaultAddress}
                          >
                            {u.defaultAddress ||
                              (isFr ? 'Non renseignée' : 'Not specified')}
                          </span>
                        </div>
                        <div>
                          <span className="font-extrabold text-[var(--text-muted)] block text-[10px] uppercase">
                            {isFr ? 'Activité Commandes' : 'Orders Placed'}
                          </span>
                          <span className="font-mono-tabular font-bold text-[var(--accent-primary)]">
                            {userCustomerOrders.length}{' '}
                            {isFr ? 'cmd' : 'orders'} ({formatXaf(totalSpentXaf)})
                          </span>
                        </div>
                      </div>

                      {/* Section 2: Created Shop & Boutique Information (Every detail when shop is created) */}
                      <div className="p-4 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-canvas)] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-[var(--accent-primary)]" />
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                              {isFr
                                ? 'Boutique Associée à cet Utilisateur'
                                : 'Shop Associated with this User'}
                            </h4>
                          </div>

                          {userShop && (
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase inline-flex items-center gap-1 ${
                                shopSt === 'approved'
                                  ? 'bg-[var(--accent-primary)] text-white'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {shopSt === 'approved' ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>
                                    {isFr
                                      ? 'Boutique Approuvée'
                                      : 'Shop Approved'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  <span>
                                    {isFr
                                      ? 'Boutique En Attente Approbation'
                                      : 'Shop Pending Approval'}
                                  </span>
                                </>
                              )}
                            </span>
                          )}
                        </div>

                        {userShop ? (
                          <div className="space-y-3 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="font-extrabold text-[var(--text-muted)] block text-[10px] uppercase">
                                  {isFr ? 'Nom de la Boutique' : 'Shop Name'}
                                </span>
                                <span className="font-extrabold text-sm text-[var(--text-primary)]">
                                  {userShop.shopName}
                                </span>
                              </div>
                              <div>
                                <span className="font-extrabold text-[var(--text-muted)] block text-[10px] uppercase">
                                  {isFr ? 'Ville & WhatsApp' : 'City & WhatsApp'}
                                </span>
                                <span className="font-bold text-[var(--text-primary)] block">
                                  {userShop.city} · +{userShop.whatsappNumber}
                                </span>
                              </div>
                              <div>
                                <span className="font-extrabold text-[var(--text-muted)] block text-[10px] uppercase">
                                  {isFr ? 'Catégorie' : 'Category'}
                                </span>
                                <span className="font-bold text-[var(--text-primary)]">
                                  {userShop.category
                                    ? getCategoryLabel(userShop.category)
                                    : 'Général'}
                                </span>
                              </div>
                              <div>
                                <span className="font-extrabold text-[var(--text-muted)] block text-[10px] uppercase">
                                  {isFr ? 'Abonnement & Ventes' : 'Plan & Orders'}
                                </span>
                                <span className="font-bold text-[var(--accent-primary)]">
                                  {(userShop.subscriptionTier || 'free').toUpperCase()} ·{' '}
                                  {userSellerOrders.length}{' '}
                                  {isFr ? 'ventes' : 'sales'}
                                </span>
                              </div>
                            </div>

                            {userShop.bio && (
                              <p className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-elevated)] p-2.5 rounded-lg border border-[var(--border-hairline)]">
                                « {userShop.bio} »
                              </p>
                            )}

                            {/* Admin Shop Approval Controls */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
                              <span className="text-[11px] font-extrabold text-[var(--text-muted)] mr-1">
                                {isFr ? 'Actions Boutique :' : 'Shop Actions:'}
                              </span>
                              {shopSt !== 'approved' ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateShopStatus(userShop.ownerId, 'approved')
                                  }
                                  className="h-8 px-3 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>
                                    {isFr ? 'Approuver Boutique' : 'Approve Shop'}
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateShopStatus(userShop.ownerId, 'pending')
                                  }
                                  className="h-8 px-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-secondary)] inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>
                                    {isFr ? 'Mettre en Attente' : 'Set Pending'}
                                  </span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateShopStatus(userShop.ownerId, 'suspended')
                                }
                                className="h-8 px-2.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-xs font-bold text-amber-700 cursor-pointer"
                              >
                                {isFr ? 'Suspendre' : 'Suspend'}
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteShop(userShop.ownerId)}
                                className="h-8 px-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold cursor-pointer ml-auto"
                              >
                                {isFr ? 'Supprimer Boutique' : 'Delete Shop'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 text-xs font-semibold text-[var(--text-muted)] italic">
                            {isFr
                              ? 'ℹ️ Cet utilisateur n’a pas encore créé de boutique (rôle : ' +
                                u.role +
                                ').'
                              : 'ℹ️ This user has not created a shop yet (role: ' +
                                u.role +
                                ').'}
                          </div>
                        )}
                      </div>

                      {/* Section 3: Products Added by this Seller (Every product added, admin can see and approve) */}
                      <div className="p-4 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-[var(--accent-primary)]" />
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                              {isFr
                                ? `Produits Ajoutés par ce Vendeur (${userProducts.length})`
                                : `Products Added by this Seller (${userProducts.length})`}
                            </h4>
                          </div>

                          {pendingUserProducts.length > 0 && onApproveAllSellerProducts && (
                            <button
                              type="button"
                              onClick={() => onApproveAllSellerProducts(u.uid)}
                              className="h-8 px-3 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {isFr
                                  ? `Tout Approuver (${pendingUserProducts.length} en attente)`
                                  : `Approve All (${pendingUserProducts.length} pending)`}
                              </span>
                            </button>
                          )}
                        </div>

                        {userProducts.length === 0 ? (
                          <p className="text-xs font-bold text-[var(--text-muted)] py-2 italic">
                            {isFr
                              ? 'Aucun produit ajouté par cet utilisateur pour le moment.'
                              : 'No products listed by this user yet.'}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {userProducts.map((prod) => {
                              const isProdPending =
                                prod.approvalStatus === 'pending' ||
                                prod.isApproved === false;
                              return (
                                <div
                                  key={prod.id}
                                  className="p-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={prod.imageUrl}
                                      alt={prod.title}
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src =
                                          HERO_IMAGE_URL;
                                      }}
                                      className="w-12 h-12 rounded-lg object-cover bg-[var(--bg-canvas)] border border-[var(--border-hairline)] shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                                            isProdPending
                                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                              : 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                                          }`}
                                        >
                                          {isProdPending
                                            ? isFr
                                              ? '⏳ En Attente'
                                              : '⏳ Pending'
                                            : isFr
                                            ? '✓ Approuvé'
                                            : '✓ Approved'}
                                        </span>
                                        <span className="text-[10px] text-[var(--text-muted)]">
                                          Stock: {prod.stock ?? 15}
                                        </span>
                                      </div>
                                      <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                                        {prod.title}
                                      </p>
                                      <p className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]">
                                        {formatXaf(prod.priceXaf)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {isProdPending ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onApproveProduct?.(prod.id, true)
                                        }
                                        className="h-8 px-2.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                                        title="Approve product"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{isFr ? 'Approuver' : 'Approve'}</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onApproveProduct?.(prod.id, false)
                                        }
                                        className="h-8 px-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[11px] font-bold text-[var(--text-muted)] cursor-pointer"
                                        title="Set pending"
                                      >
                                        <Clock className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => onEditProduct(prod)}
                                      className="w-8 h-8 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] flex items-center justify-center cursor-pointer"
                                      title="Edit product"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteProduct(prod)}
                                      className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center justify-center cursor-pointer"
                                      title="Delete product"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Expand / Collapse Raw Metadata Toggle */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedUserId(isExpanded ? null : u.uid)
                          }
                          className="text-[11px] font-extrabold text-[var(--text-muted)] hover:text-[var(--accent-primary)] inline-flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isExpanded
                              ? isFr
                                ? 'Masquer les métadonnées détaillées'
                                : 'Hide full metadata'
                              : isFr
                              ? 'Afficher tous les détails techniques (JSON & Horodatage)'
                              : 'Show full technical metadata (JSON & Timestamps)'}
                          </span>
                        </button>

                        {isExpanded && (
                          <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[10px] overflow-x-auto max-h-48 border border-slate-700">
                            {JSON.stringify(
                              {
                                ...u,
                                shop: userShop,
                                productsCount: userProducts.length,
                                ordersCount: userCustomerOrders.length,
                              },
                              null,
                              2
                            )}
                          </pre>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 5: ALL MARKETPLACE ORDERS */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4">
          <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)]">
            {isFr
              ? `Toutes les Commandes de la Plateforme (${allOrders.length})`
              : `All Marketplace Orders & Commission Ledger (${allOrders.length})`}
          </h2>
          {allOrders.length === 0 ? (
            <p className="text-sm font-bold text-[var(--text-muted)] py-4">
              {isFr ? 'Aucune commande enregistrée.' : 'No orders placed yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              {allOrders.map((ord) => {
                const rate = ord.commissionPercent ?? settings.commissionPercent;
                const comm =
                  ord.adminCommissionXaf !== undefined
                    ? ord.adminCommissionXaf
                    : Math.round((ord.subtotalXaf * rate) / 100);
                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]">
                          #{ord.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-[11px] font-extrabold">
                          {ord.shopName}
                        </span>
                        <span className="text-xs font-extrabold text-[var(--text-primary)]">
                          {ord.customerName} ({ord.customerPhone})
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[var(--text-secondary)]">
                        {ord.itemsSummary}
                      </p>
                      <p className="text-xs font-mono-tabular font-extrabold text-[var(--accent-primary)]">
                        Total: {formatXaf(ord.totalXaf)} · Admin Commission ({rate}%):{' '}
                        {formatXaf(comm)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) =>
                          onUpdateOrderStatus(
                            ord.id,
                            e.target.value as OrderStatus,
                            ord.paymentStatus
                          )
                        }
                        className="h-9 px-3 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold"
                      >
                        <option value="placed">{isFr ? 'Reçue' : 'Placed'}</option>
                        <option value="confirmed">{isFr ? 'Confirmée' : 'Confirmed'}</option>
                        <option value="in_transit">{isFr ? 'En Livraison' : 'In Transit'}</option>
                        <option value="delivered">{isFr ? 'Livrée' : 'Delivered'}</option>
                        <option value="cancelled">{isFr ? 'Annulée' : 'Cancelled'}</option>
                      </select>

                      <select
                        value={ord.paymentStatus}
                        onChange={(e) =>
                          onUpdateOrderStatus(
                            ord.id,
                            ord.orderStatus,
                            e.target.value as PaymentStatus
                          )
                        }
                        className="h-9 px-3 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold"
                      >
                        <option value="paid">{isFr ? 'Payé' : 'Paid'}</option>
                        <option value="cod_pending">{isFr ? 'Cash à Percevoir' : 'COD Pending'}</option>
                        <option value="pending">{isFr ? 'En Attente' : 'Pending'}</option>
                        <option value="refunded">{isFr ? 'Remboursé' : 'Refunded'}</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PAYMENTS LEDGER & RECONCILIATION */}
      {activeTab === 'payments' && (
        <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-6">
          <div>
            <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)]">
              {isFr
                ? 'Contrôle des Paiements & Transactions en FCFA'
                : 'Marketplace Payments & Gateway Reconciliation (FCFA)'}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
              <p className="text-xs font-extrabold text-[var(--text-primary)]">
                MTN Mobile Money (*126#)
              </p>
              <p className="font-mono-tabular text-lg font-extrabold text-[var(--accent-primary)] mt-1">
                {formatXaf(mtnMomoTotalXaf)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
              <p className="text-xs font-extrabold text-[var(--text-primary)]">
                Orange Money (#150#)
              </p>
              <p className="font-mono-tabular text-lg font-extrabold text-[var(--accent-primary)] mt-1">
                {formatXaf(orangeMoneyTotalXaf)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
              <p className="text-xs font-extrabold text-[var(--text-primary)]">
                {isFr ? 'Carte Bancaire / Visa' : 'Bank / Visa Card'}
              </p>
              <p className="font-mono-tabular text-lg font-extrabold text-[var(--accent-primary)] mt-1">
                {formatXaf(cardTotalXaf)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
              <p className="text-xs font-extrabold text-[var(--text-primary)]">
                {isFr ? 'Cash à la Livraison' : 'Cash on Delivery (COD)'}
              </p>
              <p className="font-mono-tabular text-lg font-extrabold text-[var(--accent-primary)] mt-1">
                {formatXaf(codTotalXaf)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-extrabold">
            <span>
              {isFr ? 'Total Payé & Confirmé :' : 'Total Settled & Paid:'}{' '}
              <strong className="font-mono-tabular text-[var(--accent-primary)]">
                {formatXaf(paidRevenueXaf)}
              </strong>
            </span>
            <span>
              {isFr ? 'En Attente / Cash à Percevoir :' : 'Pending / COD Collection:'}{' '}
              <strong className="font-mono-tabular text-[var(--text-primary)]">
                {formatXaf(codPendingXaf)}
              </strong>
            </span>
            <span>
              {isFr
                ? `Commissions Admin (${settings.commissionPercent}%) :`
                : `Admin Commissions (${settings.commissionPercent}%):`}{' '}
              <strong className="font-mono-tabular text-[var(--accent-primary)]">
                {formatXaf(totalCommissionsXaf)}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* TAB 7: CATEGORIES GOVERNANCE */}
      {activeTab === 'categories' && (
        <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4">
          <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)]">
            {isFr
              ? 'Gestion des 6 Catégories du Marché Camerounais'
              : 'Cameroonian Marketplace Categories Control (6 Sectors)'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesList.map((cat) => {
              const catProducts = allProducts.filter((p) => p.category === cat).length;
              const catShops = allShops.filter((s) => s.category === cat).length;
              const isEnabled = settings.enabledCategories[cat] !== false;
              return (
                <div
                  key={cat}
                  className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[var(--text-primary)]">
                      {getCategoryLabel(cat)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-[var(--accent-primary)] text-white">
                      {isEnabled ? (isFr ? 'Active' : 'Enabled') : isFr ? 'Masquée' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs font-mono-tabular font-bold text-[var(--text-secondary)]">
                    {catShops} {isFr ? 'boutiques' : 'shops'} · {catProducts}{' '}
                    {isFr ? 'produits' : 'products'}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onSaveSettings({
                        ...settings,
                        enabledCategories: {
                          ...settings.enabledCategories,
                          [cat]: !isEnabled,
                        },
                      })
                    }
                    className="w-full h-9 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-xs font-extrabold cursor-pointer"
                  >
                    {isEnabled
                      ? isFr
                        ? 'Désactiver Catégorie'
                        : 'Disable Category'
                      : isFr
                      ? 'Activer Catégorie'
                      : 'Enable Category'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 8: REVIEWS & SUPPORT TICKETS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4">
            <h3 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Star className="w-5 h-5 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
              <span>
                {isFr
                  ? `Modération des Avis Clients (${allReviews.length})`
                  : `Customer Product Reviews Moderation (${allReviews.length})`}
              </span>
            </h3>
            {allReviews.length === 0 ? (
              <p className="text-xs font-bold text-[var(--text-muted)]">
                {isFr ? 'Aucun avis client publié.' : 'No customer reviews submitted yet.'}
              </p>
            ) : (
              <div className="space-y-3">
                {allReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-extrabold">
                        <span className="text-[var(--accent-primary)]">★ {rev.rating}/5</span>
                        <span className="text-[var(--text-primary)]">{rev.authorName}</span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">
                        {summarizeText(rev.comment, 90)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteReview(rev.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4">
            <h3 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>
                {isFr
                  ? `Réclamations & Tickets Support (${allTickets.length})`
                  : `Support Tickets & Complaints (${allTickets.length})`}
              </span>
            </h3>
            {allTickets.length === 0 ? (
              <p className="text-xs font-bold text-[var(--text-muted)]">
                {isFr ? 'Aucune réclamation ouverte.' : 'No support complaints submitted.'}
              </p>
            ) : (
              <div className="space-y-3">
                {allTickets.map((tk) => (
                  <div
                    key={tk.id}
                    className="p-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[var(--text-primary)]">
                        {tk.subject}
                      </span>
                      <span className="text-[11px] font-extrabold text-[var(--accent-primary)] uppercase">
                        {tk.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">
                      {summarizeText(tk.message, 90)}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-[var(--text-muted)]">
                        {tk.userName} ({tk.userEmail})
                      </span>
                      {tk.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => onResolveTicket(tk.id)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)] text-white text-[11px] font-extrabold cursor-pointer"
                        >
                          {isFr ? 'Marquer Résolu' : 'Mark Resolved'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: PLATFORM SETTINGS & CONFIGURATION */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
            <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>
                {isFr
                  ? 'Paramètres Globaux de SWMARKETPLACE'
                  : 'SWMARKETPLACE Platform Settings & Policies'}
              </span>
            </h2>
            {settingsSaved && (
              <span className="text-xs font-extrabold text-[var(--accent-primary)]">
                ✓ {isFr ? 'Paramètres enregistrés !' : 'Marketplace settings saved!'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                {isFr ? 'Commission Plateforme (%)' : 'Platform Commission (%)'}
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={settings.commissionPercent}
                onChange={(e) =>
                  onSaveSettings({
                    ...settings,
                    commissionPercent: Number(e.target.value),
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                {isFr ? 'Livraison Express Ville (FCFA)' : 'Local Express Delivery (FCFA)'}
              </label>
              <input
                type="number"
                min={0}
                value={settings.localDeliveryFeeXaf}
                onChange={(e) =>
                  onSaveSettings({
                    ...settings,
                    localDeliveryFeeXaf: Number(e.target.value),
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                {isFr ? 'Expédition Interurbaine (FCFA)' : 'Inter-City Bus Fee (FCFA)'}
              </label>
              <input
                type="number"
                min={0}
                value={settings.intercityBusFeeXaf}
                onChange={(e) =>
                  onSaveSettings({
                    ...settings,
                    intercityBusFeeXaf: Number(e.target.value),
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                {isFr ? 'WhatsApp Support Officiel' : 'Support WhatsApp (+237)'}
              </label>
              <input
                type="text"
                value={settings.supportWhatsApp}
                onChange={(e) =>
                  onSaveSettings({
                    ...settings,
                    supportWhatsApp: e.target.value,
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[
              {
                key: 'mtnMomoActive' as const,
                label: 'MTN Mobile Money (*126#)',
              },
              {
                key: 'orangeMoneyActive' as const,
                label: 'Orange Money (#150#)',
              },
              {
                key: 'cardPaymentsActive' as const,
                label: isFr ? 'Carte Visa / Mastercard' : 'Bank / Visa Card',
              },
              {
                key: 'cashOnDeliveryActive' as const,
                label: isFr ? 'Paiement à la Livraison' : 'Cash on Delivery (COD)',
              },
            ].map((gw) => (
              <label
                key={gw.key}
                className="p-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-between gap-2 text-xs font-extrabold cursor-pointer"
              >
                <span>{gw.label}</span>
                <input
                  type="checkbox"
                  checked={settings[gw.key]}
                  onChange={(e) =>
                    onSaveSettings({
                      ...settings,
                      [gw.key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-[var(--accent-primary)]"
                />
              </label>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSettingsSaved(true);
                setTimeout(() => setSettingsSaved(false), 3000);
              }}
              className="h-10 px-5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold cursor-pointer"
            >
              {isFr ? 'Enregistrer la Configuration' : 'Save Platform Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Support, Contact, FAQ & Security Guarantees View
 */
export function SupportAndSecurityView({
  lang,
  onSubmitTicket,
}: {
  lang: Language;
  onSubmitTicket: (
    subject: string,
    message: string,
    contactEmail: string,
    name: string
  ) => Promise<void>;
}) {
  const t = TRANSLATIONS[lang];
  const isFr = lang === 'fr';
  const faqs = FAQ_ITEMS[lang];

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmitTicket(subject, message, contact, name);
    setSubmitting(false);
    setSent(true);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-10">
      <div className="border-b-2 border-[var(--border-hairline)] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[var(--text-primary)]">
            {t.supportHeading}
          </h1>
          <p className="text-sm font-bold text-[var(--text-secondary)] mt-1">
            {t.supportSubheading}
          </p>
        </div>
        <a
          href={buildWhatsAppUrl(
            '237696751829',
            isFr
              ? 'Bonjour Support SWMARKETPLACE, j’ai besoin d’assistance.'
              : 'Hello SWMARKETPLACE Support, I need assistance with my order.'
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 px-5 rounded-xl bg-[var(--whatsapp-brand)] text-white text-xs font-extrabold inline-flex items-center gap-2 shadow-sm self-start"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{isFr ? 'Support Direct WhatsApp (696751829)' : 'WhatsApp Support Desk (696751829)'}</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact & Complaint Ticket Form */}
        <form
          onSubmit={handleSend}
          className="lg:col-span-5 p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4 self-start"
        >
          <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Send className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>{t.contactFormTitle}</span>
          </h2>

          <div className="space-y-1">
            <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
              {t.authNameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
              {t.authEmailLabel} / WhatsApp (+237)
            </label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
              {t.ticketSubjectLabel}
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
              {t.ticketMessageLabel}
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-semibold"
            />
          </div>

          {sent && (
            <p className="text-xs font-extrabold text-[var(--accent-primary)]">
              ✓{' '}
              {isFr
                ? 'Votre ticket a été transmis à l’équipe support et enregistré.'
                : 'Your support ticket has been recorded and sent to our team.'}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors"
          >
            {submitting ? t.savingBtn : t.submitTicketBtn}
          </button>
        </form>

        {/* FAQ & Security Pillars */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border-2 border-[var(--border-hairline)] bg-[var(--bg-elevated)] space-y-4">
            <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>{t.faqSectionTitle}</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/70 space-y-1.5"
                >
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                    {item.q}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Protection Guarantees */}
          <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-4">
            <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>{t.securityBannerTitle}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-1">
                <p className="font-extrabold text-[var(--accent-primary)]">
                  1. HTTPS & Auth
                </p>
                <p className="font-semibold text-[var(--text-secondary)]">
                  {isFr
                    ? 'Comptes et données protégés.'
                    : 'Encrypted accounts & data privacy.'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-1">
                <p className="font-extrabold text-[var(--accent-primary)]">
                  2. {isFr ? 'Paiements' : 'Payments'}
                </p>
                <p className="font-semibold text-[var(--text-secondary)]">
                  {isFr
                    ? 'MTN MoMo, Orange Money, Carte & Cash.'
                    : 'MTN MoMo, Orange Money, Card & COD.'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-1">
                <p className="font-extrabold text-[var(--accent-primary)]">
                  3. {isFr ? 'Vendeurs Vérifiés' : 'Verified Sellers'}
                </p>
                <p className="font-semibold text-[var(--text-secondary)]">
                  {isFr
                    ? 'Boutiques validées par l’Admin.'
                    : 'Every shop vetted by Admin.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
