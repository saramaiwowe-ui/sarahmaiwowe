import heroModernImg from './assets/images/hero_modern_cameroon_marketplace_1791366436110.jpg';
import modernFashionImg from './assets/images/modern_fashion_sneakers_bag_suit_1791366448822.jpg';
import modernGroceryImg from './assets/images/modern_grocery_supermarket_provisions_1791366465409.jpg';
import modernAppliancesImg from './assets/images/modern_home_appliances_blender_airfryer_1791366476937.jpg';
import modernDecorArtImg from './assets/images/modern_contemporary_decor_art_1791366488638.jpg';
import electronicsHubImg from './assets/images/electronics_hub_phones_tech_1791365205610.jpg';
import cameroonBeautyImg from './assets/images/cameroon_beauty_shea_cosmetics_1791365218317.jpg';
import afristudeFashionImg from './assets/images/afristude_fashion_studio_bag_shoes_1791365133472.jpg';
import penjaPepperImg from './assets/images/product_penja_white_pepper_1791283877490.jpg';
import okuHoneyImg from './assets/images/product_oku_white_honey_1791283887691.jpg';
import bafoussamCoffeeImg from './assets/images/product_bafoussam_coffee_beans_1791283898510.jpg';

export type Language = 'en' | 'fr';
export type UserRole = 'customer' | 'shop_owner' | 'admin';
export type ProductCategory =
  | 'gourmet'
  | 'fashion'
  | 'beauty'
  | 'electronics'
  | 'household'
  | 'crafts';
export type CurrencyCode = 'XAF' | 'EUR' | 'USD' | 'NGN';
export type DeliveryMethod = 'local_express' | 'intercity_bus' | 'shop_pickup';
export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'bank_card' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'cod_pending' | 'refunded';
export type OrderStatus = 'placed' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
export type SellerApprovalStatus = 'pending' | 'approved' | 'suspended' | 'banned';
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'vip';
export type PromotionPackageId = 'spotlight_7d' | 'category_14d' | 'gold_banner_30d';

export interface SubscriptionPlanConfig {
  id: SubscriptionTier;
  nameEn: string;
  nameFr: string;
  periodEn: string;
  periodFr: string;
  priceXaf: number;
}

export interface PromotionPackageConfig {
  id: PromotionPackageId;
  nameEn: string;
  nameFr: string;
  days: number;
  priceXaf: number;
}

export interface RevenueTransaction {
  id: string;
  type: 'commission' | 'subscription' | 'promotion';
  shopId: string;
  shopName: string;
  sellerId?: string;
  description: string;
  grossAmountXaf: number;
  adminEarnedXaf: number;
  paymentMethod?: string;
  createdAt: string;
}

