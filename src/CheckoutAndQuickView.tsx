import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Banknote,
  Truck,
  MessageCircle,
  Share2,
  Star,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import {
  Language,
  ProductItem,
  ProductReview,
  CartItem,
  OrderRecord,
  DeliveryMethod,
  PaymentMethod,
  AppNotification,
  CAMEROON_CITIES,
  DELIVERY_FEES_XAF,
  TRANSLATIONS,
  formatXaf,
  buildWhatsAppUrl,
  buildWhatsAppShareUrl,
  summarizeText,
  HERO_IMAGE_URL,
} from './marketplaceData';

/**
 * 6 & 8. Checkout & Delivery Modal
 * Supports MTN Mobile Money, Orange Money, Bank/Card, and Cash on Delivery
 * with instant Order Confirmation and Tracking Number.
 */
export function CheckoutModal({
  lang,
  cart,
  defaultName,
  defaultPhone,
  defaultCity,
  defaultAddress,
  onClose,
  onPlaceOrder,
  onGoToAccount,
}: {
  lang: Language;
  cart: CartItem[];
  defaultName: string;
  defaultPhone: string;
  defaultCity: string;
  defaultAddress: string;
  onClose: () => void;
  onPlaceOrder: (details: {
    customerName: string;
    customerPhone: string;
    deliveryCity: string;
    deliveryAddress: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
  }) => Promise<OrderRecord[]>;
  onGoToAccount: () => void;
}) {
  const t = TRANSLATIONS[lang];
  const isFr = lang === 'fr';

  const [customerName, setCustomerName] = useState(defaultName || '');
  const [customerPhone, setCustomerPhone] = useState(defaultPhone || '237696751829');
  const [deliveryCity, setDeliveryCity] = useState(defaultCity || 'Douala');
  const [deliveryAddress, setDeliveryAddress] = useState(defaultAddress || '');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('local_express');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrders, setConfirmedOrders] = useState<OrderRecord[] | null>(null);

  const subtotalXaf = cart.reduce(
    (sum, item) => sum + item.product.priceXaf * item.quantity,
    0
  );
  const deliveryFeeXaf = DELIVERY_FEES_XAF[deliveryMethod];
  const totalXaf = subtotalXaf + deliveryFeeXaf;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await onPlaceOrder({
        customerName: customerName.trim() || 'Client SWMARKETPLACE',
        customerPhone: customerPhone.trim() || '237696751829',
        deliveryCity,
        deliveryAddress: deliveryAddress.trim() || deliveryCity,
        deliveryMethod,
        paymentMethod,
      });
      setConfirmedOrders(created);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.checkoutModalTitle}
    >
      <div className="bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[var(--border-hairline)] pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[var(--accent-primary)]" />
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
              {confirmedOrders ? t.orderConfirmedTitle : t.checkoutModalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-[var(--border-hairline)] flex items-center justify-center hover:bg-[var(--bg-surface)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmedOrders ? (
          <div className="space-y-6 text-center py-4">
            <CheckCircle2 className="w-14 h-14 text-[var(--accent-primary)] mx-auto" />
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-extrabold text-[var(--text-primary)]">
                {t.orderConfirmedTitle}
              </h3>
              <p className="text-sm font-bold text-[var(--text-secondary)]">
                {t.orderConfirmedDesc}
              </p>
            </div>

            <div className="space-y-3 text-left">
              {confirmedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tabular text-sm font-extrabold text-[var(--accent-warm)]">
                      {isFr ? 'Code de Suivi :' : 'Tracking Code:'} #{ord.orderNumber}
                    </span>
                    <span className="font-mono-tabular text-sm font-extrabold text-[var(--accent-primary)]">
                      {formatXaf(ord.totalXaf)}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-[var(--text-primary)]">
                    {ord.shopName} → {ord.deliveryCity} ({ord.deliveryAddress})
                  </p>
                  <p className="text-xs font-bold text-[var(--text-secondary)] whitespace-pre-line">
                    {ord.itemsSummary}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToAccount();
                }}
                className="h-11 px-6 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold hover:bg-[var(--accent-primary-hover)]"
              >
                {isFr ? 'Suivre ma Commande (Mon Compte)' : 'Track Order in My Account'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-5 rounded-xl border-2 border-[var(--border-strong)] text-xs font-extrabold"
              >
                {isFr ? 'Continuer mes Achats' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                  {t.checkoutCustomerName}
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ex: Chantal Ngo Biyong"
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                  {t.checkoutPhone}
                </label>
                <input
                  type="tel"
                  required
                  minLength={8}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="237696751829"
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                  {t.checkoutCity}
                </label>
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                >
                  {CAMEROON_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                  {t.checkoutAddress}
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={
                    isFr
                      ? 'ex: Akwa Boulevard de la Liberté, face pharmacie...'
                      : 'e.g. Bastos Yaoundé, near Total station...'
                  }
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                />
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                {t.checkoutDeliveryMethod}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    { id: 'local_express', label: t.deliveryLocalExpress },
                    { id: 'intercity_bus', label: t.deliveryIntercityBus },
                    { id: 'shop_pickup', label: t.deliveryShopPickup },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDeliveryMethod(d.id)}
                    className={`p-3 rounded-xl border-2 text-left text-xs font-extrabold flex items-center justify-between transition-colors ${
                      deliveryMethod === d.id
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span>{d.label}</span>
                    </span>
                    <span className="font-mono-tabular text-[var(--accent-warm)]">
                      {formatXaf(DELIVERY_FEES_XAF[d.id])}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection (Cameroon) */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                {t.checkoutPaymentMethod}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mtn_momo')}
                  className={`p-3.5 rounded-xl border-2 text-left text-xs font-extrabold flex items-center gap-2.5 transition-colors ${
                    paymentMethod === 'mtn_momo'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>{t.payMtnMomo}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('orange_money')}
                  className={`p-3.5 rounded-xl border-2 text-left text-xs font-extrabold flex items-center gap-2.5 transition-colors ${
                    paymentMethod === 'orange_money'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>{t.payOrangeMoney}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_card')}
                  className={`p-3.5 rounded-xl border-2 text-left text-xs font-extrabold flex items-center gap-2.5 transition-colors ${
                    paymentMethod === 'bank_card'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>{t.payBankCard}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`p-3.5 rounded-xl border-2 text-left text-xs font-extrabold flex items-center gap-2.5 transition-colors ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-[var(--accent-warm)] shrink-0" />
                  <span>{t.payCashOnDelivery}</span>
                </button>
              </div>
            </div>

            {/* Order Totals Summary in FCFA */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--border-strong)] space-y-2 text-xs font-extrabold">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>{t.cartSubtotal}</span>
                <span className="font-mono-tabular">{formatXaf(subtotalXaf)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>{t.cartDeliveryFee}</span>
                <span className="font-mono-tabular">{formatXaf(deliveryFeeXaf)}</span>
              </div>
              <div className="flex justify-between text-base text-[var(--accent-primary)] pt-2 border-t border-[var(--border-hairline)]">
                <span>{t.cartTotalAmount}</span>
                <span className="font-mono-tabular">{formatXaf(totalXaf)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-extrabold transition-colors shadow-md cursor-pointer"
            >
              {submitting
                ? t.placingOrderBtn
                : `${t.placeOrderBtn} — ${formatXaf(totalXaf)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * 3 & 9. Product Quick View Modal with Stock, Seller Verification,
 * WhatsApp Share, and Customer Reviews & Ratings
 */
export function ProductQuickViewModal({
  lang,
  product,
  reviews,
  categoryLabel,
  canReview,
  onClose,
  onAddToCart,
  onSubmitReview,
}: {
  lang: Language;
  product: ProductItem;
  reviews: ProductReview[];
  categoryLabel: string;
  canReview: boolean;
  onClose: () => void;
  onAddToCart: (p: ProductItem) => void;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
}) {
  const t = TRANSLATIONS[lang];
  const isFr = lang === 'fr';

  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const displayTitle = lang === 'fr' && product.titleFr ? product.titleFr : product.title;
  const displayDesc =
    lang === 'fr' && product.descriptionFr ? product.descriptionFr : product.description;
  const stockCount = product.stock ?? 15;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentInput.trim().length < 3) return;
    setSubmittingReview(true);
    await onSubmitReview(ratingInput, commentInput.trim());
    setCommentInput('');
    setSubmittingReview(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={displayTitle}
    >
      <div className="bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 bg-[var(--bg-surface)] flex flex-col">
          <img
            src={product.imageUrl}
            alt={displayTitle}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = HERO_IMAGE_URL;
            }}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="p-5 space-y-3 border-t border-[var(--border-hairline)]">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-[var(--accent-primary)]">
                ★ {avgRating} ({reviews.length} {isFr ? 'avis' : 'reviews'})
              </span>
              <span className="text-[var(--accent-warm)]">
                {stockCount > 0
                  ? `${stockCount} ${t.inStockLabel}`
                  : t.outOfStockLabel}
              </span>
            </div>

            <button
              type="button"
              disabled={stockCount <= 0}
              onClick={() => onAddToCart(product)}
              className="w-full h-11 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {t.addToCart} — {formatXaf(product.priceXaf)}
            </button>

            <a
              href={buildWhatsAppUrl(
                product.whatsappNumber,
                t.whatsappSinglePrefill(
                  displayTitle,
                  formatXaf(product.priceXaf),
                  product.shopName
                )
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-10 rounded-xl bg-[var(--whatsapp-brand)] text-white text-xs font-extrabold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.contactWhatsApp}</span>
            </a>

            <a
              href={buildWhatsAppShareUrl(
                t.whatsappShareProduct(
                  displayTitle,
                  formatXaf(product.priceXaf),
                  product.shopName,
                  `${window.location.origin}${window.location.pathname}?product=${encodeURIComponent(
                    product.id
                  )}`
                )
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.shareOnWhatsApp}
              className="w-full h-10 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-canvas)] text-[var(--text-primary)] text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>{t.shareOnWhatsApp}</span>
            </a>
          </div>
        </div>

        <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--accent-warm)] uppercase tracking-wider">
                {categoryLabel} · {product.shopCity}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close product preview"
                className="h-8 w-8 rounded-lg border border-[var(--border-hairline)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="font-display text-2xl font-extrabold text-[var(--text-primary)]">
              {displayTitle}
            </h2>

            <div className="flex items-baseline gap-3">
              <span className="font-mono-tabular text-2xl font-extrabold text-[var(--accent-primary)]">
                {formatXaf(product.priceXaf)}
              </span>
              {product.originalPriceXaf && product.originalPriceXaf > product.priceXaf && (
                <span className="font-mono-tabular text-sm font-bold text-[var(--text-muted)] line-through">
                  {formatXaf(product.originalPriceXaf)}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
              {summarizeText(displayDesc, 110)}
            </p>

            <p className="text-xs font-extrabold text-[var(--text-primary)] pt-1">
              {t.cartVendorGroupNote}: {product.shopName} (+
              {product.whatsappNumber.replace(/^\+/, '')})
            </p>
          </div>

          {/* 9. Customer Reviews & Ratings */}
          <div className="pt-4 border-t-2 border-[var(--border-hairline)] space-y-4">
            <h3 className="font-display text-base font-extrabold text-[var(--text-primary)]">
              {t.reviewsSectionTitle} ({reviews.length})
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/70 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-[var(--text-primary)]">{rev.authorName}</span>
                    <span className="text-[var(--accent-warm)]">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(Math.max(0, 5 - rev.rating))}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    {summarizeText(rev.comment, 90)}
                  </p>
                </div>
              ))}
            </div>

            {canReview ? (
              <form onSubmit={handleReviewSubmit} className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)]">
                    {t.writeReviewTitle}
                  </label>
                  <select
                    value={ratingInput}
                    onChange={(e) => setRatingInput(Number(e.target.value))}
                    className="h-8 px-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold text-[var(--accent-warm)]"
                  >
                    <option value={5}>★★★★★ (5/5)</option>
                    <option value={4}>★★★★☆ (4/5)</option>
                    <option value={3}>★★★☆☆ (3/5)</option>
                    <option value={2}>★★☆☆☆ (2/5)</option>
                    <option value={1}>★☆☆☆☆ (1/5)</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  required
                  minLength={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={t.reviewCommentPlaceholder}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-semibold"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold"
                >
                  {t.submitReviewBtn}
                </button>
              </form>
            ) : (
              <p className="text-xs font-bold text-[var(--text-muted)]">
                {isFr
                  ? 'Connectez-vous pour publier une note et un avis client.'
                  : 'Sign in to rate this product and review the seller.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