export const ADMIN_UID = 't4KRW1Yip1PRxx1AOK7VHmafaoY2';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  sellerStatus?: SellerApprovalStatus;
  accountStatus?: SellerApprovalStatus;
  phone?: string;
  defaultAddress?: string;
  defaultCity?: string;
  hasShop?: boolean;
  shopName?: string;
  shopCity?: string;
  shopWhatsapp?: string;
  favoriteProductIds?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ShopProfile {
  ownerId: string;
  shopName: string;
  city: string;
  whatsappNumber: string;
  bio: string;
  category?: ProductCategory;
  isVerified?: boolean;
  status?: SellerApprovalStatus;
  subscriptionTier?: SubscriptionTier;
  subscriptionPriceXaf?: number;
  subscriptionUpdatedAt?: string;
  isPublic: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProductItem {
  id: string;
  title: string;
  titleFr?: string;
  description: string;
  descriptionFr?: string;
  priceXaf: number;
  originalPriceXaf?: number;
  stock?: number;
  isFeatured?: boolean;
  isPromoted?: boolean;
  isApproved?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  promotionPackageId?: PromotionPackageId;
  promotionPackageName?: string;
  promotionFeeXaf?: number;
  promoBadge?: string;
  category: ProductCategory;
  imageUrl: string;
  shopId: string;
  shopName: string;
  shopCity: string;
  whatsappNumber: string;
  ownerId: string;
  isPublic: boolean;
  isSeeded?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shopId: string;
  shopName: string;
  itemsSummary: string;
  subtotalXaf: number;
  deliveryFeeXaf: number;
  totalXaf: number;
  commissionPercent?: number;
  adminCommissionXaf?: number;
  sellerNetPayoutXaf?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProductReview {
  id: string;
  productId: string;
  shopId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  isPublic: boolean;
  createdAt?: unknown;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface CityCoordinates {
  lat: number;
  lon: number;
  regionEn: string;
  regionFr: string;
}

export const HERO_IMAGE_URL = heroModernImg;

export const CAMEROON_CITIES = [
  'Douala',
  'Yaoundé',
  'Bamenda',
  'Bafoussam',
  'Buea',
  'Garoua',
  'Kribi',
  'Limbe',
  'Foumban',
  'Ngaoundéré',
];

export const CAMEROON_CITY_COORDS: Record<string, CityCoordinates> = {
  Douala: { lat: 4.0511, lon: 9.7679, regionEn: 'Littoral', regionFr: 'Littoral' },
  'Yaoundé': { lat: 3.848, lon: 11.5021, regionEn: 'Centre', regionFr: 'Centre' },
  Bamenda: { lat: 5.9631, lon: 10.1591, regionEn: 'North-West', regionFr: 'Nord-Ouest' },
  Bafoussam: { lat: 5.4778, lon: 10.4176, regionEn: 'West', regionFr: 'Ouest' },
  Buea: { lat: 4.156, lon: 9.232, regionEn: 'South-West', regionFr: 'Sud-Ouest' },
  Garoua: { lat: 9.3014, lon: 13.3977, regionEn: 'North', regionFr: 'Nord' },
  Kribi: { lat: 2.9373, lon: 9.9077, regionEn: 'South', regionFr: 'Sud' },
  Limbe: { lat: 4.0242, lon: 9.2149, regionEn: 'South-West', regionFr: 'Sud-Ouest' },
  Foumban: { lat: 5.7266, lon: 10.8987, regionEn: 'West', regionFr: 'Ouest' },
  'Ngaoundéré': { lat: 7.3277, lon: 13.5847, regionEn: 'Adamawa', regionFr: 'Adamaoua' },
};

export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  XAF: 1,
  EUR: 0.001524,
  USD: 0.00165,
  NGN: 2.65,
};

export const DELIVERY_FEES_XAF: Record<DeliveryMethod, number> = {
  local_express: 1500,
  intercity_bus: 3000,
  shop_pickup: 0,
};

export const DEFAULT_MARKETPLACE_WHATSAPP = '237696751829';

export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    id: 'basic',
    nameEn: 'Basic Boutique Plan',
    nameFr: 'Forfait Boutique Essentiel',
    periodEn: 'Monthly',
    periodFr: 'Mensuel',
    priceXaf: 5000,
  },
  {
    id: 'pro',
    nameEn: 'Pro Verified Seller Plan',
    nameFr: 'Forfait Vendeur Pro Vérifié',
    periodEn: 'Monthly',
    periodFr: 'Mensuel',
    priceXaf: 15000,
  },
  {
    id: 'vip',
    nameEn: 'VIP Gold Enterprise Plan',
    nameFr: 'Forfait VIP Or Entreprise',
    periodEn: 'Annual',
    periodFr: 'Annuel',
    priceXaf: 50000,
  },
];

export const DEFAULT_PROMOTION_PACKAGES: PromotionPackageConfig[] = [
  {
    id: 'spotlight_7d',
    nameEn: '7-Day Featured Spotlight',
    nameFr: 'Mise en Avant Vedette (7 Jours)',
    days: 7,
    priceXaf: 2500,
  },
  {
    id: 'category_14d',
    nameEn: '14-Day Category Boost',
    nameFr: 'Boost Catégorie (14 Jours)',
    days: 14,
    priceXaf: 5000,
  },
  {
    id: 'gold_banner_30d',
    nameEn: '30-Day Gold Homepage Promotion',
    nameFr: 'Promotion Or Accueil (30 Jours)',
    days: 30,
    priceXaf: 10000,
  },
];

// Base real Admin account for SWMARKETPLACE (No demo fake users)
export const SEED_USERS: UserAccount[] = [
  {
    uid: ADMIN_UID,
    email: 'saramaiwowe@gmail.com',
    displayName: 'Sarah Maiwowe (Admin SWMARKETPLACE)',
    role: 'admin',
    sellerStatus: 'approved',
    accountStatus: 'approved',
    phone: '+237 696 751 829',
    defaultCity: 'Douala',
    defaultAddress: 'Bonanjo, Rue Joss Plateau',
    createdAt: '2026-03-01T08:00:00Z',
  },
];

// All demo/seed data removed — strictly real user-created shops, products, and reviews
export const SEED_SHOPS: ShopProfile[] = [];
export const SEED_PRODUCTS: ProductItem[] = [];
export const SEED_REVIEWS: ProductReview[] = [];

export const PRESET_PRODUCT_IMAGES = [
  { labelEn: 'Modern Fashion, Shoes & Bag', labelFr: 'Mode, Chaussures & Sac', url: modernFashionImg },
  { labelEn: 'Supermarket & Grocery Pack', labelFr: 'Supermarché & Provisions', url: modernGroceryImg },
  { labelEn: 'Air Fryer & Home Appliances', labelFr: 'Électroménager & Cuisine', url: modernAppliancesImg },
  { labelEn: 'Modern Decor & Canvas Art', labelFr: 'Déco Moderne & Art', url: modernDecorArtImg },
  { labelEn: '5G Phones & Smart Tech', labelFr: 'Smartphones 5G & Tech', url: electronicsHubImg },
  { labelEn: 'Skincare Serums & Cosmetics', labelFr: 'Sérums & Cosmétiques', url: cameroonBeautyImg },
  { labelEn: 'Designer Bags & Footwear', labelFr: 'Sacs & Chaussures Design', url: afristudeFashionImg },
  { labelEn: 'Barista Espresso Coffee', labelFr: 'Café Expresso Barista', url: bafoussamCoffeeImg },
  { labelEn: 'Organic Pure Honey Jar', labelFr: 'Pot de Miel Bio Pur', url: okuHoneyImg },
  { labelEn: 'Modern Retail Showcase', labelFr: 'Vitrine Moderne', url: heroModernImg },
];

export const FAQ_ITEMS = {
  en: [
    {
      q: 'How do payments work?',
      a: 'Pay via MTN MoMo (*126#), Orange Money (#150#), Bank Card, or Cash on Delivery.',
    },
    {
      q: 'What categories are available?',
      a: '6 sectors: Groceries, Fashion, Beauty, Electronics, Home Appliances, and Decor.',
    },
    {
      q: 'How do seller fees & promotions work?',
      a: 'Sellers pay a fixed commission per sale and can subscribe or promote items for top visibility.',
    },
    {
      q: 'Can I track orders and message sellers?',
      a: 'Yes. Track orders live in your account or chat directly with sellers via WhatsApp.',
    },
  ],
  fr: [
    {
      q: 'Comment fonctionnent les paiements ?',
      a: 'Payez par MTN MoMo (*126#), Orange Money (#150#), Carte Bancaire ou Cash à la livraison.',
    },
    {
      q: 'Quelles catégories sont disponibles ?',
      a: '6 secteurs : Supermarché, Mode, Beauté, Électronique, Électroménager et Déco.',
    },
    {
      q: 'Comment fonctionnent les commissions et promotions ?',
      a: 'Commission fixe par vente, avec abonnements et boosts optionnels pour les vendeurs.',
    },
    {
      q: 'Puis-je suivre ma commande et contacter le vendeur ?',
      a: 'Oui. Suivez vos commandes dans votre compte ou écrivez au vendeur sur WhatsApp.',
    },
  ],
};

export const TRANSLATIONS = {
  en: {
    brandName: 'SWMARKETPLACE',
    navCatalog: 'Catalog',
    navBoutiques: 'Shops',
    navAccount: 'Account',
    navSellerHub: 'Seller Hub',
    navSupport: 'Support',
    langSwitchLabel: 'FR',
    langSwitchAria: 'Switch to French',
    themeLightAria: 'Light mode',
    themeDarkAria: 'Dark mode',
    signInBtn: 'Sign In',
    signOutBtn: 'Sign Out',
    cartBtn: 'Cart',
    shopNowBtn: 'Shop Now',
    heroKicker: 'SWMARKETPLACE · Cameroon · 100% FCFA',
    heroTitle: 'Cameroon’s marketplace for fashion, beauty, tech, home & groceries.',
    heroAnimatedWords: [
      'Fashion & Bags',
      'Beauty & Skincare',
      '5G Phones & Tech',
      'Home & Decor',
      'Groceries',
    ],
    heroSubtitle:
      'Shop verified Cameroonian boutiques in FCFA with fast delivery and Mobile Money.',
    heroPrimaryCta: 'Shop Now',
    heroSecondaryCta: 'View Shops',
    heroTrustNote: 'Verified Sellers · MTN MoMo & Orange Money · Fast Delivery',
    promoBannerKicker: 'Verified Shops & Featured Deals',
    promoBannerTitle: 'Fashion · Beauty · Electronics · Home',
    promoBannerDesc: 'Authentic products from verified local shops.',
    featuredSectionTitle: 'Featured Products',
    popularShopsTitle: 'Verified Shops',
    liveApiSectionTitle: 'Market Pulse',
    liveCurrencyLabel: 'Currency (FCFA)',
    liveWeatherHubLabel: 'Cameroon Hubs',
    searchPlaceholder: 'Search products, categories, or shops...',
    menuSearchPlaceholder: 'Search products (FCFA)...',
    filterAllCities: 'All Cities',
    filterAllSellers: 'All Sellers',
    filterMaxPriceLabel: 'Max Price',
    filterInStockOnly: 'In Stock',
    filterMinRating: 'Min Rating',
    catAll: 'All Categories',
    catGourmet: '1. Groceries & Spices',
    catFashion: '2. Fashion & Bags',
    catBeauty: '3. Beauty & Skincare',
    catElectronics: '4. Phones & Tech',
    catHousehold: '5. Home Appliances',
    catCrafts: '6. Decor & Art',
    catalogHeading: 'Product Catalog',
    catalogCountSuffix: 'items',
    inStockLabel: 'in stock',
    outOfStockLabel: 'Out of Stock',
    verifiedSellerLabel: 'Verified',
    pendingSellerLabel: 'Pending',
    addToCart: 'Add to Cart',
    addedToCart: 'Added',
    contactWhatsApp: 'WhatsApp',
    shareOnWhatsApp: 'Share',
    viewDetails: 'Quick View',
    boutiquesHeading: 'Verified Shops',
    boutiquesSubtitle: 'Browse verified boutiques by sector or open your own shop.',
    shopClassificationLabel: '6 Retail Sectors',
    allShopCategories: 'All Sectors',
    productsCountLabel: 'items',
    chatWithShop: 'WhatsApp Shop',
    filterByShop: 'View Products',
    showingShopFilter: 'Seller:',
    clearFilter: 'Reset',
    accountHeading: 'My Account',
    accountSubheading: 'Manage your profile, delivery address, orders, and favorites.',
    profileCardTitle: 'Profile & Delivery Address',
    saveProfileBtn: 'Save Profile',
    savedAddressLabel: 'Delivery Address',
    savedPhoneLabel: 'Phone (+237)',
    favoritesTabTitle: 'Saved Favorites',
    noFavoritesYet: 'No favorites saved yet.',
    orderHistoryTitle: 'Orders & Live Tracking',
    trackOrderLookupLabel: 'Track by code (KM-...)',
    noOrdersYet: 'No orders yet.',
    dashboardHeading: 'Seller & Admin Hub',
    dashboardSubheading: 'Manage products, stock, orders, and earnings in FCFA.',
    shopProfileCardTitle: 'Shop Profile',
    shopNameLabel: 'Shop Name',
    shopNamePlaceholder: 'e.g. Sunshine Boutique',
    shopCategoryLabel: 'Sector',
    shopCityLabel: 'City',
    shopWhatsappLabel: 'WhatsApp (+237)',
    shopWhatsappPlaceholder: '237696751829',
    shopWhatsappHint: 'Format: 237 + 9 digits.',
    shopBioLabel: 'Short Bio',
    shopBioPlaceholder: 'Brief summary of your shop and delivery...',
    saveShopBtn: 'Save Shop',
    savingBtn: 'Saving...',
    shopSavedNotice: 'Shop profile saved.',
    addProductCardTitle: 'Add Product & Stock',
    editProductModeTitle: 'Edit Product & Stock',
    prodTitleLabel: 'Product Title',
    prodTitlePlaceholder: 'e.g. Gold Handbag',
    prodPriceLabel: 'Price (FCFA)',
    prodOrigPriceLabel: 'Old Price (Optional)',
    prodStockLabel: 'Stock Qty',
    prodPricePlaceholder: '25000',
    prodCategoryLabel: 'Category',
    prodPromoBadgeLabel: 'Promo Tag (Optional)',
    prodImageUrlLabel: 'Product Photo',
    prodImageUrlPlaceholder: 'Upload photo below',
    prodImageUploadBtn: 'Upload Photo',
    prodDescLabel: 'Brief Description',
    prodDescPlaceholder: 'Short key product details (1-2 sentences)...',
    publishProductBtn: 'Publish Product',
    updateProductBtn: 'Update Product',
    publishingBtn: 'Publishing...',
    myProductsCardTitle: 'Inventory & Stock',
    noShopYetNotice: 'Publish a product below to auto-create your shop.',
    noProductsYet: 'No products listed yet.',
    deleteProductBtn: 'Delete',
    editProductBtn: 'Edit',
    confirmDeleteTitle: 'Delete Product?',
    confirmDeleteDesc: 'Remove this product from the catalog?',
    confirmDeleteAction: 'Delete',
    cancelAction: 'Cancel',
    cartDrawerTitle: 'Shopping Cart',
    cartEmptyState: 'Your cart is empty.',
    cartSubtotal: 'Subtotal',
    cartDeliveryFee: 'Delivery',
    cartTotalAmount: 'Total',
    cartRemoveItem: 'Remove',
    cartProceedCheckoutBtn: 'Checkout',
    cartCheckoutWhatsApp: 'WhatsApp Order',
    cartClearBtn: 'Clear Cart',
    cartVendorGroupNote: 'Seller',
    checkoutModalTitle: 'Checkout & Delivery',
    checkoutCustomerName: 'Full Name',
    checkoutPhone: 'Phone (+237)',
    checkoutCity: 'City',
    checkoutAddress: 'Neighborhood / Street',
    checkoutDeliveryMethod: 'Delivery Method',
    deliveryLocalExpress: 'City Express Bike (1,500 FCFA · 2–6h)',
    deliveryIntercityBus: 'Inter-City Bus Courier (3,000 FCFA · 24–48h)',
    deliveryShopPickup: 'Shop Pickup (0 FCFA)',
    checkoutPaymentMethod: 'Payment Method',
    payMtnMomo: 'MTN MoMo (*126#)',
    payOrangeMoney: 'Orange Money (#150#)',
    payBankCard: 'Bank Card (Visa/Mastercard)',
    payCashOnDelivery: 'Cash on Delivery',
    placeOrderBtn: 'Place Order',
    placingOrderBtn: 'Processing...',
    orderConfirmedTitle: 'Order Confirmed!',
    orderConfirmedDesc: 'Order saved. Track status in My Account.',
    reviewsSectionTitle: 'Reviews',
    writeReviewTitle: 'Write a Brief Review',
    reviewRatingLabel: 'Rating',
    reviewCommentPlaceholder: 'Short review of product & delivery...',
    submitReviewBtn: 'Post Review',
    supportHeading: 'Support & FAQ',
    supportSubheading: 'Contact us for order, payment, or seller help.',
    contactFormTitle: 'Send Support Ticket',
    ticketSubjectLabel: 'Subject / Order #',
    ticketMessageLabel: 'Brief Message',
    submitTicketBtn: 'Send Ticket',
    faqSectionTitle: 'Key FAQs',
    securityBannerTitle: 'Security & Trust',
    authModalSignInTitle: 'Sign In',
    authModalSignUpTitle: 'Create Account',
    authGoogleBtn: 'Continue with Google',
    authOrEmailDivider: 'or use email',
    authNameLabel: 'Full Name',
    authNamePlaceholder: 'Your name',
    authEmailLabel: 'Email',
    authEmailPlaceholder: 'you@example.cm',
    authPasswordLabel: 'Password (6+ chars)',
    authRoleLabel: 'Select Role',
    authRoleCustomer: 'Customer (Buy & Track Orders)',
    authRoleShopOwner: 'Seller (Manage Shop & Products)',
    authSubmitSignIn: 'Sign In',
    authSubmitSignUp: 'Sign Up',
    authSwitchToSignUp: 'New user? Create account',
    authSwitchToSignIn: 'Have an account? Sign in',
    authProviderSetupNote: 'Secured with Firebase Auth & HTTPS.',
    roleSwitchLabel: 'Role:',
    roleCustomerBadge: 'Customer',
    roleShopOwnerBadge: 'Seller',
    roleAdminBadge: 'Admin',
    adminPanelHeading: 'Admin Control & Revenue',
    adminPanelSubheading: 'Manage earnings, commissions, sellers, products, and orders.',
    adminAllProductsTitle: 'All Products & Stock',
    adminAllShopsTitle: 'Manage Sellers',
    adminDeleteShopBtn: 'Delete Shop',
    switchToSellerBtn: 'Seller Mode',
    switchToCustomerBtn: 'Customer Mode',
    whatsappSinglePrefill: (title: string, price: string, shop: string) =>
      `Hello ${shop}, is "${title}" (${price}) in stock?`,
    whatsappShareProduct: (title: string, price: string, shop: string, url: string) =>
      `"${title}" (${price}) at ${shop}: ${url}`,
    whatsappCartPrefill: (shop: string, itemsList: string, total: string) =>
      `Hello ${shop}, I want to order:\n${itemsList}\nTotal: ${total}.`,
    footerTagline: 'Cameroon’s verified multi-vendor marketplace in FCFA.',
    footerCopyright: '© 2026 SWMARKETPLACE · MTN MoMo & Orange Money · FCFA.',
  },
  fr: {
    brandName: 'SWMARKETPLACE',
    navCatalog: 'Catalogue',
    navBoutiques: 'Boutiques',
    navAccount: 'Compte',
    navSellerHub: 'Espace Vendeur',
    navSupport: 'Support',
    langSwitchLabel: 'EN',
    langSwitchAria: 'Passer en anglais',
    themeLightAria: 'Mode clair',
    themeDarkAria: 'Mode sombre',
    signInBtn: 'Connexion',
    signOutBtn: 'Sortir',
    cartBtn: 'Panier',
    shopNowBtn: 'Acheter',
    heroKicker: 'SWMARKETPLACE · Cameroun · 100% FCFA',
    heroTitle: 'Le marché camerounais : mode, beauté, tech, maison & épicerie.',
    heroAnimatedWords: [
      'Mode & Sacs',
      'Beauté & Soins',
      'Smartphones 5G',
      'Maison & Déco',
      'Supermarché',
    ],
    heroSubtitle:
      'Achetez dans les boutiques vérifiées en FCFA avec livraison rapide et Mobile Money.',
    heroPrimaryCta: 'Acheter',
    heroSecondaryCta: 'Boutiques',
    heroTrustNote: 'Vendeurs Vérifiés · MTN MoMo & Orange Money · Livraison Rapide',
    promoBannerKicker: 'Boutiques Vérifiées & Offres',
    promoBannerTitle: 'Mode · Beauté · Électronique · Maison',
    promoBannerDesc: 'Produits authentiques des boutiques locales vérifiées.',
    featuredSectionTitle: 'Produits Vedettes',
    popularShopsTitle: 'Boutiques Vérifiées',
    liveApiSectionTitle: 'Marché en Direct',
    liveCurrencyLabel: 'Devise (FCFA)',
    liveWeatherHubLabel: 'Villes du Cameroun',
    searchPlaceholder: 'Rechercher produits, catégories ou boutiques...',
    menuSearchPlaceholder: 'Rechercher (FCFA)...',
    filterAllCities: 'Toutes les Villes',
    filterAllSellers: 'Tous les Vendeurs',
    filterMaxPriceLabel: 'Prix Max',
    filterInStockOnly: 'En Stock',
    filterMinRating: 'Note Min',
    catAll: 'Toutes Catégories',
    catGourmet: '1. Épicerie & Provisions',
    catFashion: '2. Mode & Sacs',
    catBeauty: '3. Beauté & Soins',
    catElectronics: '4. Smartphones & Tech',
    catHousehold: '5. Électroménager',
    catCrafts: '6. Déco & Art',
    catalogHeading: 'Catalogue Produits',
    catalogCountSuffix: 'articles',
    inStockLabel: 'en stock',
    outOfStockLabel: 'Rupture',
    verifiedSellerLabel: 'Vérifié',
    pendingSellerLabel: 'En attente',
    addToCart: 'Ajouter',
    addedToCart: 'Ajouté',
    contactWhatsApp: 'WhatsApp',
    shareOnWhatsApp: 'Partager',
    viewDetails: 'Aperçu',
    boutiquesHeading: 'Boutiques Vérifiées',
    boutiquesSubtitle: 'Parcourez les boutiques par secteur ou créez la vôtre.',
    shopClassificationLabel: '6 Secteurs',
    allShopCategories: 'Tous les Secteurs',
    productsCountLabel: 'articles',
    chatWithShop: 'WhatsApp',
    filterByShop: 'Voir Produits',
    showingShopFilter: 'Vendeur :',
    clearFilter: 'Réinitialiser',
    accountHeading: 'Mon Compte',
    accountSubheading: 'Gérez profil, adresse, commandes et favoris.',
    profileCardTitle: 'Profil & Adresse de Livraison',
    saveProfileBtn: 'Enregistrer',
    savedAddressLabel: 'Adresse de Livraison',
    savedPhoneLabel: 'Téléphone (+237)',
    favoritesTabTitle: 'Favoris',
    noFavoritesYet: 'Aucun favori enregistré.',
    orderHistoryTitle: 'Commandes & Suivi',
    trackOrderLookupLabel: 'Code suivi (KM-...)',
    noOrdersYet: 'Aucune commande.',
    dashboardHeading: 'Espace Vendeur & Admin',
    dashboardSubheading: 'Gérez produits, stock, commandes et revenus en FCFA.',
    shopProfileCardTitle: 'Profil Boutique',
    shopNameLabel: 'Nom Boutique',
    shopNamePlaceholder: 'ex: Boutique Soleil',
    shopCategoryLabel: 'Secteur',
    shopCityLabel: 'Ville',
    shopWhatsappLabel: 'WhatsApp (+237)',
    shopWhatsappPlaceholder: '237696751829',
    shopWhatsappHint: 'Format : 237 + 9 chiffres.',
    shopBioLabel: 'Présentation Brève',
    shopBioPlaceholder: 'Résumé court de la boutique et livraison...',
    saveShopBtn: 'Enregistrer',
    savingBtn: 'En cours...',
    shopSavedNotice: 'Boutique enregistrée.',
    addProductCardTitle: 'Ajouter Produit & Stock',
    editProductModeTitle: 'Modifier Produit & Stock',
    prodTitleLabel: 'Titre du Produit',
    prodTitlePlaceholder: 'ex: Sac Doré',
    prodPriceLabel: 'Prix (FCFA)',
    prodOrigPriceLabel: 'Ancien Prix (Optionnel)',
    prodStockLabel: 'Stock',
    prodPricePlaceholder: '25000',
    prodCategoryLabel: 'Catégorie',
    prodPromoBadgeLabel: 'Badge Promo (Optionnel)',
    prodImageUrlLabel: 'Photo Produit',
    prodImageUrlPlaceholder: 'Importer photo',
    prodImageUploadBtn: 'Importer Photo',
    prodDescLabel: 'Description Brève',
    prodDescPlaceholder: 'Points clés du produit (1 à 2 phrases)...',
    publishProductBtn: 'Publier Produit',
    updateProductBtn: 'Mettre à Jour',
    publishingBtn: 'Publication...',
    myProductsCardTitle: 'Inventaire & Stock',
    noShopYetNotice: 'Publiez un produit pour créer votre boutique.',
    noProductsYet: 'Aucun produit publié.',
    deleteProductBtn: 'Supprimer',
    editProductBtn: 'Modifier',
    confirmDeleteTitle: 'Supprimer ce produit ?',
    confirmDeleteDesc: 'Retirer ce produit du catalogue ?',
    confirmDeleteAction: 'Supprimer',
    cancelAction: 'Annuler',
    cartDrawerTitle: 'Votre Panier',
    cartEmptyState: 'Votre panier est vide.',
    cartSubtotal: 'Sous-total',
    cartDeliveryFee: 'Livraison',
    cartTotalAmount: 'Total',
    cartRemoveItem: 'Retirer',
    cartProceedCheckoutBtn: 'Commander',
    cartCheckoutWhatsApp: 'Commander via WhatsApp',
    cartClearBtn: 'Vider',
    cartVendorGroupNote: 'Vendeur',
    checkoutModalTitle: 'Validation & Livraison',
    checkoutCustomerName: 'Nom Complet',
    checkoutPhone: 'Téléphone (+237)',
    checkoutCity: 'Ville',
    checkoutAddress: 'Quartier / Rue',
    checkoutDeliveryMethod: 'Livraison',
    deliveryLocalExpress: 'Moto Express Ville (1 500 FCFA · 2–6h)',
    deliveryIntercityBus: 'Courrier Interurbain (3 000 FCFA · 24–48h)',
    deliveryShopPickup: 'Retrait Boutique (0 FCFA)',
    checkoutPaymentMethod: 'Paiement',
    payMtnMomo: 'MTN MoMo (*126#)',
    payOrangeMoney: 'Orange Money (#150#)',
    payBankCard: 'Carte Bancaire',
    payCashOnDelivery: 'Cash à la Livraison',
    placeOrderBtn: 'Confirmer Commande',
    placingOrderBtn: 'Traitement...',
    orderConfirmedTitle: 'Commande Confirmée !',
    orderConfirmedDesc: 'Suivez votre commande dans Mon Compte.',
    reviewsSectionTitle: 'Avis Clients',
    writeReviewTitle: 'Donner un Avis Bref',
    reviewRatingLabel: 'Note',
    reviewCommentPlaceholder: 'Avis court sur le produit et la livraison...',
    submitReviewBtn: 'Publier',
    supportHeading: 'Support & FAQ',
    supportSubheading: 'Aide commandes, paiements et vendeurs.',
    contactFormTitle: 'Envoyer un Ticket',
    ticketSubjectLabel: 'Objet / N° Commande',
    ticketMessageLabel: 'Message Bref',
    submitTicketBtn: 'Envoyer',
    faqSectionTitle: 'Questions Clés (FAQ)',
    securityBannerTitle: 'Sécurité & Garanties',
    authModalSignInTitle: 'Connexion',
    authModalSignUpTitle: 'Créer un Compte',
    authGoogleBtn: 'Continuer avec Google',
    authOrEmailDivider: 'ou par email',
    authNameLabel: 'Nom Complet',
    authNamePlaceholder: 'Votre nom',
    authEmailLabel: 'Email',
    authEmailPlaceholder: 'vous@exemple.cm',
    authPasswordLabel: 'Mot de Passe (6+ car.)',
    authRoleLabel: 'Rôle',
    authRoleCustomer: 'Client (Acheter & Suivre)',
    authRoleShopOwner: 'Vendeur (Gérer Boutique & Produits)',
    authSubmitSignIn: 'Se Connecter',
    authSubmitSignUp: 'S’inscrire',
    authSwitchToSignUp: 'Nouveau ? Créer un compte',
    authSwitchToSignIn: 'Déjà inscrit ? Connexion',
    authProviderSetupNote: 'Sécurisé par Firebase Auth & HTTPS.',
    roleSwitchLabel: 'Rôle :',
    roleCustomerBadge: 'Client',
    roleShopOwnerBadge: 'Vendeur',
    roleAdminBadge: 'Admin',
    adminPanelHeading: 'Contrôle Admin & Revenus',
    adminPanelSubheading: 'Gérez revenus, commissions, vendeurs, produits et commandes.',
    adminAllProductsTitle: 'Tous les Produits & Stock',
    adminAllShopsTitle: 'Gérer Vendeurs',
    adminDeleteShopBtn: 'Supprimer Boutique',
    switchToSellerBtn: 'Mode Vendeur',
    switchToCustomerBtn: 'Mode Client',
    whatsappSinglePrefill: (title: string, price: string, shop: string) =>
      `Bonjour ${shop}, "${title}" (${price}) est-il en stock ?`,
    whatsappShareProduct: (title: string, price: string, shop: string, url: string) =>
      `"${title}" (${price}) chez ${shop} : ${url}`,
    whatsappCartPrefill: (shop: string, itemsList: string, total: string) =>
      `Bonjour ${shop}, je commande :\n${itemsList}\nTotal : ${total}.`,
    footerTagline: 'Marketplace multi-vendeurs vérifiée au Cameroun (FCFA).',
    footerCopyright: '© 2026 SWMARKETPLACE · MTN MoMo & Orange Money · FCFA.',
  },
} as const;

export function formatXaf(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-CM', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${formatted} FCFA`;
}

export function formatConvertedPrice(
  amountXaf: number,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, number>
): string {
  if (currency === 'XAF') {
    return formatXaf(amountXaf);
  }
  const rate = rates[currency] || DEFAULT_EXCHANGE_RATES[currency];
  const converted = amountXaf * rate;

  if (currency === 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  }
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  }
  if (currency === 'NGN') {
    return `₦${new Intl.NumberFormat('en-NG', {
      maximumFractionDigits: 0,
    }).format(Math.round(converted))}`;
  }
  return formatXaf(amountXaf);
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
  const normalizedPhone = digitsOnly.startsWith('237') ? digitsOnly : `237${digitsOnly}`;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function summarizeText(text: string, maxLength = 75): string {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0];
  if (firstSentence && firstSentence.length <= maxLength) {
    return firstSentence;
  }
  return `${cleaned.slice(0, maxLength).trim()}…`;
}
