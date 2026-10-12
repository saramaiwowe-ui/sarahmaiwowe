import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ShoppingBag,
  Sun,
  Moon,
  Search,
  Plus,
  Trash2,
  MessageCircle,
  Store,
  User as UserIcon,
  LogOut,
  X,
  Upload,
  Check,
  AlertCircle,
  SlidersHorizontal,
  ArrowRight,
  Minus,
  Heart,
  Star,
  Bell,
  HelpCircle,
  BadgeCheck,
  Edit3,
  Sparkles,
  Lock,
  Clock,
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  Language,
  UserRole,
  ProductCategory,
  ADMIN_UID,
  UserAccount,
  ShopProfile,
  ProductItem,
  CartItem,
  OrderRecord,
  ProductReview,
  SupportTicket,
  DeliveryMethod,
  PaymentMethod,
  OrderStatus,
  PaymentStatus,
  SellerApprovalStatus,
  SubscriptionPlanConfig,
  PromotionPackageConfig,
  RevenueTransaction,
  DEFAULT_SUBSCRIPTION_PLANS,
  DEFAULT_PROMOTION_PACKAGES,
  AppNotification,
  HERO_IMAGE_URL,
  CAMEROON_CITIES,
  CAMEROON_CITY_COORDS,
  DELIVERY_FEES_XAF,
  SEED_USERS,
  SEED_SHOPS,
  SEED_PRODUCTS,
  SEED_REVIEWS,
  PRESET_PRODUCT_IMAGES,
  TRANSLATIONS,
  formatXaf,
  buildWhatsAppUrl,
  summarizeText,
} from './marketplaceData';
import {
  CameroonPaymentBanner,
  CustomerAccountView,
  SellerOrdersAndSalesPanel,
  AdminMarketplaceDashboard,
  MarketplaceSettings,
  SupportAndSecurityView,
} from './MarketplaceSections';
import { CheckoutModal, ProductQuickViewModal } from './CheckoutAndQuickView';

type ActiveSection =
  | 'catalog'
  | 'boutiques'
  | 'account'
  | 'seller_dashboard'
  | 'admin_dashboard'
  | 'support';

const BRAND_LOGO_URL = '/src/assets/images/sw_marketplace_emerald_logo_1791662891439.jpg';

function BrandLogo({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-10 w-10 sm:h-11 sm:w-11',
    md: 'h-12 w-12 sm:h-14 sm:w-14',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
    xl: 'h-20 w-20 sm:h-24 sm:w-24',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-br from-[#059669] via-[#f59e0b] to-[#0f172a] shadow-[0_6px_18px_rgba(5,150,105,0.28)] ring-1 ring-[#f59e0b]/40 shrink-0 overflow-hidden group transition-transform duration-200 hover:scale-105 ${sizeClasses} ${className}`}
    >
      <div className="w-full h-full rounded-[14px] bg-[#0f172a] flex items-center justify-center overflow-hidden">
        <img
          src={BRAND_LOGO_URL}
          alt="SW Market Place Official Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-[13px] scale-105 contrast-110 saturate-110"
        />
      </div>
    </div>
  );
}

function AnimatedCharacters({
  text,
  className = '',
  delayOffset = 0,
}: {
  text: string;
  className?: string;
  delayOffset?: number;
}) {
  const words = text.split(' ');
  let charCounter = 0;

  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {words.map((word, wordIdx) => (
        <span key={`${word}-${wordIdx}`} className="inline-block whitespace-nowrap mr-[0.26em]">
          {Array.from(word).map((char, idx) => {
            const currentIndex = charCounter++;
            return (
              <motion.span
                key={`${char}-${idx}-${currentIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  delay: delayOffset + currentIndex * 0.012,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

export default function App() {
  // 1. Language & Theme State
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('kmermarket_lang');
    return saved === 'fr' ? 'fr' : 'en';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kmermarket_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('kmermarket_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('kmermarket_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const t = TRANSLATIONS[lang];
  const isFr = lang === 'fr';

  const [spotlightWordIdx, setSpotlightWordIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSpotlightWordIdx((prev) => (prev + 1) % t.heroAnimatedWords.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [t.heroAnimatedWords.length]);

  // 2. Navigation, Modals & In-App Notifications
  const [activeSection, setActiveSection] = useState<ActiveSection>('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedProductModal, setSelectedProductModal] = useState<ProductItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_welcome',
      title: 'SWMARKETPLACE (FCFA)',
      message: 'MTN MoMo, Orange Money, Card & Cash on Delivery active.',
      timestamp: 'Live',
      read: false,
    },
  ]);

  // Stock overrides for instant per-product stock specification across all shops
  const [localStockOverrides, setLocalStockOverrides] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('swmarketplace_stock_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('swmarketplace_stock_overrides', JSON.stringify(localStockOverrides));
    } catch {
      // ignore
    }
  }, [localStockOverrides]);

  // Shop status overrides & deleted shop IDs for instant Admin moderation (Pending / Approved / Suspended / Banned / Deleted)
  const [localShopStatusOverrides, setLocalShopStatusOverrides] = useState<
    Record<string, SellerApprovalStatus>
  >(() => {
    try {
      const saved = localStorage.getItem('swmarketplace_shop_status_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'swmarketplace_shop_status_overrides',
        JSON.stringify(localShopStatusOverrides)
      );
    } catch {
      // ignore
    }
  }, [localShopStatusOverrides]);

  const [localDeletedShopIds, setLocalDeletedShopIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('swmarketplace_deleted_shops');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'swmarketplace_deleted_shops',
        JSON.stringify(localDeletedShopIds)
      );
    } catch {
      // ignore
    }
  }, [localDeletedShopIds]);

  const [localSellerStatusOverrides, setLocalSellerStatusOverrides] = useState<
    Record<string, SellerApprovalStatus>
  >(() => {
    try {
      const saved = localStorage.getItem('swmarketplace_seller_status_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'swmarketplace_seller_status_overrides',
        JSON.stringify(localSellerStatusOverrides)
      );
    } catch {
      // ignore
    }
  }, [localSellerStatusOverrides]);

  const [marketplaceSettings, setMarketplaceSettings] = useState<MarketplaceSettings>(() => {
    try {
      const saved = localStorage.getItem('swmarketplace_admin_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          commissionPercent:
            typeof parsed.commissionPercent === 'number' ? parsed.commissionPercent : 5,
          subscriptionPlans:
            Array.isArray(parsed.subscriptionPlans) && parsed.subscriptionPlans.length > 0
              ? parsed.subscriptionPlans
              : DEFAULT_SUBSCRIPTION_PLANS,
          promotionPackages:
            Array.isArray(parsed.promotionPackages) && parsed.promotionPackages.length > 0
              ? parsed.promotionPackages
              : DEFAULT_PROMOTION_PACKAGES,
          supportWhatsApp:
            !parsed.supportWhatsApp || parsed.supportWhatsApp === '237677428190'
              ? '237696751829'
              : parsed.supportWhatsApp,
        };
      }
    } catch {
      // ignore
    }
    return {
      marketplaceName: 'SWMARKETPLACE',
      commissionPercent: 5,
      subscriptionPlans: DEFAULT_SUBSCRIPTION_PLANS,
      promotionPackages: DEFAULT_PROMOTION_PACKAGES,
      localDeliveryFeeXaf: 1500,
      intercityBusFeeXaf: 3500,
      supportWhatsApp: '237696751829',
      mtnMomoActive: true,
      orangeMoneyActive: true,
      cardPaymentsActive: true,
      cashOnDeliveryActive: true,
      requireSellerVerification: true,
      enabledCategories: {
        gourmet: true,
        fashion: true,
        beauty: true,
        electronics: true,
        household: true,
        crafts: true,
      },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'swmarketplace_admin_settings',
        JSON.stringify(marketplaceSettings)
      );
    } catch {
      // ignore
    }
  }, [marketplaceSettings]);

  const [revenueTransactions, setRevenueTransactions] = useState<RevenueTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('swmarketplace_revenue_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'swmarketplace_revenue_transactions',
        JSON.stringify(revenueTransactions)
      );
    } catch {
      // ignore
    }
  }, [revenueTransactions]);

  const pushNotification = (title: string, message: string) => {
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
      ...prev.slice(0, 14),
    ]);
  };

  // 3. Firebase Auth & User Profile State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserAccount | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedRoleInput, setSelectedRoleInput] = useState<UserRole>('customer');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Local favorites fallback + Firestore sync
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kmermarket_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kmermarket_favs', JSON.stringify(favoriteIds));
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  // 4. Firestore Real-Time Collections + Local Published Products Cache
  const [firestoreProducts, setFirestoreProducts] = useState<ProductItem[]>([]);
  const [localPublishedProducts, setLocalPublishedProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('swmarketplace_local_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'swmarketplace_local_products',
        JSON.stringify(localPublishedProducts)
      );
    } catch {
      // ignore
    }
  }, [localPublishedProducts]);

  const [firestoreShops, setFirestoreShops] = useState<ShopProfile[]>([]);
  const [localPublishedShops, setLocalPublishedShops] = useState<ShopProfile[]>(() => {
    try {
      const saved = localStorage.getItem('swmarketplace_local_shops');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('swmarketplace_local_shops', JSON.stringify(localPublishedShops));
    } catch {
      // ignore
    }
  }, [localPublishedShops]);

  const [firestoreReviews, setFirestoreReviews] = useState<ProductReview[]>([]);
  const [firestoreOrders, setFirestoreOrders] = useState<OrderRecord[]>([]);
  const [firestoreTickets, setFirestoreTickets] = useState<SupportTicket[]>([]);
  const [allUsersAdmin, setAllUsersAdmin] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('swmarketplace_registered_users');
      return saved ? JSON.parse(saved) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('swmarketplace_registered_users', JSON.stringify(allUsersAdmin));
    } catch {
      // ignore
    }
  }, [allUsersAdmin]);
  const [myShop, setMyShop] = useState<ShopProfile | null>(null);

  // Shop Owner Form State
  const [shopNameInput, setShopNameInput] = useState('');
  const [shopCityInput, setShopCityInput] = useState('Douala');
  const [shopCategoryInput, setShopCategoryInput] = useState<ProductCategory>('fashion');
  const [shopWhatsappInput, setShopWhatsappInput] = useState('237696751829');
  const [shopBioInput, setShopBioInput] = useState('');
  const [savingShop, setSavingShop] = useState(false);
  const [shopFeedback, setShopFeedback] = useState<string | null>(null);

  // Product Add/Edit Form State
  const [prodTitleInput, setProdTitleInput] = useState('');
  const [prodPriceInput, setProdPriceInput] = useState('');
  const [prodOrigPriceInput, setProdOrigPriceInput] = useState('');
  const [prodStockInput, setProdStockInput] = useState('20');
  const [prodPromoBadgeInput, setProdPromoBadgeInput] = useState('');
  const [prodCategoryInput, setProdCategoryInput] = useState<ProductCategory>('fashion');
  const [prodImageUrlInput, setProdImageUrlInput] = useState('');
  const [prodImageStatus, setProdImageStatus] = useState<'empty' | 'processing' | 'ready' | 'error'>('empty');
  const [prodImageFileName, setProdImageFileName] = useState<string>('');
  const [prodImageSizeKb, setProdImageSizeKb] = useState<number>(0);
  const [prodTargetShopId, setProdTargetShopId] = useState<string>('');
  const [prodDescInput, setProdDescInput] = useState('');
  const [publishingProduct, setPublishingProduct] = useState(false);
  const [productFeedback, setProductFeedback] = useState<string | null>(null);

  // 5. Advanced Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedShopIdFilter, setSelectedShopIdFilter] = useState<string | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(5000000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  const [selectedBoutiqueCategory, setSelectedBoutiqueCategory] = useState<
    ProductCategory | 'all'
  >('all');
  const [selectedBoutiqueCity, setSelectedBoutiqueCity] = useState<string>('all');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // 6. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kmermarket_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kmermarket_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const activeRole: UserRole = useMemo(() => {
    if (userProfile?.role) return userProfile.role;
    if (firebaseUser?.uid === ADMIN_UID) return 'admin';
    return selectedRoleInput;
  }, [userProfile, firebaseUser, selectedRoleInput]);

  const isCurrentUserAdmin = activeRole === 'admin';
  const isCurrentUserSeller = activeRole === 'shop_owner';
  const isCurrentUserCustomer = activeRole === 'customer';

  // 7. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserAccount;
            if (data.favoriteProductIds && data.favoriteProductIds.length > 0) {
              setFavoriteIds(data.favoriteProductIds);
            }
            setUserProfile(data);
          } else {
            const assignedRole: UserRole =
              selectedRoleInput === 'admin' && user.uid !== ADMIN_UID
                ? 'customer'
                : selectedRoleInput;
            const newProfile: UserAccount = {
              uid: user.uid,
              email: (user.email || 'user@swmarketplace.cm').slice(0, 200),
              displayName: (
                user.displayName ||
                user.email?.split('@')[0] ||
                'SWMARKETPLACE Member'
              ).slice(0, 100),
              role: assignedRole,
            };
            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setUserProfile(newProfile);
          }
        } catch {
          setUserProfile({
            uid: user.uid,
            email: user.email || 'user@swmarketplace.cm',
            displayName: user.displayName || user.email?.split('@')[0] || 'Member',
            role: selectedRoleInput,
          });
        }
      } else {
        setUserProfile(null);
        setMyShop(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [selectedRoleInput]);

  // 8. Public / Admin Firestore Listeners (Products, Shops, Reviews)
  useEffect(() => {
    const productsQuery = isCurrentUserAdmin
      ? collection(db, 'products')
      : query(collection(db, 'products'), where('isPublic', '==', true));
    const unsubProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        const loaded: ProductItem[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ProductItem, 'id'>),
          });
        });
        setFirestoreProducts(loaded);
      },
      (err) => console.warn('Products listener:', err)
    );

    const shopsQuery = isCurrentUserAdmin
      ? collection(db, 'shops')
      : query(collection(db, 'shops'), where('isPublic', '==', true));
    const unsubShops = onSnapshot(
      shopsQuery,
      (snapshot) => {
        const loadedShops: ShopProfile[] = [];
        snapshot.forEach((docSnap) => {
          loadedShops.push(docSnap.data() as ShopProfile);
        });
        setFirestoreShops(loadedShops);
      },
      (err) => console.warn('Shops listener:', err)
    );

    const reviewsQuery = query(collection(db, 'reviews'), where('isPublic', '==', true));
    const unsubReviews = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const loadedReviews: ProductReview[] = [];
        snapshot.forEach((docSnap) => {
          loadedReviews.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ProductReview, 'id'>),
          });
        });
        setFirestoreReviews(loadedReviews);
      },
      (err) => console.warn('Reviews listener:', err)
    );

    return () => {
      unsubProducts();
      unsubShops();
      unsubReviews();
    };
  }, [isCurrentUserAdmin]);

  // 9. Authenticated Listeners (Shop Profile, Orders, Tickets, Admin Users)
  useEffect(() => {
    if (!firebaseUser) {
      setMyShop(null);
      setFirestoreOrders([]);
      setFirestoreTickets([]);
      setAllUsersAdmin([]);
      return;
    }

    const shopRef = doc(db, 'shops', firebaseUser.uid);
    const unsubMyShop = onSnapshot(
      shopRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as ShopProfile;
          setMyShop(data);
          setShopNameInput(data.shopName);
          setShopCityInput(data.city);
          if (data.category) setShopCategoryInput(data.category);
          setShopWhatsappInput(data.whatsappNumber);
          setShopBioInput(data.bio);
        } else {
          setMyShop(null);
        }
      },
      () => {}
    );

    const ordersQuery = isCurrentUserAdmin
      ? collection(db, 'orders')
      : isCurrentUserSeller
      ? query(collection(db, 'orders'), where('shopId', '==', firebaseUser.uid))
      : query(collection(db, 'orders'), where('customerId', '==', firebaseUser.uid));

    const unsubOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const list: OrderRecord[] = [];
        snapshot.forEach((d) =>
          list.push({ id: d.id, ...(d.data() as Omit<OrderRecord, 'id'>) })
        );
        setFirestoreOrders(list);
      },
      () => {}
    );

    const ticketsQuery = isCurrentUserAdmin
      ? collection(db, 'tickets')
      : query(collection(db, 'tickets'), where('userId', '==', firebaseUser.uid));

    const unsubTickets = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        const list: SupportTicket[] = [];
        snapshot.forEach((d) =>
          list.push({ id: d.id, ...(d.data() as Omit<SupportTicket, 'id'>) })
        );
        setFirestoreTickets(list);
      },
      () => {}
    );

    let unsubUsers = () => {};
    if (isCurrentUserAdmin) {
      unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          const uList: UserAccount[] = [];
          snap.forEach((d) => uList.push(d.data() as UserAccount));
          setAllUsersAdmin(uList);
        },
        () => {}
      );
    }

    return () => {
      unsubMyShop();
      unsubOrders();
      unsubTickets();
      unsubUsers();
    };
  }, [firebaseUser, isCurrentUserAdmin, isCurrentUserSeller]);

  // Combine Local Published, Firestore & Seed Data with live Stock Overrides
  const LEGACY_SEED_PHONES = [
    '237677428190',
    '237699314502',
    '237675881234',
    '237694102938',
    '237678990011',
    '237691223344',
    '237677123456',
    '2376',
  ];

  const normalizeShopWhatsapp = (phone?: string) => {
    if (!phone || LEGACY_SEED_PHONES.includes(phone.trim())) {
      return '237696751829';
    }
    return phone;
  };

  const allShops = useMemo(() => {
    const map = new Map<string, ShopProfile>();
    if (myShop && !localDeletedShopIds.includes(myShop.ownerId)) {
      const overrideStatus = localShopStatusOverrides[myShop.ownerId];
      map.set(myShop.ownerId, {
        ...myShop,
        whatsappNumber: normalizeShopWhatsapp(myShop.whatsappNumber),
        status: overrideStatus || myShop.status || (myShop.isVerified === false ? 'pending' : 'approved'),
        isVerified: overrideStatus
          ? overrideStatus === 'approved'
          : myShop.isVerified !== false,
      });
    }
    localPublishedShops.forEach((s) => {
      if (!localDeletedShopIds.includes(s.ownerId)) {
        const overrideStatus = localShopStatusOverrides[s.ownerId];
        map.set(s.ownerId, {
          ...s,
          whatsappNumber: normalizeShopWhatsapp(s.whatsappNumber),
          status: overrideStatus || s.status || (s.isVerified === false ? 'pending' : 'approved'),
          isVerified: overrideStatus
            ? overrideStatus === 'approved'
            : s.isVerified !== false,
        });
      }
    });
    firestoreShops.forEach((s) => {
      if (!localDeletedShopIds.includes(s.ownerId)) {
        const overrideStatus = localShopStatusOverrides[s.ownerId];
        map.set(s.ownerId, {
          ...s,
          whatsappNumber: normalizeShopWhatsapp(s.whatsappNumber),
          status: overrideStatus || s.status || (s.isVerified === false ? 'pending' : 'approved'),
          isVerified: overrideStatus
            ? overrideStatus === 'approved'
            : s.isVerified !== false,
        });
      }
    });
    SEED_SHOPS.forEach((s) => {
      if (!map.has(s.ownerId) && !localDeletedShopIds.includes(s.ownerId)) {
        const overrideStatus = localShopStatusOverrides[s.ownerId];
        map.set(s.ownerId, {
          ...s,
          whatsappNumber: normalizeShopWhatsapp(s.whatsappNumber),
          status: overrideStatus || s.status || 'approved',
          isVerified: overrideStatus ? overrideStatus === 'approved' : true,
        });
      }
    });
    return Array.from(map.values());
  }, [myShop, localPublishedShops, firestoreShops, localShopStatusOverrides, localDeletedShopIds]);

  const combinedUsersForAdmin = useMemo(() => {
    const map = new Map<string, UserAccount>();

    // 1. Initial base accounts
    SEED_USERS.forEach((u) => {
      if (!localDeletedShopIds.includes(u.uid)) {
        map.set(u.uid, u);
      }
    });

    // 2. Extra users saved in localStorage (preserves all accounts created across sessions)
    try {
      const saved = localStorage.getItem('swmarketplace_registered_users');
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        parsed.forEach((u) => {
          if (!localDeletedShopIds.includes(u.uid)) {
            const overrideStatus = localSellerStatusOverrides[u.uid];
            map.set(u.uid, {
              ...(map.get(u.uid) || {}),
              ...u,
              sellerStatus: overrideStatus || u.sellerStatus || 'pending',
              accountStatus: overrideStatus || u.accountStatus || 'approved',
            });
          }
        });
      }
    } catch {
      // ignore
    }

    // 3. All registered users from state
    allUsersAdmin.forEach((u) => {
      if (!localDeletedShopIds.includes(u.uid)) {
        const overrideStatus = localSellerStatusOverrides[u.uid];
        map.set(u.uid, {
          ...(map.get(u.uid) || {}),
          ...u,
          sellerStatus: overrideStatus || u.sellerStatus || 'pending',
          accountStatus: overrideStatus || u.accountStatus || 'approved',
        });
      }
    });

    // 4. Current active user profile
    if (userProfile && !localDeletedShopIds.includes(userProfile.uid)) {
      const overrideStatus = localSellerStatusOverrides[userProfile.uid];
      const existing = map.get(userProfile.uid);
      map.set(userProfile.uid, {
        ...(existing || userProfile),
        ...userProfile,
        sellerStatus:
          overrideStatus ||
          existing?.sellerStatus ||
          userProfile.sellerStatus ||
          'pending',
        accountStatus: overrideStatus || existing?.accountStatus || 'approved',
      });
    }

    // 5. Ensure every created shop owner (from allShops, myShop, and localPublishedShops) is displayed under Users & Roles
    const allShopSources = [...allShops];
    if (myShop && !allShopSources.some((s) => s.ownerId === myShop.ownerId)) {
      allShopSources.push(myShop);
    }
    localPublishedShops.forEach((s) => {
      if (!allShopSources.some((item) => item.ownerId === s.ownerId)) {
        allShopSources.push(s);
      }
    });

    allShopSources.forEach((s) => {
      if (!localDeletedShopIds.includes(s.ownerId)) {
        const existing = map.get(s.ownerId);
        if (existing) {
          map.set(s.ownerId, {
            ...existing,
            hasShop: true,
            shopName: s.shopName,
            shopCity: s.city,
            shopWhatsapp: s.whatsappNumber,
            role: 'shop_owner',
            sellerStatus:
              localSellerStatusOverrides[s.ownerId] ||
              existing.sellerStatus ||
              s.status ||
              (s.isVerified === false ? 'pending' : 'approved'),
          });
        } else {
          // If a shop was created, ensure a synthesized user account displays under Users & Roles
          const cleanEmail =
            (userProfile?.uid === s.ownerId && userProfile.email) ||
            `${s.shopName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'vendeur'}@swmarketplace.cm`;
          map.set(s.ownerId, {
            uid: s.ownerId,
            email: cleanEmail,
            displayName: s.shopName,
            role: 'shop_owner',
            sellerStatus:
              localSellerStatusOverrides[s.ownerId] ||
              s.status ||
              (s.isVerified === false ? 'pending' : 'approved'),
            accountStatus: 'approved',
            hasShop: true,
            shopName: s.shopName,
            shopCity: s.city,
            shopWhatsapp: s.whatsappNumber,
            phone: s.whatsappNumber ? `+${s.whatsappNumber}` : undefined,
            defaultCity: s.city,
            createdAt: s.createdAt || new Date().toISOString(),
          });
        }
      }
    });

    // 6. Include every customer details from order records
    firestoreOrders.forEach((o) => {
      if (o.customerId && !map.has(o.customerId) && !localDeletedShopIds.includes(o.customerId)) {
        map.set(o.customerId, {
          uid: o.customerId,
          email: `${o.customerName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'client'}@swmarketplace.cm`,
          displayName: o.customerName,
          role: 'customer',
          accountStatus: 'approved',
          phone: o.customerPhone,
          defaultCity: o.deliveryCity,
          defaultAddress: o.deliveryAddress,
          createdAt: typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString(),
        });
      }
    });

    return Array.from(map.values());
  }, [
    allUsersAdmin,
    userProfile,
    allShops,
    myShop,
    localPublishedShops,
    firestoreOrders,
    localSellerStatusOverrides,
    localDeletedShopIds,
  ]);

  // Publicly approved & active shops (exclude suspended or banned shops from public catalog)
  const publicApprovedShops = useMemo(() => {
    return allShops.filter((s) => {
      const st = s.status || (s.isVerified === false ? 'pending' : 'approved');
      return st === 'approved';
    });
  }, [allShops]);

  const allProducts = useMemo(() => {
    const productMap = new Map<string, ProductItem>();
    localPublishedProducts.forEach((p) => {
      if (!localDeletedShopIds.includes(p.shopId)) {
        productMap.set(p.id, {
          ...p,
          whatsappNumber: normalizeShopWhatsapp(p.whatsappNumber),
        });
      }
    });
    firestoreProducts.forEach((p) => {
      if (!localDeletedShopIds.includes(p.shopId)) {
        productMap.set(p.id, {
          ...p,
          whatsappNumber: normalizeShopWhatsapp(p.whatsappNumber),
        });
      }
    });
    SEED_PRODUCTS.forEach((p) => {
      if (!productMap.has(p.id) && !localDeletedShopIds.includes(p.shopId)) {
        productMap.set(p.id, {
          ...p,
          whatsappNumber: normalizeShopWhatsapp(p.whatsappNumber),
        });
      }
    });
    return Array.from(productMap.values()).map((p) =>
      localStockOverrides[p.id] !== undefined
        ? { ...p, stock: localStockOverrides[p.id] }
        : p
    );
  }, [localPublishedProducts, firestoreProducts, localStockOverrides, localDeletedShopIds]);

  // Determine the current seller's approval status ('pending' | 'approved' | 'suspended' | 'banned')
  const currentSellerStatus: SellerApprovalStatus = useMemo(() => {
    if (isCurrentUserAdmin) return 'approved';
    if (!firebaseUser) return 'pending';
    if (localSellerStatusOverrides[firebaseUser.uid]) {
      return localSellerStatusOverrides[firebaseUser.uid];
    }
    if (userProfile?.sellerStatus) {
      return userProfile.sellerStatus;
    }
    if (myShop?.status) {
      return myShop.status;
    }
    if (myShop?.isVerified === true) {
      return 'approved';
    }
    return 'pending';
  }, [
    isCurrentUserAdmin,
    firebaseUser,
    localSellerStatusOverrides,
    userProfile,
    myShop,
  ]);

  const currentShopStatus: SellerApprovalStatus = useMemo(() => {
    if (!myShop) return currentSellerStatus;
    if (localShopStatusOverrides[myShop.ownerId]) {
      return localShopStatusOverrides[myShop.ownerId];
    }
    if (myShop.status) return myShop.status;
    return myShop.isVerified === false ? 'pending' : 'approved';
  }, [myShop, localShopStatusOverrides, currentSellerStatus]);

  const isSellerApprovedByAdmin =
    isCurrentUserAdmin ||
    (currentSellerStatus === 'approved' &&
      (!myShop || currentShopStatus === 'approved'));

  const allReviews = useMemo(() => {
    return [...firestoreReviews, ...SEED_REVIEWS];
  }, [firestoreReviews]);

  const getProductRating = (productId: string): { avg: number; count: number } => {
    const revs = allReviews.filter((r) => r.productId === productId);
    if (revs.length === 0) return { avg: 5, count: 1 };
    const sum = revs.reduce((acc, r) => acc + r.rating, 0);
    return { avg: Number((sum / revs.length).toFixed(1)), count: revs.length };
  };

  // URL ?product= deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productIdParam = params.get('product');
    if (productIdParam && allProducts.length > 0) {
      const matched = allProducts.find((p) => p.id === productIdParam);
      if (matched) setSelectedProductModal(matched);
    }
  }, [allProducts]);

  const getShopClassification = (shop: ShopProfile): ProductCategory => {
    if (shop.category) return shop.category;
    const shopProduct = allProducts.find((p) => p.shopId === shop.ownerId);
    return shopProduct?.category || 'fashion';
  };

  const classifiedShops = useMemo(() => {
    return publicApprovedShops.filter((shop) => {
      const shopCat = getShopClassification(shop);
      const matchesCat =
        selectedBoutiqueCategory === 'all' || shopCat === selectedBoutiqueCategory;
      const matchesCity =
        selectedBoutiqueCity === 'all' || shop.city === selectedBoutiqueCity;
      return matchesCat && matchesCity;
    });
  }, [publicApprovedShops, selectedBoutiqueCategory, selectedBoutiqueCity, allProducts]);

  const shopCountsByCategory = useMemo(() => {
    const counts: Record<ProductCategory | 'all', number> = {
      all: publicApprovedShops.length,
      gourmet: 0,
      fashion: 0,
      beauty: 0,
      electronics: 0,
      household: 0,
      crafts: 0,
    };
    publicApprovedShops.forEach((s) => {
      const cat = getShopClassification(s);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [publicApprovedShops, allProducts]);

  // 4. Search & Filtering (Product name, Category, Price range, Location, Seller, Availability, Rating)
  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      // Hide unapproved products from public catalog unless viewer is Admin or owner
      const isOwner = Boolean(
        firebaseUser &&
          (item.ownerId === firebaseUser.uid ||
            (myShop && item.shopId === myShop.ownerId))
      );
      if (!isCurrentUserAdmin && !isOwner) {
        if (item.isApproved === false || item.approvalStatus === 'pending') {
          return false;
        }
      }

      const parentShop = allShops.find((s) => s.ownerId === item.shopId);
      if (parentShop) {
        const st =
          parentShop.status || (parentShop.isVerified === false ? 'pending' : 'approved');
        if (st === 'suspended' || st === 'banned') return false;
      }

      const displayTitle = lang === 'fr' && item.titleFr ? item.titleFr : item.title;
      const displayDesc =
        lang === 'fr' && item.descriptionFr ? item.descriptionFr : item.description;

      const matchesSearch =
        !searchQuery.trim() ||
        displayTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        displayDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shopCity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || item.shopCity === selectedCity;
      const matchesShop = !selectedShopIdFilter || item.shopId === selectedShopIdFilter;
      const matchesPrice = item.priceXaf <= maxPriceFilter;
      const stockQty = item.stock ?? 15;
      const matchesStock = !inStockOnly || stockQty > 0;
      const { avg } = getProductRating(item.id);
      const matchesRating = avg >= minRatingFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCity &&
        matchesShop &&
        matchesPrice &&
        matchesStock &&
        matchesRating
      );
    });
  }, [
    allProducts,
    lang,
    searchQuery,
    selectedCategory,
    selectedCity,
    selectedShopIdFilter,
    maxPriceFilter,
    inStockOnly,
    minRatingFilter,
    allReviews,
  ]);

  const featuredProducts = useMemo(() => {
    return allProducts.filter((p) => p.isFeatured || p.promoBadge).slice(0, 4);
  }, [allProducts]);

  const favoriteProductsList = useMemo(() => {
    return allProducts.filter((p) => favoriteIds.includes(p.id));
  }, [allProducts, favoriteIds]);

  const myUploadedProducts = useMemo(() => {
    if (!firebaseUser) return [];
    const sellerShopId = myShop?.ownerId || firebaseUser.uid;
    return allProducts.filter(
      (p) => p.ownerId === firebaseUser.uid || p.shopId === sellerShopId
    );
  }, [allProducts, firebaseUser, myShop]);

  const sellerTotalStockUnits = useMemo(() => {
    return myUploadedProducts.reduce((sum, p) => sum + (p.stock ?? 15), 0);
  }, [myUploadedProducts]);

  const sellerScopedOrders = useMemo(() => {
    if (!firebaseUser) return [];
    const sellerShopId = myShop?.ownerId || firebaseUser.uid;
    return firestoreOrders.filter((o) => o.shopId === sellerShopId);
  }, [firestoreOrders, firebaseUser, myShop]);

  const handleUpdateProductStock = async (product: ProductItem, nextStock: number) => {
    const cleanStock = Math.max(0, Math.min(9999, Math.round(nextStock)));
    setLocalStockOverrides((prev) => ({
      ...prev,
      [product.id]: cleanStock,
    }));

    if (firebaseUser && !product.id.startsWith('seed_')) {
      try {
        await updateDoc(doc(db, 'products', product.id), {
          stock: cleanStock,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Local stock override already applied
      }
    }
    pushNotification(
      isFr ? 'Stock Mis à Jour' : 'Stock Quantity Updated',
      `${product.title}: ${cleanStock} ${t.inStockLabel}`
    );
  };

  // Cart Calculations
  const totalCartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const totalCartPriceXaf = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.priceXaf * item.quantity, 0),
    [cart]
  );

  const estimatedDeliveryFeeXaf = cart.length > 0 ? DELIVERY_FEES_XAF.local_express : 0;

  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((prev) => (prev === product.id ? null : prev));
    }, 1200);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleFavorite = async (productId: string) => {
    const next = favoriteIds.includes(productId)
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId].slice(0, 50);
    setFavoriteIds(next);

    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          favoriteProductIds: next,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // local fallback already updated
      }
    }
  };

  const cartGroupedByShop = useMemo(() => {
    const groups: Record<
      string,
      {
        shopId: string;
        shopName: string;
        whatsappNumber: string;
        items: CartItem[];
        subtotalXaf: number;
      }
    > = {};
    cart.forEach((entry) => {
      const key = entry.product.shopId;
      if (!groups[key]) {
        groups[key] = {
          shopId: entry.product.shopId,
          shopName: entry.product.shopName,
          whatsappNumber: entry.product.whatsappNumber,
          items: [],
          subtotalXaf: 0,
        };
      }
      groups[key].items.push(entry);
      groups[key].subtotalXaf += entry.product.priceXaf * entry.quantity;
    });
    return Object.values(groups);
  }, [cart]);

  const routeToRoleDashboard = (role: UserRole) => {
    if (role === 'admin') {
      setActiveSection('admin_dashboard');
    } else if (role === 'shop_owner') {
      setActiveSection('seller_dashboard');
    } else {
      setActiveSection('account');
    }
  };

  // Auth Handlers
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const desiredRole: UserRole = selectedRoleInput;
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      let resolvedProfile: UserAccount;
      const isPlatformAdmin =
        (user.email && user.email.toLowerCase() === 'saramaiwowe@gmail.com') ||
        user.uid === ADMIN_UID;
      const initialRole: UserRole = isPlatformAdmin ? 'admin' : desiredRole;
      const initialAccountStatus: SellerApprovalStatus = isPlatformAdmin ? 'approved' : 'pending';
      const initialSellerStatus: SellerApprovalStatus = isPlatformAdmin ? 'approved' : 'pending';

      if (!snap.exists()) {
        const newProfile: UserAccount = {
          uid: user.uid,
          email: (user.email || 'user@swmarketplace.cm').slice(0, 200),
          displayName: (user.displayName || 'SWMARKETPLACE User').slice(0, 100),
          role: initialRole,
          sellerStatus: initialSellerStatus,
          accountStatus: initialAccountStatus,
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch {
          // local profile state fallback
        }
        resolvedProfile = newProfile;
        pushNotification(
          isPlatformAdmin
            ? (isFr ? 'Connexion Administrateur' : 'Admin Login')
            : (isFr ? 'Demande de Compte Envoyée !' : 'Account Request Sent!'),
          isPlatformAdmin
            ? (isFr ? 'Bienvenue Sarah Maiwowe (Admin)' : 'Welcome Sarah Maiwowe (Admin)')
            : (isFr
                ? 'Votre compte a été créé. La demande a été transmise au tableau de bord administrateur pour approbation.'
                : 'Your account was created. The request was submitted to the Admin Dashboard for approval.')
        );
      } else {
        const existingData = snap.data() as UserAccount;
        const nextSellerStatus: SellerApprovalStatus =
          existingData.sellerStatus ||
          (isPlatformAdmin ? 'approved' : (desiredRole === 'shop_owner' ? 'pending' : 'approved'));
        const nextAccountStatus: SellerApprovalStatus =
          existingData.accountStatus || (isPlatformAdmin ? 'approved' : 'pending');
        if (existingData.role !== initialRole) {
          try {
            await updateDoc(userDocRef, {
              role: initialRole,
              sellerStatus: nextSellerStatus,
              accountStatus: nextAccountStatus,
              updatedAt: serverTimestamp(),
            });
          } catch {
            // local profile state fallback
          }
        }
        resolvedProfile = {
          ...existingData,
          role: initialRole,
          sellerStatus: nextSellerStatus,
          accountStatus: nextAccountStatus,
        };
      }
      setUserProfile(resolvedProfile);
      setAllUsersAdmin((prev) => {
        const next = [resolvedProfile, ...prev.filter((u) => u.uid !== resolvedProfile.uid)];
        try {
          localStorage.setItem('swmarketplace_registered_users', JSON.stringify(next));
        } catch {}
        return next;
      });
      setIsAuthModalOpen(false);
      routeToRoleDashboard(desiredRole);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    const cleanEmail = emailInput.trim();
    const trimmedName = nameInput.trim().slice(0, 100) || 'SWMARKETPLACE Member';

    const syncUserProfileAfterAuth = async (user: User, preferredName?: string) => {
      const isPlatformAdmin =
        (cleanEmail && cleanEmail.toLowerCase() === 'saramaiwowe@gmail.com') ||
        (user.email && user.email.toLowerCase() === 'saramaiwowe@gmail.com') ||
        user.uid === ADMIN_UID;
      const desiredRole: UserRole = isPlatformAdmin ? 'admin' : selectedRoleInput;
      const initialAccountStatus: SellerApprovalStatus = isPlatformAdmin ? 'approved' : 'pending';
      const initialSellerStatus: SellerApprovalStatus = isPlatformAdmin ? 'approved' : 'pending';

      const userDocRef = doc(db, 'users', user.uid);
      let resolvedProfile: UserAccount;
      try {
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          const newProfile: UserAccount = {
            uid: user.uid,
            email: (user.email || cleanEmail || 'user@swmarketplace.cm').slice(0, 200),
            displayName: (
              preferredName ||
              user.displayName ||
              cleanEmail.split('@')[0] ||
              'SWMARKETPLACE Member'
            ).slice(0, 100),
            role: desiredRole,
            sellerStatus: initialSellerStatus,
            accountStatus: initialAccountStatus,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          resolvedProfile = newProfile;
          pushNotification(
            isPlatformAdmin
              ? (isFr ? 'Connexion Administrateur' : 'Admin Login')
              : (isFr ? 'Demande de Compte Envoyée !' : 'Account Request Sent!'),
            isPlatformAdmin
              ? (isFr ? 'Bienvenue Sarah Maiwowe (Admin)' : 'Welcome Sarah Maiwowe (Admin)')
              : (isFr
                  ? 'Votre compte a été créé. La demande a été transmise au tableau de bord administrateur pour approbation.'
                  : 'Your account was created. The request was submitted to the Admin Dashboard for approval.')
          );
        } else {
          const existingData = snap.data() as UserAccount;
          const nextSellerStatus: SellerApprovalStatus =
            existingData.sellerStatus ||
            (isPlatformAdmin ? 'approved' : (desiredRole === 'shop_owner' ? 'pending' : 'approved'));
          const nextAccountStatus: SellerApprovalStatus =
            existingData.accountStatus || (isPlatformAdmin ? 'approved' : 'pending');
          if (existingData.role !== desiredRole) {
            await updateDoc(userDocRef, {
              role: desiredRole,
              sellerStatus: nextSellerStatus,
              accountStatus: nextAccountStatus,
              updatedAt: serverTimestamp(),
            });
          }
          resolvedProfile = {
            ...existingData,
            role: desiredRole,
            sellerStatus: nextSellerStatus,
            accountStatus: nextAccountStatus,
          };
        }
      } catch {
        resolvedProfile = {
          uid: user.uid,
          email: user.email || cleanEmail || 'user@swmarketplace.cm',
          displayName: preferredName || user.displayName || cleanEmail.split('@')[0] || 'Member',
          role: desiredRole,
          sellerStatus: initialSellerStatus,
          accountStatus: initialAccountStatus,
          createdAt: new Date().toISOString(),
        };
      }
      setUserProfile(resolvedProfile);
      setAllUsersAdmin((prev) => {
        const next = [resolvedProfile, ...prev.filter((u) => u.uid !== resolvedProfile.uid)];
        try {
          localStorage.setItem('swmarketplace_registered_users', JSON.stringify(next));
        } catch {}
        return next;
      });
      routeToRoleDashboard(desiredRole);
    };

    try {
      if (authMode === 'signup') {
        try {
          const cred = await createUserWithEmailAndPassword(
            auth,
            cleanEmail,
            passwordInput
          );
          await updateProfile(cred.user, { displayName: trimmedName });
          await syncUserProfileAfterAuth(cred.user, trimmedName);
        } catch (signUpErr: unknown) {
          const errMsg =
            signUpErr instanceof Error ? signUpErr.message : String(signUpErr);
          if (errMsg.includes('auth/email-already-in-use')) {
            try {
              const signInCred = await signInWithEmailAndPassword(
                auth,
                cleanEmail,
                passwordInput
              );
              await syncUserProfileAfterAuth(signInCred.user, trimmedName);
            } catch {
              setAuthMode('signin');
              setAuthError(
                isFr
                  ? 'Cette adresse e-mail possède déjà un compte. Basculé sur « Se connecter ».'
                  : 'An account with this email already exists. Switched to Sign In.'
              );
              return;
            }
          } else {
            throw signUpErr;
          }
        }
      } else {
        const signInCred = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          passwordInput
        );
        await syncUserProfileAfterAuth(signInCred.user);
      }
      setIsAuthModalOpen(false);
      setEmailInput('');
      setPasswordInput('');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSetSpecificRole = async (nextRole: UserRole) => {
    setSelectedRoleInput(nextRole);
    routeToRoleDashboard(nextRole);
    if (!firebaseUser || !userProfile) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        role: nextRole,
        updatedAt: serverTimestamp(),
      });
      setUserProfile({ ...userProfile, role: nextRole });
    } catch {
      setUserProfile({ ...userProfile, role: nextRole });
    }
  };

  const handleToggleRole = async () => {
    const nextRole: UserRole =
      activeRole === 'shop_owner' ? 'customer' : 'shop_owner';
    await handleSetSpecificRole(nextRole);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setActiveSection('catalog');
  };

  // Save Customer Profile & Address
  const handleSaveCustomerProfile = async (
    name: string,
    phone: string,
    city: string,
    address: string
  ) => {
    if (!firebaseUser || !userProfile) return;
    const cleanName = name.trim().slice(0, 100) || userProfile.displayName;
    const cleanPhone = phone.trim().slice(0, 25);
    const cleanCity = city.trim().slice(0, 60);
    const cleanAddr = address.trim().slice(0, 300);

    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        displayName: cleanName,
        phone: cleanPhone,
        defaultCity: cleanCity,
        defaultAddress: cleanAddr,
        updatedAt: serverTimestamp(),
      });
      const updatedProfile: UserAccount = {
        ...userProfile,
        displayName: cleanName,
        phone: cleanPhone,
        defaultCity: cleanCity,
        defaultAddress: cleanAddr,
      };
      setUserProfile(updatedProfile);
      setAllUsersAdmin((prev) => {
        const next = [updatedProfile, ...prev.filter((u) => u.uid !== updatedProfile.uid)];
        try {
          localStorage.setItem('swmarketplace_registered_users', JSON.stringify(next));
        } catch {}
        return next;
      });
      pushNotification(
        isFr ? 'Profil Mis à Jour' : 'Profile Saved',
        `${cleanName} · ${cleanCity}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  // Place Order in Checkout (Calculates Admin Commission & Seller Net Payout)
  const handlePlaceOrder = async (details: {
    customerName: string;
    customerPhone: string;
    deliveryCity: string;
    deliveryAddress: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
  }): Promise<OrderRecord[]> => {
    const createdOrders: OrderRecord[] = [];
    const createdCommissionTxs: RevenueTransaction[] = [];
    const deliveryFeePerShop = DELIVERY_FEES_XAF[details.deliveryMethod];
    const commRate = marketplaceSettings.commissionPercent;

    for (const group of cartGroupedByShop) {
      const orderNum = `KM-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const itemsSummary = group.items
        .map((i) => `${i.quantity}x ${i.product.title} (${formatXaf(i.product.priceXaf)})`)
        .join('\n')
        .slice(0, 1500);

      const paymentStatus: PaymentStatus =
        details.paymentMethod === 'cash_on_delivery' ? 'cod_pending' : 'paid';

      const subtotalXaf = Math.round(group.subtotalXaf);
      const totalXaf = Math.round(subtotalXaf + deliveryFeePerShop);
      const adminCommissionXaf = Math.round((subtotalXaf * commRate) / 100);
      const sellerNetPayoutXaf = Math.max(0, totalXaf - adminCommissionXaf);

      const newOrder: OrderRecord = {
        id: orderId,
        orderNumber: orderNum,
        customerId: firebaseUser?.uid || 'guest_customer',
        customerName: details.customerName.slice(0, 100),
        customerPhone: details.customerPhone.slice(0, 25),
        deliveryCity: details.deliveryCity.slice(0, 60),
        deliveryAddress: details.deliveryAddress.slice(0, 300),
        deliveryMethod: details.deliveryMethod,
        paymentMethod: details.paymentMethod,
        paymentStatus,
        orderStatus: 'placed',
        shopId: group.shopId,
        shopName: group.shopName.slice(0, 100),
        itemsSummary,
        subtotalXaf,
        deliveryFeeXaf: deliveryFeePerShop,
        totalXaf,
        commissionPercent: commRate,
        adminCommissionXaf,
        sellerNetPayoutXaf,
      };

      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'orders', orderId), {
            orderNumber: newOrder.orderNumber,
            customerId: newOrder.customerId,
            customerName: newOrder.customerName,
            customerPhone: newOrder.customerPhone,
            deliveryCity: newOrder.deliveryCity,
            deliveryAddress: newOrder.deliveryAddress,
            deliveryMethod: newOrder.deliveryMethod,
            paymentMethod: newOrder.paymentMethod,
            paymentStatus: newOrder.paymentStatus,
            orderStatus: newOrder.orderStatus,
            shopId: newOrder.shopId,
            shopName: newOrder.shopName,
            itemsSummary: newOrder.itemsSummary,
            subtotalXaf: newOrder.subtotalXaf,
            deliveryFeeXaf: newOrder.deliveryFeeXaf,
            totalXaf: newOrder.totalXaf,
            commissionPercent: commRate,
            adminCommissionXaf,
            sellerNetPayoutXaf,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Local state fallback if unauthenticated
        }
      }
      createdOrders.push(newOrder);

      createdCommissionTxs.push({
        id: `tx_comm_${orderId}`,
        type: 'commission',
        shopId: group.shopId,
        shopName: group.shopName,
        description: `Order #${orderNum} Commission (${commRate}%)`,
        grossAmountXaf: totalXaf,
        adminEarnedXaf: adminCommissionXaf,
        paymentMethod: details.paymentMethod,
        createdAt: new Date().toLocaleDateString(),
      });
    }

    setFirestoreOrders((prev) => [...createdOrders, ...prev]);
    setRevenueTransactions((prev) => [...createdCommissionTxs, ...prev]);
    setCart([]);
    pushNotification(
      isFr ? 'Commande Confirmée !' : 'Order Confirmed!',
      `Code: #${createdOrders[0]?.orderNumber || 'KM'} (${details.paymentMethod.toUpperCase()})`
    );
    return createdOrders;
  };

  // Seller Subscription Plan Activation (Records Admin Subscription Revenue)
  const handleSelectSubscriptionPlan = async (plan: SubscriptionPlanConfig) => {
    const sellerId = firebaseUser?.uid || 'seller_account';
    const shopId = myShop?.ownerId || sellerId;
    const shopName =
      myShop?.shopName ||
      shopNameInput.trim() ||
      `${userProfile?.displayName || 'Seller'} Boutique`;

    if (myShop) {
      const updatedShop: ShopProfile = {
        ...myShop,
        subscriptionTier: plan.id,
        subscriptionPriceXaf: plan.priceXaf,
        subscriptionUpdatedAt: new Date().toLocaleDateString(),
      };
      setMyShop(updatedShop);
      setFirestoreShops((prev) => [
        updatedShop,
        ...prev.filter((s) => s.ownerId !== updatedShop.ownerId),
      ]);
      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'shops', firebaseUser.uid), {
            subscriptionTier: plan.id,
            subscriptionPriceXaf: plan.priceXaf,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // local fallback updated
        }
      }
    }

    const newTx: RevenueTransaction = {
      id: `tx_sub_${Date.now()}`,
      type: 'subscription',
      shopId,
      shopName,
      sellerId,
      description: `${isFr ? plan.nameFr : plan.nameEn} (${isFr ? plan.periodFr : plan.periodEn})`,
      grossAmountXaf: plan.priceXaf,
      adminEarnedXaf: plan.priceXaf,
      paymentMethod: 'mtn_momo',
      createdAt: new Date().toLocaleDateString(),
    };
    setRevenueTransactions((prev) => [newTx, ...prev]);
    pushNotification(
      isFr ? 'Abonnement Vendeur Activé' : 'Seller Subscription Activated',
      `${shopName}: ${isFr ? plan.nameFr : plan.nameEn} (${formatXaf(plan.priceXaf)})`
    );
  };

  // Paid Product Promotion Activation (Records Admin Promotion Revenue)
  const handlePromoteProduct = async (
    product: ProductItem,
    pkg: PromotionPackageConfig
  ) => {
    const updatedProd: ProductItem = {
      ...product,
      isPromoted: true,
      isFeatured: true,
      promotionPackageId: pkg.id,
      promotionPackageName: isFr ? pkg.nameFr : pkg.nameEn,
      promotionFeeXaf: pkg.priceXaf,
      promoBadge: product.promoBadge || (isFr ? 'Sponsorisé ★' : 'Promoted ★'),
    };

    setLocalPublishedProducts((prev) => [
      updatedProd,
      ...prev.filter((p) => p.id !== product.id),
    ]);
    setFirestoreProducts((prev) => [
      updatedProd,
      ...prev.filter((p) => p.id !== product.id),
    ]);

    if (firebaseUser && !product.id.startsWith('seed_')) {
      try {
        await updateDoc(doc(db, 'products', product.id), {
          isPromoted: true,
          isFeatured: true,
          promotionPackageId: pkg.id,
          promotionFeeXaf: pkg.priceXaf,
          promoBadge: updatedProd.promoBadge,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // local state updated
      }
    }

    const newTx: RevenueTransaction = {
      id: `tx_promo_${Date.now()}`,
      type: 'promotion',
      shopId: product.shopId,
      shopName: product.shopName,
      sellerId: firebaseUser?.uid,
      description: `Promoted "${product.title}" — ${isFr ? pkg.nameFr : pkg.nameEn} (${pkg.days}d)`,
      grossAmountXaf: pkg.priceXaf,
      adminEarnedXaf: pkg.priceXaf,
      paymentMethod: 'mtn_momo',
      createdAt: new Date().toLocaleDateString(),
    };
    setRevenueTransactions((prev) => [newTx, ...prev]);
    pushNotification(
      isFr ? 'Produit Sponsorisé Activé !' : 'Product Promotion Active!',
      `${product.title} — ${formatXaf(pkg.priceXaf)}`
    );
  };

  // Submit Product Review
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedProductModal || !firebaseUser) return;
    const revId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    try {
      await setDoc(doc(db, 'reviews', revId), {
        productId: selectedProductModal.id,
        shopId: selectedProductModal.shopId,
        authorId: firebaseUser.uid,
        authorName: (userProfile?.displayName || 'Customer').slice(0, 100),
        rating,
        comment: comment.slice(0, 800),
        isPublic: true,
        createdAt: serverTimestamp(),
      });
      pushNotification(
        isFr ? 'Avis Publié' : 'Review Published',
        `★ ${rating}/5 — ${selectedProductModal.title}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reviews/${revId}`);
    }
  };

  // Submit Support Ticket
  const handleSubmitSupportTicket = async (
    subject: string,
    message: string,
    contactEmail: string,
    name: string
  ) => {
    const ticketId = `tkt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const record: SupportTicket = {
      id: ticketId,
      userId: firebaseUser?.uid || 'guest_user',
      userName: name.trim().slice(0, 100) || 'Customer',
      userEmail: contactEmail.trim().slice(0, 200) || 'support@kmermarket.cm',
      subject: subject.trim().slice(0, 140),
      message: message.trim().slice(0, 1500),
      status: 'open',
    };
    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tickets', ticketId), {
          userId: record.userId,
          userName: record.userName,
          userEmail: record.userEmail,
          subject: record.subject,
          message: record.message,
          status: 'open',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch {
        // fallback
      }
    }
    setFirestoreTickets((prev) => [record, ...prev]);
    pushNotification(
      isFr ? 'Ticket Support Envoyé' : 'Support Ticket Sent',
      record.subject
    );
  };

  // Shop Owner CRUD (Submitted to Admin for Approval)
  const handleSaveShopProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    const cleanName = shopNameInput.trim().slice(0, 100);
    const cleanCity = shopCityInput.trim().slice(0, 60);
    const cleanWhatsapp = shopWhatsappInput.replace(/[^0-9+]/g, '').slice(0, 20);
    const cleanBio = shopBioInput.trim().slice(0, 500);

    if (cleanName.length < 2 || !/^\+?[0-9]{9,15}$/.test(cleanWhatsapp)) {
      setShopFeedback(
        isFr
          ? 'Veuillez vérifier le nom et le numéro WhatsApp (ex: 237696751829).'
          : 'Please check shop name and WhatsApp number (e.g. 237696751829).'
      );
      return;
    }

    setSavingShop(true);
    setShopFeedback(null);

    const targetShopStatus: SellerApprovalStatus = isCurrentUserAdmin ? 'approved' : 'pending';
    const isVerifiedStatus: boolean = isCurrentUserAdmin;
    const shopRef = doc(db, 'shops', firebaseUser.uid);

    try {
      if (myShop) {
        const updatedShop: ShopProfile = {
          ...myShop,
          shopName: cleanName,
          city: cleanCity,
          category: shopCategoryInput,
          whatsappNumber: cleanWhatsapp,
          bio: cleanBio,
          status: isCurrentUserAdmin ? 'approved' : (myShop.status || targetShopStatus),
          isVerified: isCurrentUserAdmin ? true : (myShop.isVerified ?? false),
          isPublic: true,
        };
        setMyShop(updatedShop);
        setFirestoreShops((prev) => [
          updatedShop,
          ...prev.filter((s) => s.ownerId !== firebaseUser.uid),
        ]);
        setLocalPublishedShops((prev) => [
          updatedShop,
          ...prev.filter((s) => s.ownerId !== firebaseUser.uid),
        ]);
        await updateDoc(shopRef, {
          shopName: cleanName,
          city: cleanCity,
          category: shopCategoryInput,
          whatsappNumber: cleanWhatsapp,
          bio: cleanBio,
          isPublic: true,
          updatedAt: serverTimestamp(),
        });
      } else {
        const createdShop: ShopProfile = {
          ownerId: firebaseUser.uid,
          shopName: cleanName,
          city: cleanCity,
          category: shopCategoryInput,
          whatsappNumber: cleanWhatsapp,
          bio: cleanBio,
          status: targetShopStatus,
          isVerified: isVerifiedStatus,
          isPublic: true,
        };
        setMyShop(createdShop);
        setFirestoreShops((prev) => [
          createdShop,
          ...prev.filter((s) => s.ownerId !== firebaseUser.uid),
        ]);
        setLocalPublishedShops((prev) => [
          createdShop,
          ...prev.filter((s) => s.ownerId !== firebaseUser.uid),
        ]);
        await setDoc(shopRef, {
          ...createdShop,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Sync the user's role to shop_owner and attach shop details
      const fallbackName = cleanName || 'SWMARKETPLACE Seller';
      const baseDisplayName = (userProfile && userProfile.displayName) ? userProfile.displayName : fallbackName;
      const baseEmail = (userProfile && userProfile.email) ? userProfile.email : (firebaseUser.email || 'seller@swmarketplace.cm');
      const updatedUserAcc: UserAccount = {
        ...(userProfile || {}),
        uid: firebaseUser.uid,
        email: baseEmail,
        displayName: baseDisplayName,
        role: 'shop_owner',
        hasShop: true,
        shopName: cleanName,
        shopCity: cleanCity,
        shopWhatsapp: cleanWhatsapp,
        sellerStatus: isCurrentUserAdmin ? 'approved' : ((userProfile && userProfile.sellerStatus) || targetShopStatus),
        accountStatus: 'approved',
        createdAt: (userProfile && userProfile.createdAt) || new Date().toISOString(),
      };
      setUserProfile(updatedUserAcc);
      setAllUsersAdmin((prev) => {
        const next = [
          updatedUserAcc,
          ...prev.filter((u) => u.uid !== updatedUserAcc.uid),
        ];
        try {
          localStorage.setItem('swmarketplace_registered_users', JSON.stringify(next));
        } catch {}
        return next;
      });

      try {
        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          {
            ...updatedUserAcc,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {
        // User doc may be created offline/fallback
      }

      setShopFeedback(
        isCurrentUserAdmin
          ? (isFr ? '✓ Boutique enregistrée et approuvée avec succès !' : '✓ Shop saved and approved successfully!')
          : (isFr ? '⏳ Boutique enregistrée ! Elle est soumise à l’Administrateur pour approbation.' : '⏳ Shop saved! It has been submitted to the Admin for approval.')
      );
      pushNotification(
        isFr ? 'Boutique Enregistrée' : 'Shop Profile Saved',
        `${cleanName} (${cleanCity})`
      );
    } catch {
      setShopFeedback(
        isFr
          ? 'Boutique enregistrée localement avec succès !'
          : 'Shop registered successfully!'
      );
    } finally {
      setSavingShop(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProdImageStatus('processing');
    setProdImageFileName(file.name);
    setProductFeedback(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setProdImageStatus('error');
      setProductFeedback(
        isFr
          ? 'Erreur lors de la lecture du fichier image.'
          : 'Error reading image file from device.'
      );
    };
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl) {
        setProdImageStatus('error');
        return;
      }

      // Compress & resize via HTML5 Canvas so any phone/camera photo fits safely in Firestore
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 900;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            let compressed = canvas.toDataURL('image/jpeg', 0.82);
            if (compressed.length > 650000) {
              compressed = canvas.toDataURL('image/jpeg', 0.62);
            }
            setProdImageUrlInput(compressed);
            setProdImageSizeKb(Math.max(1, Math.round((compressed.length * 0.75) / 1024)));
            setProdImageStatus('ready');
          } else if (rawDataUrl.length <= 680000) {
            setProdImageUrlInput(rawDataUrl);
            setProdImageSizeKb(Math.max(1, Math.round(file.size / 1024)));
            setProdImageStatus('ready');
          } else {
            setProdImageStatus('error');
          }
        } catch {
          if (rawDataUrl.length <= 680000) {
            setProdImageUrlInput(rawDataUrl);
            setProdImageSizeKb(Math.max(1, Math.round(file.size / 1024)));
            setProdImageStatus('ready');
          } else {
            setProdImageStatus('error');
          }
        }
      };
      img.onerror = () => {
        setProdImageStatus('error');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditProduct = (prod: ProductItem) => {
    setEditingProductId(prod.id);
    setProdTitleInput(prod.title);
    setProdPriceInput(String(prod.priceXaf));
    setProdOrigPriceInput(prod.originalPriceXaf ? String(prod.originalPriceXaf) : '');
    setProdStockInput(String(prod.stock ?? 20));
    setProdPromoBadgeInput(prod.promoBadge || '');
    setProdCategoryInput(prod.category);
    setProdImageUrlInput(prod.imageUrl);
    setProdImageFileName('Uploaded Product Photo');
    setProdImageSizeKb(Math.max(12, Math.round((prod.imageUrl.length * 0.75) / 1024)));
    setProdImageStatus('ready');
    setProdTargetShopId(prod.shopId);
    setProdDescInput(prod.description);
  };

  const handleViewShopProducts = (shopId: string) => {
    setSelectedShopIdFilter(shopId);
    setSelectedCategory('all');
    setSelectedCity('all');
    setSearchQuery('');
    setMaxPriceFilter(5000000);
    setInStockOnly(false);
    setMinRatingFilter(0);
    setActiveSection('catalog');
    setTimeout(() => {
      const gridEl = document.getElementById('marketplace-grid');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handlePublishOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const isApprovedByAdmin = isCurrentUserAdmin;
    const initialApprovalStatus: 'approved' | 'pending' = isApprovedByAdmin ? 'approved' : 'pending';

    const cleanTitle = prodTitleInput.trim().slice(0, 120);
    const cleanDesc = prodDescInput.trim().slice(0, 1200) || `${cleanTitle} — Available on SWMARKETPLACE in FCFA.`;
    const numericPrice = Math.round(Number(prodPriceInput));
    const numericOrigPrice = prodOrigPriceInput
      ? Math.round(Number(prodOrigPriceInput))
      : numericPrice;
    const numericStock = Math.max(0, Math.round(Number(prodStockInput) || 0));
    const cleanPromo = prodPromoBadgeInput.trim().slice(0, 40);
    const fallbackImage = PRESET_PRODUCT_IMAGES[0].url;
    const cleanImageUrl = (prodImageUrlInput.trim() || fallbackImage).slice(0, 700000);

    if (cleanTitle.length < 2 || numericPrice <= 0) {
      setProductFeedback(
        isFr
          ? 'Veuillez renseigner un titre et un prix en FCFA.'
          : 'Please enter a valid product title and FCFA price.'
      );
      return;
    }

    setPublishingProduct(true);
    setProductFeedback(null);

    try {
      const currentOwnerId = firebaseUser?.uid || ADMIN_UID;
      // Determine target shop (either selected shop by Admin/Seller, user's shop, or first seed shop)
      let activeShop: ShopProfile | null =
        (prodTargetShopId && allShops.find((s) => s.ownerId === prodTargetShopId)) ||
        myShop;

      if (!activeShop) {
        const autoShopName =
          shopNameInput.trim().slice(0, 100) ||
          `${userProfile?.displayName || 'SWMARKETPLACE'} Boutique`;
        const autoCity = shopCityInput.trim().slice(0, 60) || 'Douala';
        const rawWa = shopWhatsappInput.replace(/[^0-9+]/g, '');
        const autoWa = /^\+?[0-9]{9,15}$/.test(rawWa) ? rawWa : '237696751829';
        const autoBio =
          shopBioInput.trim().slice(0, 500) ||
          'Verified Cameroonian retail store on SWMARKETPLACE.';

        const createdShop: ShopProfile = {
          ownerId: currentOwnerId,
          shopName: autoShopName,
          city: autoCity,
          category: prodCategoryInput,
          whatsappNumber: autoWa,
          bio: autoBio,
          isVerified: isCurrentUserAdmin,
          isPublic: true,
          status: isCurrentUserAdmin ? 'approved' : 'pending',
        };

        if (firebaseUser) {
          try {
            await setDoc(doc(db, 'shops', firebaseUser.uid), {
              ...createdShop,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch {
            // fallback to local shop state
          }
        }
        setMyShop(createdShop);
        setFirestoreShops((prev) => [
          createdShop,
          ...prev.filter((s) => s.ownerId !== createdShop.ownerId),
        ]);
        setLocalPublishedShops((prev) => [
          createdShop,
          ...prev.filter((s) => s.ownerId !== createdShop.ownerId),
        ]);
        activeShop = createdShop;
      }

      if (editingProductId) {
        const updatedItem: ProductItem = {
          id: editingProductId,
          title: cleanTitle,
          description: cleanDesc,
          priceXaf: numericPrice,
          originalPriceXaf: numericOrigPrice,
          stock: numericStock,
          isFeatured: true,
          promoBadge: cleanPromo,
          category: prodCategoryInput,
          imageUrl: cleanImageUrl,
          shopId: activeShop.ownerId,
          shopName: activeShop.shopName,
          shopCity: activeShop.city,
          whatsappNumber: activeShop.whatsappNumber,
          ownerId: currentOwnerId,
          isPublic: true,
          isApproved: isApprovedByAdmin,
          approvalStatus: initialApprovalStatus,
        };

        setLocalStockOverrides((prev) => ({
          ...prev,
          [editingProductId]: numericStock,
        }));
        setLocalPublishedProducts((prev) => [
          updatedItem,
          ...prev.filter((p) => p.id !== editingProductId),
        ]);
        setFirestoreProducts((prev) => [
          updatedItem,
          ...prev.filter((p) => p.id !== editingProductId),
        ]);

        if (firebaseUser && !editingProductId.startsWith('seed_')) {
          try {
            await updateDoc(doc(db, 'products', editingProductId), {
              title: cleanTitle,
              description: cleanDesc,
              priceXaf: numericPrice,
              originalPriceXaf: numericOrigPrice,
              stock: numericStock,
              promoBadge: cleanPromo,
              category: prodCategoryInput,
              imageUrl: cleanImageUrl,
              shopId: activeShop.ownerId,
              shopName: activeShop.shopName,
              shopCity: activeShop.city,
              whatsappNumber: activeShop.whatsappNumber,
              isPublic: true,
              isApproved: isApprovedByAdmin,
              approvalStatus: initialApprovalStatus,
              updatedAt: serverTimestamp(),
            });
          } catch {
            // Local state already updated immediately
          }
        }
        setEditingProductId(null);
      } else {
        const newProductId = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const createdItem: ProductItem = {
          id: newProductId,
          title: cleanTitle,
          description: cleanDesc,
          priceXaf: numericPrice,
          originalPriceXaf: numericOrigPrice,
          stock: numericStock,
          isFeatured: true,
          promoBadge: cleanPromo,
          category: prodCategoryInput,
          imageUrl: cleanImageUrl,
          shopId: activeShop.ownerId,
          shopName: activeShop.shopName,
          shopCity: activeShop.city,
          whatsappNumber: activeShop.whatsappNumber,
          ownerId: currentOwnerId,
          isPublic: true,
          isApproved: isApprovedByAdmin,
          approvalStatus: initialApprovalStatus,
        };

        // Immediately add to local & live product state so it displays right away in Catalog, Shop & Inventory
        setLocalPublishedProducts((prev) => [createdItem, ...prev]);
        setFirestoreProducts((prev) => [createdItem, ...prev]);

        if (firebaseUser) {
          try {
            await setDoc(doc(db, 'products', newProductId), {
              title: cleanTitle,
              description: cleanDesc,
              priceXaf: numericPrice,
              originalPriceXaf: numericOrigPrice,
              stock: numericStock,
              isFeatured: true,
              promoBadge: cleanPromo,
              category: prodCategoryInput,
              imageUrl: cleanImageUrl,
              shopId: activeShop.ownerId,
              shopName: activeShop.shopName,
              shopCity: activeShop.city,
              whatsappNumber: activeShop.whatsappNumber,
              ownerId: firebaseUser.uid,
              isPublic: true,
              isApproved: isApprovedByAdmin,
              approvalStatus: initialApprovalStatus,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch {
            // Product is already persisted in localPublishedProducts and displayed in UI
          }
        }
      }

      // Reset filters so the newly added product is guaranteed to be visible in Catalog & Shop
      setSelectedCategory('all');
      setSelectedCity('all');
      setSearchQuery('');
      if (numericPrice > maxPriceFilter) {
        setMaxPriceFilter(Math.max(5000000, numericPrice * 2));
      }

      setProdTitleInput('');
      setProdPriceInput('');
      setProdOrigPriceInput('');
      setProdStockInput('20');
      setProdPromoBadgeInput('');
      setProdDescInput('');
      setProdImageUrlInput('');
      setProdImageFileName('');
      setProdImageSizeKb(0);
      setProdImageStatus('empty');
      setProductFeedback(
        isApprovedByAdmin
          ? (isFr
              ? `✓ Produit « ${cleanTitle} » ajouté et mis en ligne avec succès !`
              : `✓ Product "${cleanTitle}" added and live in Catalog!`)
          : (isFr
              ? `⏳ Produit « ${cleanTitle} » soumis avec succès ! L’Administrateur a été notifié pour l’approuver dans son tableau de bord.`
              : `⏳ Product "${cleanTitle}" submitted successfully! The Admin has been notified to approve it in the dashboard.`)
      );
      pushNotification(
        isApprovedByAdmin
          ? (isFr ? 'Nouveau Produit En Ligne !' : 'New Product Live!')
          : (isFr ? 'Produit Soumis pour Approbation' : 'Product Submitted for Approval'),
        `${cleanTitle} (${formatXaf(numericPrice)}) · ${activeShop.shopName}`
      );
    } catch (error) {
      setProductFeedback(
        error instanceof Error ? error.message : 'Error publishing product'
      );
    } finally {
      setPublishingProduct(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const targetId = productToDelete.id;
    setProductToDelete(null);
    setLocalPublishedProducts((prev) => prev.filter((p) => p.id !== targetId));
    setFirestoreProducts((prev) => prev.filter((p) => p.id !== targetId));
    if (firebaseUser && !targetId.startsWith('seed_')) {
      try {
        await deleteDoc(doc(db, 'products', targetId));
      } catch {
        // Local state already updated
      }
    }
  };

  // Admin Product Approval Handlers (Single Product & Bulk Seller Approval)
  const handleAdminApproveProduct = async (productId: string, approve: boolean) => {
    const targetStatus = approve ? 'approved' : 'pending';

    setLocalPublishedProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, isApproved: approve, approvalStatus: targetStatus, isPublic: true }
          : p
      )
    );
    setFirestoreProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, isApproved: approve, approvalStatus: targetStatus, isPublic: true }
          : p
      )
    );

    try {
      const saved = localStorage.getItem('swmarketplace_local_products');
      if (saved) {
        const prods: ProductItem[] = JSON.parse(saved);
        const updated = prods.map((p) =>
          p.id === productId
            ? { ...p, isApproved: approve, approvalStatus: targetStatus, isPublic: true }
            : p
        );
        localStorage.setItem('swmarketplace_local_products', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    if (!productId.startsWith('seed_')) {
      try {
        await updateDoc(doc(db, 'products', productId), {
          isApproved: approve,
          approvalStatus: targetStatus,
          isPublic: true,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // local state fallback
      }
    }

    pushNotification(
      approve
        ? (isFr ? '✓ Produit Approuvé !' : '✓ Product Approved!')
        : (isFr ? '⏳ Produit Mis en Attente' : '⏳ Product Put on Hold'),
      isFr
        ? (approve
            ? 'Le produit est maintenant visible par tous les clients dans le Catalogue.'
            : 'Le produit a été retiré du catalogue public.')
        : (approve
            ? 'The product is now visible to all customers in the Catalog.'
            : 'The product is now hidden from public catalog.')
    );
  };

  const handleAdminApproveAllSellerProducts = async (sellerId: string) => {
    const sellerShop = allShops.find((s) => s.ownerId === sellerId);
    const sellerProdIds = allProducts
      .filter(
        (p) => p.ownerId === sellerId || (sellerShop && p.shopId === sellerShop.ownerId)
      )
      .map((p) => p.id);

    if (sellerProdIds.length === 0) return;

    setLocalPublishedProducts((prev) =>
      prev.map((p) =>
        sellerProdIds.includes(p.id)
          ? { ...p, isApproved: true, approvalStatus: 'approved', isPublic: true }
          : p
      )
    );
    setFirestoreProducts((prev) =>
      prev.map((p) =>
        sellerProdIds.includes(p.id)
          ? { ...p, isApproved: true, approvalStatus: 'approved', isPublic: true }
          : p
      )
    );

    try {
      const saved = localStorage.getItem('swmarketplace_local_products');
      if (saved) {
        const prods: ProductItem[] = JSON.parse(saved);
        const updated = prods.map((p) =>
          sellerProdIds.includes(p.id)
            ? { ...p, isApproved: true, approvalStatus: 'approved', isPublic: true }
            : p
        );
        localStorage.setItem('swmarketplace_local_products', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    for (const pid of sellerProdIds) {
      if (!pid.startsWith('seed_')) {
        try {
          await updateDoc(doc(db, 'products', pid), {
            isApproved: true,
            approvalStatus: 'approved',
            isPublic: true,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // ignore
        }
      }
    }

    pushNotification(
      isFr ? '✓ Produits Vendeur Approuvés !' : '✓ Seller Products Approved!',
      isFr
        ? `${sellerProdIds.length} produit(s) mis en ligne avec succès.`
        : `${sellerProdIds.length} product(s) published live successfully.`
    );
  };

  // Admin & Seller Order/Shop Moderation Handlers
  const handleUpdateShopStatus = async (
    shopId: string,
    status: SellerApprovalStatus
  ) => {
    const isApproved = status === 'approved';
    setLocalShopStatusOverrides((prev) => ({
      ...prev,
      [shopId]: status,
    }));
    setLocalSellerStatusOverrides((prev) => ({
      ...prev,
      [shopId]: status,
    }));
    setFirestoreShops((prev) =>
      prev.map((s) =>
        s.ownerId === shopId ? { ...s, status, isVerified: isApproved } : s
      )
    );
    setAllUsersAdmin((prev) =>
      prev.map((u) => (u.uid === shopId ? { ...u, sellerStatus: status } : u))
    );
    if (myShop?.ownerId === shopId) {
      setMyShop((prev) =>
        prev ? { ...prev, status, isVerified: isApproved } : null
      );
    }
    if (userProfile?.uid === shopId) {
      setUserProfile((prev) =>
        prev ? { ...prev, sellerStatus: status } : null
      );
    }

    if (!shopId.startsWith('seed_')) {
      try {
        await updateDoc(doc(db, 'shops', shopId), {
          status,
          isVerified: isApproved,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Local override already persisted
      }
      try {
        await updateDoc(doc(db, 'users', shopId), {
          sellerStatus: status,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Local override already persisted
      }
    }

    pushNotification(
      isFr ? 'Statut Boutique Mis à Jour' : 'Shop Status Updated',
      `${shopId}: ${status.toUpperCase()}`
    );
  };

  const handleDeleteShop = async (shopId: string) => {
    setLocalDeletedShopIds((prev) =>
      prev.includes(shopId) ? prev : [...prev, shopId]
    );
    setFirestoreShops((prev) => prev.filter((s) => s.ownerId !== shopId));
    setLocalPublishedProducts((prev) => prev.filter((p) => p.shopId !== shopId));
    setFirestoreProducts((prev) => prev.filter((p) => p.shopId !== shopId));
    if (myShop?.ownerId === shopId) {
      setMyShop(null);
    }

    if (!shopId.startsWith('seed_')) {
      try {
        await deleteDoc(doc(db, 'shops', shopId));
      } catch {
        // Local deletion already applied
      }
    }
    pushNotification(
      isFr ? 'Boutique Supprimée' : 'Shop Deleted by Admin',
      shopId
    );
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    orderStatus: OrderStatus,
    paymentStatus: PaymentStatus
  ) => {
    setFirestoreOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus, paymentStatus } : o))
    );
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus,
        paymentStatus,
        updatedAt: serverTimestamp(),
      });
    } catch {
      // local state updated
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    setFirestoreTickets((prev) =>
      prev.map((tk) => (tk.id === ticketId ? { ...tk, status: 'resolved' } : tk))
    );
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status: 'resolved',
        updatedAt: serverTimestamp(),
      });
    } catch {
      // local state updated
    }
  };

  const handleAdminUpdateUserRole = async (uid: string, nextRole: UserRole) => {
    const defaultStatus: SellerApprovalStatus =
      nextRole === 'shop_owner' ? 'pending' : 'approved';
    setAllUsersAdmin((prev) =>
      prev.map((u) =>
        u.uid === uid
          ? { ...u, role: nextRole, sellerStatus: u.sellerStatus || defaultStatus }
          : u
      )
    );
    if (userProfile?.uid === uid) {
      setUserProfile((prev) =>
        prev
          ? { ...prev, role: nextRole, sellerStatus: prev.sellerStatus || defaultStatus }
          : null
      );
    }
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: nextRole,
        updatedAt: serverTimestamp(),
      });
    } catch {
      // local state updated
    }
  };

  const handleAdminUpdateUserSellerStatus = async (
    uid: string,
    status: SellerApprovalStatus
  ) => {
    setLocalSellerStatusOverrides((prev) => ({
      ...prev,
      [uid]: status,
    }));
    setLocalShopStatusOverrides((prev) => ({
      ...prev,
      [uid]: status,
    }));
    setAllUsersAdmin((prev) =>
      prev.map((u) =>
        u.uid === uid ? { ...u, sellerStatus: status, accountStatus: status } : u
      )
    );
    if (userProfile?.uid === uid) {
      setUserProfile((prev) =>
        prev ? { ...prev, sellerStatus: status, accountStatus: status } : null
      );
    }
    if (myShop?.ownerId === uid) {
      setMyShop((prev) =>
        prev ? { ...prev, status, isVerified: status === 'approved' } : null
      );
    }

    try {
      const saved = localStorage.getItem('swmarketplace_registered_users');
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        const updated = parsed.map((u) =>
          u.uid === uid ? { ...u, sellerStatus: status, accountStatus: status } : u
        );
        localStorage.setItem('swmarketplace_registered_users', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    try {
      await updateDoc(doc(db, 'users', uid), {
        sellerStatus: status,
        accountStatus: status,
        updatedAt: serverTimestamp(),
      });
    } catch {
      // local state updated
    }
    try {
      await updateDoc(doc(db, 'shops', uid), {
        status,
        isVerified: status === 'approved',
        updatedAt: serverTimestamp(),
      });
    } catch {
      // shop may not exist yet
    }
    pushNotification(
      isFr ? 'Statut Vendeur Modifié' : 'Seller Status Updated',
      `Status → ${status.toUpperCase()}`
    );
  };

  const handleAdminDeleteUser = async (uid: string) => {
    setAllUsersAdmin((prev) => prev.filter((u) => u.uid !== uid));
    setLocalDeletedShopIds((prev) => (prev.includes(uid) ? prev : [...prev, uid]));
    setFirestoreShops((prev) => prev.filter((s) => s.ownerId !== uid));
    setLocalPublishedProducts((prev) =>
      prev.filter((p) => p.ownerId !== uid && p.shopId !== uid)
    );
    setFirestoreProducts((prev) =>
      prev.filter((p) => p.ownerId !== uid && p.shopId !== uid)
    );
    try {
      const saved = localStorage.getItem('swmarketplace_registered_users');
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        localStorage.setItem(
          'swmarketplace_registered_users',
          JSON.stringify(parsed.filter((u) => u.uid !== uid))
        );
      }
    } catch {
      // ignore
    }
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch {
      // local state updated
    }
    try {
      await deleteDoc(doc(db, 'shops', uid));
    } catch {
      // shop may not exist
    }
    pushNotification(
      isFr ? 'Vendeur / Compte Supprimé' : 'Seller / User Account Deleted',
      uid
    );
  };

  const handleAdminDeleteReview = async (reviewId: string) => {
    setFirestoreReviews((prev) => prev.filter((r) => r.id !== reviewId));
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch {
      // local state updated
    }
  };

  const getCategoryLabel = (cat: ProductCategory): string => {
    switch (cat) {
      case 'gourmet':
        return t.catGourmet;
      case 'fashion':
        return t.catFashion;
      case 'beauty':
        return t.catBeauty;
      case 'electronics':
        return t.catElectronics;
      case 'household':
        return t.catHousehold;
      case 'crafts':
        return t.catCrafts;
    }
  };

  // Role-Based Navigation: Each user sees only the dashboard appropriate to their active role
  const navItems: { id: ActiveSection; label: string }[] = useMemo(() => {
    const items: { id: ActiveSection; label: string }[] = [
      { id: 'catalog', label: t.navCatalog },
      { id: 'boutiques', label: t.navBoutiques },
    ];

    if (isCurrentUserAdmin) {
      items.push({
        id: 'admin_dashboard',
        label: isFr ? 'Tableau de Bord Admin' : 'Admin Dashboard',
      });
    } else if (isCurrentUserSeller) {
      items.push({
        id: 'seller_dashboard',
        label: isFr ? 'Tableau de Bord Vendeur' : 'Seller Dashboard',
      });
    } else {
      items.push({
        id: 'account',
        label: isFr ? 'Tableau de Bord Client' : 'Customer Dashboard',
      });
    }

    items.push({ id: 'support', label: t.navSupport });
    return items;
  }, [isCurrentUserAdmin, isCurrentUserSeller, isFr, t]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* TOP BAR CONTRACT: Brand Logo & Name — Distinct Menu Buttons — Menu Search Bar — Primary Actions */}
      <header className="sticky top-0 z-30 min-h-16 py-2 border-b-2 border-[var(--border-strong)] bg-[var(--bg-canvas)]/95 backdrop-blur-md px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3">
        {/* Zone 1: Brand Logo & Title */}
        <a
          href="#catalog"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('catalog');
          }}
          className="whitespace-nowrap shrink-0 inline-flex items-center gap-3 group"
        >
          <BrandLogo size="md" />
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-2xl font-extrabold tracking-tight leading-none flex items-center">
              <span className="text-[var(--accent-warm)]">SW</span>
              <span className="text-[var(--text-primary)]">MARKET</span>
              <span className="text-[var(--accent-primary)]">PLACE</span>
            </span>
            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest uppercase text-[var(--text-secondary)] mt-0.5">
              {isFr ? 'Boutiques & Marché Vérifié' : 'Verified Shops & Marketplace'}
            </span>
          </div>
        </a>

        {/* Zone 2: Distinct Styled Menu Buttons + Menu Bar Search Input */}
        <div className="hidden xl:flex items-center gap-2">
          <nav aria-label="Primary Navigation" className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`h-10 px-3.5 rounded-xl text-xs font-extrabold tracking-wide whitespace-nowrap transition-all duration-150 cursor-pointer border-2 ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--accent-primary)]/15'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Menu Bar Search Bar */}
          <div className="relative w-64 2xl:w-80 ml-1">
            <Search className="w-4 h-4 text-[var(--accent-primary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeSection !== 'catalog') {
                  setActiveSection('catalog');
                }
              }}
              placeholder={t.menuSearchPlaceholder}
              aria-label={t.menuSearchPlaceholder}
              className="w-full h-10 pl-9 pr-7 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] text-xs font-extrabold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[var(--accent-warm)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Language, Theme, Cart, Auth & Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto xl:ml-0">
          <button
            type="button"
            onClick={() => setLang((prev) => (prev === 'en' ? 'fr' : 'en'))}
            aria-label={t.langSwitchAria}
            className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] text-[11px] sm:text-xs font-extrabold uppercase hover:bg-[var(--accent-primary)]/15 transition-colors whitespace-nowrap cursor-pointer"
          >
            {lang === 'en' ? 'EN · FR' : 'FR · EN'}
          </button>

          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label={darkMode ? t.themeLightAria : t.themeDarkAria}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-center hover:bg-[var(--accent-primary)]/15 transition-colors cursor-pointer shrink-0"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[var(--accent-primary)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--accent-primary)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`${t.cartBtn} (${totalCartCount})`}
            className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t.cartBtn}</span>
            <span className="font-mono-tabular font-extrabold text-[11px] sm:text-xs px-1.5 py-0.5 rounded-md bg-white text-[var(--accent-primary)]">
              {totalCartCount}
            </span>
          </button>

          {authReady && firebaseUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveSection(
                    isCurrentUserAdmin
                      ? 'admin_dashboard'
                      : isCurrentUserSeller
                      ? 'seller_dashboard'
                      : 'account'
                  )
                }
                className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-[var(--accent-primary)] text-white text-[11px] sm:text-xs font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                {isCurrentUserCustomer ? (
                  <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                ) : isCurrentUserAdmin ? (
                  <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                ) : (
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                )}
                <span className="max-w-[90px] sm:max-w-[140px] truncate">
                  {isCurrentUserAdmin
                    ? t.roleAdminBadge
                    : isCurrentUserSeller
                    ? t.roleShopOwnerBadge
                    : t.roleCustomerBadge}
                </span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label={t.signOutBtn}
                className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] text-xs font-extrabold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">{t.signOutBtn}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setIsAuthModalOpen(true);
              }}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-[var(--accent-primary)] text-white text-xs sm:text-sm font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors whitespace-nowrap cursor-pointer"
            >
              {t.signInBtn}
            </button>
          )}

          {/* Desktop Notification Trigger (interchanged to far right on desktop; moved to dedicated responsive bar on mobile/tablet) */}
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="Notifications"
            className="hidden xl:flex relative h-10 px-3 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] items-center gap-1.5 hover:bg-[var(--accent-primary)]/15 transition-colors cursor-pointer shrink-0"
          >
            <Bell className="w-4 h-4 text-[var(--accent-warm)]" />
            <span className="text-xs font-extrabold text-[var(--text-primary)]">
              {isFr ? 'Alertes' : 'Alerts'}
            </span>
            {notifications.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-warm)] text-white text-[10px] font-extrabold leading-none">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Distinct Menu Buttons + Search Bar + Relocated Notification Bar */}
      <div className="xl:hidden border-b-2 border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 sm:px-4 py-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap border-2 shrink-0 ${
                  activeSection === item.id
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-strong)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Relocated Mobile/Tablet Notification Pill in Menu Bar */}
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="Notifications"
            className={`h-8 px-2.5 rounded-xl border-2 flex items-center gap-1.5 text-[11px] font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              isNotifOpen
                ? 'bg-[var(--accent-warm)] text-white border-[var(--accent-primary)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-strong)]'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
            <span>{isFr ? 'Notifs' : 'Alerts'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-extrabold leading-tight">
              {notifications.length}
            </span>
          </button>
        </div>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-[var(--accent-primary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeSection !== 'catalog') {
                setActiveSection('catalog');
              }
            }}
            placeholder={t.menuSearchPlaceholder}
            aria-label={t.menuSearchPlaceholder}
            className="w-full h-9 sm:h-10 pl-10 pr-8 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] text-xs font-extrabold text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[var(--accent-warm)]"
            >
              ✕
            </button>
          )}
        </div>
        {/* Live Compact Notification Strip (Always visible on mobile & tablet, click to expand resized full notification box) */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--border-strong)] text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Bell className="w-3.5 h-3.5 text-[var(--accent-warm)] shrink-0" />
              <p className="truncate text-[var(--text-primary)] font-bold">
                <span className="font-extrabold text-[var(--accent-primary)]">
                  {notifications[0].title}:{' '}
                </span>
                <span className="text-[var(--text-secondary)]">{notifications[0].message}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="px-2 py-0.5 rounded-lg bg-[var(--accent-primary)] text-white text-[10px] font-extrabold shrink-0 cursor-pointer"
            >
              {isNotifOpen
                ? isFr
                  ? 'Fermer'
                  : 'Hide'
                : isFr
                ? 'Voir'
                : 'View'}
            </button>
          </div>
        )}
      </div>

      {/* RESIZED, VIEWPORT-SAFE REAL NOTIFICATION PANEL (Responsive across Mobile Phones, Tablets & Desktops) */}
      {isNotifOpen && (
        <div className="fixed left-3 right-3 top-24 sm:left-auto sm:right-6 sm:top-20 sm:w-72 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl p-2.5 sm:p-3 z-50 space-y-1.5 max-h-[55vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <Bell className="w-3.5 h-3.5 text-[var(--accent-warm)] shrink-0" />
              <span className="text-[11px] sm:text-xs font-extrabold text-[var(--text-primary)] truncate">
                {isFr ? 'Notifications Directes' : 'Live Notifications'} ({notifications.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsNotifOpen(false)}
              aria-label="Close notifications"
              className="h-5 w-5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex items-center justify-center text-[10px] font-extrabold text-[var(--accent-warm)] shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[11px] leading-snug space-y-0.5 break-words"
              >
                <p className="font-extrabold text-[var(--accent-primary)]">{n.title}</p>
                <p className="font-semibold text-[var(--text-secondary)]">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {/* VIEW 1: HOME PAGE & PRODUCT CATALOG */}
        {activeSection === 'catalog' && (
          <div className="space-y-12">
            {/* 1. Home Hero with Marketplace Name, Bold Colored Typography & Clear "Shop Now" Button */}
            <section className="modern-hero-surface rounded-2xl p-6 sm:p-10 border-2 border-[var(--border-strong)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-primary)] border-2 border-[var(--border-strong)] shadow-xs">
                  <BrandLogo size="sm" />
                  <p className="text-xs font-extrabold tracking-widest uppercase text-[var(--accent-primary)]">
                    {t.heroKicker}
                  </p>
                </div>

                <div className="space-y-2">
                  <h1
                    key={`hero-title-${lang}`}
                    className="font-display text-3xl sm:text-5xl font-extrabold leading-[1.12] tracking-tight text-[var(--text-primary)]"
                    style={{ textWrap: 'balance' }}
                  >
                    <AnimatedCharacters text={t.heroTitle} />
                  </h1>

                  <div className="h-9 flex items-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${lang}-${spotlightWordIdx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="font-display text-xl sm:text-2xl font-extrabold kinetic-gradient-text"
                      >
                        <AnimatedCharacters
                          text={`✦ ${t.heroAnimatedWords[spotlightWordIdx]}`}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <p className="text-base sm:text-lg font-bold text-[var(--text-secondary)] leading-relaxed max-w-[62ch]">
                  {t.heroSubtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <a
                    href="#marketplace-grid"
                    className="h-12 px-7 rounded-xl bg-[var(--accent-primary)] text-white border-2 border-[var(--accent-primary)] text-sm font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-md"
                  >
                    <span>{t.shopNowBtn}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveSection('boutiques')}
                    className="h-12 px-6 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-extrabold hover:bg-[var(--accent-primary)]/15 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {t.heroSecondaryCta} ({allShops.length})
                  </button>
                </div>

                <p className="text-xs font-extrabold text-[var(--accent-primary)] pt-1">
                  {t.heroTrustNote}
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-[var(--bg-surface)] border-2 border-[var(--border-strong)] shadow-md">
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Modern Cameroonian retail showcase: designer handbag, sneakers, 5G smartphone, espresso maker, and skincare"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/35 to-transparent flex items-end p-6">
                    <div className="text-white space-y-1">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                        Douala · Yaoundé · Bamenda · Bafoussam · Buea
                      </p>
                      <p className="font-display text-lg sm:text-xl font-extrabold">
                        {isFr
                          ? 'Mode, Smartphones 5G, Maison, Beauté & Supermarché (FCFA)'
                          : 'Fashion, 5G Phones, Home, Beauty & Groceries (FCFA)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Payment System Banner (Replaces Display Currency Selector — Strictly FCFA) */}
            <CameroonPaymentBanner
              lang={lang}
              cartCount={totalCartCount}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
            />

            {/* 1. Main Product Categories */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                  {t.shopClassificationLabel}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSection('boutiques')}
                  className="text-xs font-extrabold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <span>{t.popularShopsTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(
                  [
                    {
                      id: 'gourmet',
                      label: t.catGourmet,
                      shopHint: 'Supermarket, Spices & Groceries',
                    },
                    {
                      id: 'fashion',
                      label: t.catFashion,
                      shopHint: 'Clothes, Sneakers, Heels & Bags',
                    },
                    {
                      id: 'beauty',
                      label: t.catBeauty,
                      shopHint: 'Skincare, Perfumes & Makeup',
                    },
                    {
                      id: 'electronics',
                      label: t.catElectronics,
                      shopHint: '5G Phones, Audio & Smartwatches',
                    },
                    {
                      id: 'household',
                      label: t.catHousehold,
                      shopHint: 'Air Fryers, Blenders & Cookware',
                    },
                    {
                      id: 'crafts',
                      label: t.catCrafts,
                      shopHint: 'Vases, Wall Art & Home Decor',
                    },
                  ] as const
                ).map((catCard) => {
                  const isSelected = selectedCategory === catCard.id;
                  return (
                    <button
                      key={catCard.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategory((prev) =>
                          prev === catCard.id ? 'all' : catCard.id
                        )
                      }
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-150 hover:-translate-y-0.5 cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-md'
                          : 'border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      <p
                        className={`text-xs font-mono-tabular font-extrabold ${
                          isSelected ? 'text-emerald-100' : 'text-[var(--accent-primary)]'
                        }`}
                      >
                        {shopCountsByCategory[catCard.id]} {t.navBoutiques.toLowerCase()}
                      </p>
                      <p
                        className={`font-display text-sm sm:text-base font-extrabold mt-1 truncate ${
                          isSelected ? 'text-white' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {catCard.label}
                      </p>
                      <p
                        className={`text-[11px] font-bold mt-1 truncate ${
                          isSelected ? 'text-white/90' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {catCard.shopHint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 1. Special Offers / Promotions & Featured Cameroonian Shops */}
            <section className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)]/80 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[var(--border-hairline)] pb-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent-warm)] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{t.promoBannerKicker}</span>
                  </p>
                  <h2 className="font-display text-2xl font-extrabold text-[var(--text-primary)] mt-1">
                    {t.promoBannerTitle}
                  </h2>
                  <p className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">
                    {t.promoBannerDesc}
                  </p>
                </div>
                <a
                  href="#marketplace-grid"
                  className="h-10 px-5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold inline-flex items-center gap-2 self-start md:self-center shadow-xs"
                >
                  <span>{t.shopNowBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Popular Verified Shops Strip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent-primary)]">
                    {t.popularShopsTitle}
                  </h3>
                  {selectedShopIdFilter && (
                    <button
                      type="button"
                      onClick={() => setSelectedShopIdFilter(null)}
                      className="px-3 py-1 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-extrabold cursor-pointer"
                    >
                      ✕ {t.clearFilter}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allShops.map((shop) => {
                    const shopProductsPreview = allProducts.filter(
                      (p) => p.shopId === shop.ownerId
                    );
                    const isShopSelected = selectedShopIdFilter === shop.ownerId;
                    return (
                      <div
                        key={shop.ownerId}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                          isShopSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 ring-2 ring-[var(--accent-primary)]'
                            : 'border-[var(--border-strong)] bg-[var(--bg-elevated)]'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-sm font-extrabold text-[var(--accent-primary)]">
                                <BadgeCheck className="w-4 h-4 text-[var(--accent-warm)] shrink-0" />
                                <span className="truncate">{shop.shopName}</span>
                              </div>
                              <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                                {summarizeText(shop.bio, 65)}
                              </p>
                              <p className="text-[10px] font-extrabold text-[var(--accent-warm)] mt-1">
                                {shop.city} · {shopProductsPreview.length} {t.productsCountLabel} · +{shop.whatsappNumber}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleViewShopProducts(shop.ownerId)}
                              className="px-3 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-extrabold shrink-0 cursor-pointer shadow-xs"
                            >
                              {t.filterByShop}
                            </button>
                          </div>

                          {/* Products Under Each Shop (Clickable for Quick View or Add to Cart) */}
                          {shopProductsPreview.length > 0 && (
                            <div className="pt-2 border-t border-[var(--border-hairline)] space-y-1.5">
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                                {isFr ? 'Produits de cette boutique :' : 'Products in this shop:'}
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {shopProductsPreview.slice(0, 4).map((sp) => (
                                  <div
                                    key={sp.id}
                                    onClick={() => setSelectedProductModal(sp)}
                                    className="p-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <img
                                      src={sp.imageUrl}
                                      alt={sp.title}
                                      referrerPolicy="no-referrer"
                                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-[var(--border-strong)]"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[11px] font-extrabold text-[var(--text-primary)] truncate">
                                        {lang === 'fr' && sp.titleFr ? sp.titleFr : sp.title}
                                      </p>
                                      <p className="font-mono-tabular text-[10px] font-extrabold text-[var(--accent-primary)]">
                                        {formatXaf(sp.priceXaf)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 3 & 4. Full Product Catalog with Advanced Search & Filtering */}
            <section id="marketplace-grid" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                    <AnimatedCharacters text={t.catalogHeading} />
                  </h2>
                  <p className="text-xs font-extrabold text-[var(--accent-warm)] mt-1 tabular-nums">
                    {filteredProducts.length} {t.catalogCountSuffix} · 100% FCFA
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full lg:w-96">
                  <Search className="w-4 h-4 text-[var(--accent-primary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {/* 4. Multi-Criteria Filter Bar: Location, Seller, Price Range, Stock, Rating */}
              <div className="p-4 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-center">
                {/* City Filter */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold text-[var(--text-primary)]"
                >
                  <option value="all">{t.filterAllCities}</option>
                  {CAMEROON_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                {/* Seller Filter */}
                <select
                  value={selectedShopIdFilter || ''}
                  onChange={(e) => setSelectedShopIdFilter(e.target.value || null)}
                  className="h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold text-[var(--text-primary)]"
                >
                  <option value="">{t.filterAllSellers}</option>
                  {allShops.map((s) => (
                    <option key={s.ownerId} value={s.ownerId}>
                      {s.shopName} ({s.city})
                    </option>
                  ))}
                </select>

                {/* Max Price Range Filter in FCFA */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-extrabold text-[var(--text-secondary)]">
                    <span>{t.filterMaxPriceLabel}:</span>
                    <span className="font-mono-tabular text-[var(--accent-primary)]">
                      {formatXaf(maxPriceFilter)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={5000000}
                    step={5000}
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full accent-[var(--accent-primary)] cursor-pointer"
                  />
                </div>

                {/* Minimum Star Rating Filter */}
                <select
                  value={minRatingFilter}
                  onChange={(e) => setMinRatingFilter(Number(e.target.value))}
                  className="h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold text-[var(--text-primary)]"
                >
                  <option value={0}>{t.filterMinRating}: Any ★</option>
                  <option value={4}>★★★★☆ (4.0+)</option>
                  <option value={5}>★★★★★ (5.0)</option>
                </select>

                {/* Availability Checkbox */}
                <label className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-[var(--accent-primary)]"
                  />
                  <span>{t.filterInStockOnly}</span>
                </label>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-strong)] overflow-x-auto">
                {(
                  [
                    { id: 'all', label: t.catAll },
                    { id: 'gourmet', label: t.catGourmet },
                    { id: 'fashion', label: t.catFashion },
                    { id: 'beauty', label: t.catBeauty },
                    { id: 'electronics', label: t.catElectronics },
                    { id: 'household', label: t.catHousehold },
                    { id: 'crafts', label: t.catCrafts },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCategory === tab.id
                        ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                        : 'text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/15'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Active Shop Filter Banner */}
              {selectedShopIdFilter && (
                <div className="p-4 rounded-2xl border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-extrabold">
                    <Store className="w-4 h-4 text-white" />
                    <span>
                      {t.showingShopFilter}{' '}
                      <strong className="underline">
                        {allShops.find((s) => s.ownerId === selectedShopIdFilter)?.shopName ||
                          selectedShopIdFilter}
                      </strong>{' '}
                      ({filteredProducts.length} {t.catalogCountSuffix})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedShopIdFilter(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-[var(--accent-primary)] text-xs font-extrabold cursor-pointer"
                  >
                    ✕ {isFr ? 'Voir Toutes les Boutiques' : 'Show All Shops'}
                  </button>
                </div>
              )}

              {/* Product Cards Grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)]/50 space-y-3">
                  <p className="text-base font-extrabold text-[var(--text-primary)]">
                    {isFr
                      ? 'Aucun produit ne correspond à vos filtres.'
                      : 'No products match your filter criteria.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedCity('all');
                      setSelectedShopIdFilter(null);
                      setMaxPriceFilter(5000000);
                      setInStockOnly(false);
                      setMinRatingFilter(0);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold"
                  >
                    {t.clearFilter}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {filteredProducts.map((product, index) => {
                    const displayTitle =
                      lang === 'fr' && product.titleFr ? product.titleFr : product.title;
                    const displayDesc =
                      lang === 'fr' && product.descriptionFr
                        ? product.descriptionFr
                        : product.description;
                    const formattedPrice = formatXaf(product.priceXaf);
                    const waLink = buildWhatsAppUrl(
                      product.whatsappNumber,
                      t.whatsappSinglePrefill(
                        displayTitle,
                        formattedPrice,
                        product.shopName
                      )
                    );
                    const isAdded = recentlyAddedId === product.id;
                    const isFav = favoriteIds.includes(product.id);
                    const stockQty = product.stock ?? 15;
                    const { avg, count } = getProductRating(product.id);

                    return (
                      <motion.article
                        key={product.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.28,
                          delay: Math.min(index * 0.04, 0.24),
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="group rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5 shadow-xs"
                      >
                        <div className="relative aspect-4/3 w-full bg-[var(--bg-surface)] overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={displayTitle}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = HERO_IMAGE_URL;
                            }}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                          />

                          {/* Promo Offer Tag */}
                          {product.promoBadge && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-extrabold shadow-xs">
                              {product.promoBadge}
                            </span>
                          )}

                          {/* Save Favorite Heart Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleFavorite(product.id)}
                            aria-label="Save to favorites"
                            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white text-[var(--accent-primary)] border border-[var(--border-strong)] flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer"
                          >
                            <Heart
                              className={`w-4 h-4 ${isFav ? 'fill-[var(--accent-primary)]' : ''}`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProductModal(product)}
                            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white border border-white text-xs font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {t.viewDetails}
                          </button>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-extrabold text-[var(--accent-warm)]">
                              <span className="uppercase tracking-wider truncate">
                                {getCategoryLabel(product.category)} · {product.shopCity}
                              </span>
                              <span className="text-[var(--accent-primary)] shrink-0">
                                ★ {avg} ({count})
                              </span>
                            </div>

                            <h3 className="text-base font-extrabold text-[var(--text-primary)] leading-snug line-clamp-1">
                              {displayTitle}
                            </h3>

                            <p className="text-xs font-semibold text-[var(--text-secondary)] line-clamp-1 leading-snug">
                              {summarizeText(displayDesc, 70)}
                            </p>

                            <div className="flex items-center justify-between text-xs font-bold pt-1">
                              <span className="text-[var(--text-primary)] truncate">
                                {product.shopName}
                              </span>
                              <span className="font-mono-tabular text-[var(--accent-primary)] shrink-0">
                                {stockQty > 0
                                  ? `${stockQty} ${t.inStockLabel}`
                                  : t.outOfStockLabel}
                              </span>
                            </div>
                          </div>

                          <div className="pt-3 border-t-2 border-[var(--border-hairline)] space-y-3">
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-baseline gap-2">
                                <span className="font-mono-tabular text-lg font-extrabold text-[var(--accent-primary)]">
                                  {formattedPrice}
                                </span>
                                {product.originalPriceXaf &&
                                  product.originalPriceXaf > product.priceXaf && (
                                    <span className="font-mono-tabular text-xs font-bold text-[var(--text-muted)] line-through">
                                      {formatXaf(product.originalPriceXaf)}
                                    </span>
                                  )}
                              </div>
                              <span className="text-[11px] font-extrabold text-[var(--accent-warm)]">
                                MoMo / OM / COD
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <button
                                type="button"
                                disabled={stockQty <= 0}
                                onClick={() => handleAddToCart(product)}
                                className={`h-10 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                                  isAdded
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)]'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{t.addedToCart}</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5 text-white" />
                                    <span>{t.addToCart}</span>
                                  </>
                                )}
                              </button>

                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-10 px-3 rounded-xl bg-[var(--whatsapp-brand)] hover:opacity-95 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-opacity whitespace-nowrap"
                              >
                                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{t.contactWhatsApp}</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: CLASSIFIED CAMEROONIAN BOUTIQUES DIRECTORY */}
        {activeSection === 'boutiques' && (
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[var(--border-hairline)] pb-6">
              <div>
                <h1 className="font-display text-3xl font-extrabold text-[var(--text-primary)]">
                  <AnimatedCharacters text={t.boutiquesHeading} />
                </h1>
                <p className="text-sm font-bold text-[var(--text-secondary)] mt-2 max-w-2xl">
                  {t.boutiquesSubtitle}
                </p>
              </div>

              <select
                value={selectedBoutiqueCity}
                onChange={(e) => setSelectedBoutiqueCity(e.target.value)}
                className="h-10 px-3 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] text-sm font-extrabold text-[var(--text-primary)]"
              >
                <option value="all">{t.filterAllCities}</option>
                {CAMEROON_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-strong)] overflow-x-auto">
              {(
                [
                  { id: 'all', label: t.allShopCategories },
                  { id: 'gourmet', label: t.catGourmet },
                  { id: 'fashion', label: t.catFashion },
                  { id: 'beauty', label: t.catBeauty },
                  { id: 'electronics', label: t.catElectronics },
                  { id: 'household', label: t.catHousehold },
                  { id: 'crafts', label: t.catCrafts },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedBoutiqueCategory(tab.id)}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                    selectedBoutiqueCategory === tab.id
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/15'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono-tabular text-[11px] opacity-80">
                    ({shopCountsByCategory[tab.id]})
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classifiedShops.map((shop, idx) => {
                const shopCat = getShopClassification(shop);
                const shopProductsList = allProducts.filter(
                  (p) => p.shopId === shop.ownerId
                );
                const shopProductCount = shopProductsList.length;
                const cityCoords = CAMEROON_CITY_COORDS[shop.city];
                const regionName = cityCoords
                  ? lang === 'fr'
                    ? cityCoords.regionFr
                    : cityCoords.regionEn
                  : 'Cameroon';

                const waUrl = buildWhatsAppUrl(
                  shop.whatsappNumber,
                  isFr
                    ? `Bonjour ${shop.shopName}, je vous contacte depuis SWMARKETPLACE.`
                    : `Hello ${shop.shopName}, I am reaching out from SWMARKETPLACE.`
                );

                return (
                  <motion.article
                    key={shop.ownerId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                        <span className="uppercase tracking-wider text-[var(--accent-warm)]">
                          {getCategoryLabel(shopCat)}
                        </span>
                        <span>·</span>
                        <span className="text-[var(--text-primary)]">
                          {shop.city} ({regionName})
                        </span>
                        <span>·</span>
                        <span className="text-[var(--accent-primary)] flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          {shop.isVerified !== false
                            ? t.verifiedSellerLabel
                            : t.pendingSellerLabel}
                        </span>
                      </div>

                      <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)]">
                        {shop.shopName}
                      </h2>

                      <p className="text-sm font-semibold text-[var(--text-secondary)] line-clamp-1">
                        {summarizeText(shop.bio, 85)}
                      </p>

                      {/* Curated Products & Live Stock per Shop */}
                      {shopProductsList.length > 0 && (
                        <div className="pt-2 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-extrabold text-[var(--accent-primary)] uppercase tracking-wider">
                              {isFr
                                ? `${shopProductsList.length} Produits & Stock en Boutique (FCFA) :`
                                : `${shopProductsList.length} Shop Products & Stock (FCFA):`}
                            </p>
                            {(isCurrentUserAdmin ||
                              (isCurrentUserSeller &&
                                (myShop?.ownerId === shop.ownerId || !myShop))) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setProdTargetShopId(shop.ownerId);
                                  setActiveSection(
                                    isCurrentUserAdmin ? 'admin_dashboard' : 'seller_dashboard'
                                  );
                                }}
                                className="text-[11px] font-extrabold text-[var(--accent-warm)] hover:underline cursor-pointer"
                              >
                                + {isFr ? 'Ajouter Produit / Gérer Stock' : 'Add Product / Set Stock'}
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {shopProductsList.map((sp) => {
                              const spStock = sp.stock ?? 15;
                              const canManageThisShopStock =
                                isCurrentUserAdmin ||
                                (isCurrentUserSeller &&
                                  (sp.ownerId === firebaseUser?.uid ||
                                    myShop?.ownerId === shop.ownerId));
                              return (
                                <div
                                  key={sp.id}
                                  className="p-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col justify-between gap-2"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedProductModal(sp)}
                                      className="flex items-center gap-2 min-w-0 text-left flex-1 cursor-pointer group"
                                    >
                                      <img
                                        src={sp.imageUrl}
                                        alt={sp.title}
                                        referrerPolicy="no-referrer"
                                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[var(--border-strong)]"
                                      />
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] truncate">
                                          {lang === 'fr' && sp.titleFr ? sp.titleFr : sp.title}
                                        </p>
                                        <p className="font-mono-tabular text-[11px] font-extrabold text-[var(--accent-primary)]">
                                          {formatXaf(sp.priceXaf)}
                                        </p>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={spStock <= 0}
                                      onClick={() => handleAddToCart(sp)}
                                      className="h-7 px-2 rounded-lg bg-[var(--accent-primary)] text-white text-[10px] font-extrabold shrink-0 cursor-pointer disabled:opacity-40"
                                    >
                                      + {t.cartBtn}
                                    </button>
                                  </div>

                                  {/* Role-Based Stock Display / Specifier */}
                                  <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-hairline)] text-[11px] font-extrabold">
                                    <span className="text-[var(--text-secondary)]">
                                      {isFr ? 'Stock disponible :' : 'Available Stock:'}
                                    </span>
                                    {canManageThisShopStock ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUpdateProductStock(sp, Math.max(0, spStock - 1))
                                          }
                                          aria-label="Decrease stock"
                                          className="w-6 h-6 rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] flex items-center justify-center cursor-pointer"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          min={0}
                                          max={9999}
                                          value={spStock}
                                          onChange={(e) =>
                                            handleUpdateProductStock(sp, Number(e.target.value))
                                          }
                                          aria-label="Available stock quantity"
                                          className="w-12 h-6 px-1 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-center font-mono-tabular text-[11px] font-extrabold text-[var(--accent-primary)]"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateProductStock(sp, spStock + 1)}
                                          aria-label="Increase stock"
                                          className="w-6 h-6 rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] flex items-center justify-center cursor-pointer"
                                        >
                                          +
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="font-mono-tabular text-[var(--accent-primary)]">
                                        {spStock} {t.inStockLabel}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-hairline)]">
                      <span className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]">
                        {shopProductCount} {t.productsCountLabel} · +{shop.whatsappNumber}
                      </span>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleViewShopProducts(shop.ownerId)}
                          className="h-10 px-4 rounded-xl bg-[var(--accent-primary)] text-white border-2 border-[var(--accent-primary)] text-xs font-extrabold cursor-pointer shadow-xs"
                        >
                          {t.filterByShop}
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 px-4 rounded-xl bg-[var(--whatsapp-brand)] text-white text-xs font-extrabold inline-flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{t.chatWithShop}</span>
                        </a>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}

        {/* VIEW 3: CUSTOMER DASHBOARD (Profile, Addresses, Order History, Tracking, Favorites) */}
        {activeSection === 'account' && (
          <div className="space-y-6">
            {firebaseUser && (
              <div className="p-4 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-extrabold">
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)] text-white uppercase tracking-wider">
                    {isFr ? 'Espace Client Actif' : 'Customer Dashboard Active'}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    {userProfile?.displayName} ({userProfile?.email})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-[var(--text-secondary)]">
                    {isFr ? 'Accès par Rôle :' : 'Role Access:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetSpecificRole('customer')}
                    className={`h-8 px-3 rounded-lg text-xs font-extrabold border cursor-pointer ${
                      isCurrentUserCustomer
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-strong)]'
                    }`}
                  >
                    {t.roleCustomerBadge}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSpecificRole('shop_owner')}
                    className={`h-8 px-3 rounded-lg text-xs font-extrabold border cursor-pointer ${
                      isCurrentUserSeller
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-strong)]'
                    }`}
                  >
                    {t.roleShopOwnerBadge}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSpecificRole('admin')}
                    className={`h-8 px-3 rounded-lg text-xs font-extrabold border cursor-pointer ${
                      isCurrentUserAdmin
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-strong)]'
                    }`}
                  >
                    {t.roleAdminBadge}
                  </button>
                </div>
              </div>
            )}

            {userProfile?.accountStatus === 'pending' && !isCurrentUserAdmin && (
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-400 bg-amber-50 text-amber-950 flex items-start gap-3.5 shadow-xs">
                <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white text-[11px] font-extrabold uppercase tracking-wider">
                      {isFr ? 'Demande de Compte en Attente' : 'Account Request Pending'}
                    </span>
                    <span className="text-xs font-bold text-amber-800">
                      {isFr ? 'Statut : Soumis à l’Administrateur' : 'Status: Submitted to Admin'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-amber-900">
                    {isFr
                      ? 'Votre compte a bien été créé ! La demande a été transmise au tableau de bord administrateur qui peut l’approuver à tout moment. Vous pouvez d’ores et déjà renseigner votre profil et vos coordonnées ci-dessous.'
                      : 'Your account was created successfully! The request was sent to the Admin Dashboard for approval. You can manage your profile and details below.'}
                  </p>
                </div>
              </div>
            )}
            <CustomerAccountView
              lang={lang}
              userProfile={userProfile}
              orders={firestoreOrders}
              favoriteProducts={favoriteProductsList}
              onSaveProfile={handleSaveCustomerProfile}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={handleAddToCart}
              onOpenAuth={() => {
                setSelectedRoleInput('customer');
                setIsAuthModalOpen(true);
              }}
            />
          </div>
        )}

        {/* VIEW 4: DEDICATED SELLER DASHBOARD (Strictly Seller's Own Shop, Products, Stock, Orders & Sales) */}
        {activeSection === 'seller_dashboard' && (
          <section className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-[var(--border-hairline)] pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Store className="w-3.5 h-3.5" />
                  <span>
                    {isFr ? 'Espace Vendeur' : 'Seller Hub'}
                  </span>
                </div>
                <h1 className="font-display text-3xl font-extrabold text-[var(--text-primary)]">
                  <AnimatedCharacters
                    text={
                      isFr
                        ? 'Tableau de Bord Vendeur'
                        : 'Seller Dashboard'
                    }
                  />
                </h1>
                <p className="text-sm font-bold text-[var(--text-secondary)] mt-1">
                  {isFr
                    ? 'Gérez votre boutique, vos produits, votre stock et vos ventes.'
                    : 'Manage your shop, products, stock, and sales in FCFA.'}
                </p>
              </div>

              {firebaseUser && userProfile && (
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)]">
                  <span className="text-xs font-extrabold text-[var(--text-secondary)] px-2">
                    {t.roleSwitchLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetSpecificRole('customer')}
                    className={`h-9 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                      isCurrentUserCustomer
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-hairline)]'
                    }`}
                  >
                    {t.roleCustomerBadge}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSpecificRole('shop_owner')}
                    className={`h-9 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                      isCurrentUserSeller
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-hairline)]'
                    }`}
                  >
                    {t.roleShopOwnerBadge}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSpecificRole('admin')}
                    className={`h-9 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                      isCurrentUserAdmin
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-hairline)]'
                    }`}
                  >
                    {t.roleAdminBadge}
                  </button>
                </div>
              )}
            </div>

            {!firebaseUser ? (
              <div className="p-8 sm:p-12 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] max-w-xl mx-auto text-center space-y-5">
                <Store className="w-12 h-12 text-[var(--accent-primary)] mx-auto" />
                <h2 className="font-display text-2xl font-extrabold">
                  {isFr
                    ? 'Connexion au Tableau de Bord Vendeur'
                    : 'Sign In to Seller Dashboard'}
                </h2>
                <p className="text-xs font-bold text-[var(--text-secondary)]">
                  {isFr
                    ? 'Accès réservé aux vendeurs pour gérer leur propre boutique, leurs produits, leur stock et leurs ventes.'
                    : 'Role-restricted access for sellers to manage their own shop, products, stock, orders, and sales.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoleInput('shop_owner');
                      setAuthMode('signin');
                      setIsAuthModalOpen(true);
                    }}
                    className="h-11 px-5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold cursor-pointer"
                  >
                    {isFr ? 'Connexion Vendeur' : 'Sign In as Seller'}
                  </button>
                </div>
              </div>
            ) : !isCurrentUserSeller ? (
              <div className="p-8 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] max-w-2xl mx-auto text-center space-y-4">
                <Lock className="w-10 h-10 text-[var(--accent-primary)] mx-auto" />
                <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)]">
                  {isFr
                    ? 'Accès Basé sur le Rôle : Tableau de Bord Vendeur Réservé'
                    : 'Role-Based Access Control: Seller Role Required'}
                </h2>
                <p className="text-xs font-bold text-[var(--text-secondary)]">
                  {isFr
                    ? 'Votre compte actif n’est pas en mode Vendeur. Passez au rôle Vendeur ci-dessous pour gérer votre boutique, vos produits et votre stock.'
                    : 'Your active role is currently not Seller. Switch to Seller Role below to manage your own shop, products, stock, and sales.'}
                </p>
                <button
                  type="button"
                  onClick={() => handleSetSpecificRole('shop_owner')}
                  className="h-10 px-5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold cursor-pointer"
                >
                  {isFr ? 'Activer le Rôle Vendeur' : 'Switch to Seller Role'}
                </button>
              </div>
            ) : (
              <>
                {/* SELLER & SHOP APPROVAL STATUS BANNER */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSellerApprovedByAdmin
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-amber-300 bg-amber-50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          isSellerApprovedByAdmin
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {isSellerApprovedByAdmin ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isFr ? 'APPROUVÉ' : 'APPROVED'}</span>
                          </>
                        ) : currentSellerStatus === 'pending' ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{isFr ? 'EN ATTENTE' : 'PENDING APPROVAL'}</span>
                          </>
                        ) : currentSellerStatus === 'suspended' ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{isFr ? 'SUSPENDU' : 'SUSPENDED'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>{isFr ? 'BANNI' : 'BANNED'}</span>
                          </>
                        )}
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-white border border-[var(--border-strong)] text-xs font-extrabold text-[var(--text-primary)]">
                        {isFr ? 'Boutique :' : 'Shop:'}{' '}
                        {myShop
                          ? `${myShop.shopName} (${currentShopStatus.toUpperCase()})`
                          : isFr
                          ? 'Non créée'
                          : 'Not Created'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {isSellerApprovedByAdmin
                        ? isFr
                          ? '✓ Compte approuvé. Créez votre boutique et ajoutez vos produits.'
                          : '✓ Account approved. You can manage your shop and add products.'
                        : currentSellerStatus === 'pending'
                        ? isFr
                          ? '⏳ En attente d’approbation Admin.'
                          : '⏳ Pending Admin approval to create a shop and add products.'
                        : isFr
                        ? '⛔ Compte suspendu ou banni par l’Admin.'
                        : '⛔ Account suspended or banned by Admin.'}
                    </p>
                  </div>

                  {!isSellerApprovedByAdmin && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSetSpecificRole('admin')}
                        className="h-10 px-4 rounded-xl bg-[var(--accent-primary)] text-white border-2 border-[var(--accent-primary)] text-xs font-extrabold cursor-pointer whitespace-nowrap"
                      >
                        {isFr
                          ? 'Ouvrir Admin pour Approuver →'
                          : 'Open Admin Dashboard to Approve →'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Seller's Own Shop Profile + Add/Edit Own Product Form */}
                  <div className="lg:col-span-5 space-y-8">
                    <form
                      onSubmit={handleSaveShopProfile}
                      className="p-4 sm:p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)]">
                          {isFr ? 'Créer / Gérer Ma Boutique' : 'Create / Manage My Shop'}
                        </h2>
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                            isSellerApprovedByAdmin
                              ? 'bg-[var(--accent-primary)] text-white'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isSellerApprovedByAdmin
                            ? isFr
                              ? '✓ Approuvé'
                              : '✓ Approved'
                            : `⏳ ${currentSellerStatus.toUpperCase()}`}
                        </span>
                      </div>

                      {!isSellerApprovedByAdmin && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-extrabold text-amber-900">
                          {isFr
                            ? '🔒 Approbation Admin requise pour créer une boutique.'
                            : '🔒 Admin approval required to create a shop.'}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                          {t.shopNameLabel}
                        </label>
                        <input
                          type="text"
                          required
                          value={shopNameInput}
                          onChange={(e) => setShopNameInput(e.target.value)}
                          placeholder={t.shopNamePlaceholder}
                          className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                            {t.shopCategoryLabel}
                          </label>
                          <select
                            value={shopCategoryInput}
                            onChange={(e) =>
                              setShopCategoryInput(e.target.value as ProductCategory)
                            }
                            className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                          >
                            <option value="gourmet">{t.catGourmet}</option>
                            <option value="fashion">{t.catFashion}</option>
                            <option value="beauty">{t.catBeauty}</option>
                            <option value="electronics">{t.catElectronics}</option>
                            <option value="household">{t.catHousehold}</option>
                            <option value="crafts">{t.catCrafts}</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                            {t.shopCityLabel}
                          </label>
                          <select
                            value={shopCityInput}
                            onChange={(e) => setShopCityInput(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                          >
                            {CAMEROON_CITIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                          {t.shopWhatsappLabel}
                        </label>
                        <input
                          type="tel"
                          required
                          value={shopWhatsappInput}
                          onChange={(e) => setShopWhatsappInput(e.target.value)}
                          placeholder={t.shopWhatsappPlaceholder}
                          className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                          {t.shopBioLabel}
                        </label>
                        <textarea
                          rows={2}
                          value={shopBioInput}
                          onChange={(e) => setShopBioInput(e.target.value)}
                          placeholder={t.shopBioPlaceholder}
                          className="w-full p-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-semibold"
                        />
                      </div>

                      {shopFeedback && (
                        <p className="text-xs font-extrabold text-[var(--accent-primary)]">
                          {shopFeedback}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={savingShop}
                        className="w-full h-11 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {savingShop
                          ? t.savingBtn
                          : !isSellerApprovedByAdmin
                          ? (isFr
                              ? '📤 Soumettre la Boutique pour Approbation Admin'
                              : '📤 Submit Shop for Admin Approval')
                          : myShop
                          ? t.saveShopBtn
                          : (isFr
                              ? '✓ Créer Ma Boutique (Approuvé)'
                              : '✓ Create My Shop (Approved)')}
                      </button>
                    </form>

                    {/* Seller Add / Edit Own Product Form (Locked strictly to Seller's Own Shop & Requires Admin Approval) */}
                    <form
                      onSubmit={(e) => {
                        setProdTargetShopId(myShop?.ownerId || firebaseUser.uid);
                        handlePublishOrUpdateProduct(e);
                      }}
                      className="p-4 sm:p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)]">
                          {editingProductId ? t.editProductModeTitle : t.addProductCardTitle}
                        </h2>
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                            isSellerApprovedByAdmin
                              ? 'bg-[var(--accent-primary)] text-white'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isSellerApprovedByAdmin
                            ? isFr
                              ? '✓ Autorisé'
                              : '✓ Approved'
                            : `⏳ ${currentSellerStatus.toUpperCase()}`}
                        </span>
                      </div>

                      {!isSellerApprovedByAdmin && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-extrabold text-amber-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            {isFr
                              ? 'ℹ️ Vous pouvez ajouter vos produits dès maintenant : ils sont transmis directement à l’Administrateur qui les approuve dans son tableau de bord.'
                              : 'ℹ️ You can add your products now: they are sent directly to the Admin Dashboard for approval before going live.'}
                          </span>
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-xs font-extrabold flex items-center justify-between">
                        <span className="text-[var(--text-secondary)]">
                          {isFr ? 'Boutique Associée :' : 'Assigned Seller Shop:'}
                        </span>
                        <span className="text-[var(--accent-primary)]">
                          {myShop?.shopName ||
                            shopNameInput.trim() ||
                            `${userProfile?.displayName || 'Seller'} Boutique`}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                          {t.prodTitleLabel}
                        </label>
                        <input
                          type="text"
                          required
                          value={prodTitleInput}
                          onChange={(e) => setProdTitleInput(e.target.value)}
                          placeholder={t.prodTitlePlaceholder}
                          className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                            {t.prodPriceLabel}
                          </label>
                          <input
                            type="number"
                            required
                            min={50}
                            value={prodPriceInput}
                            onChange={(e) => setProdPriceInput(e.target.value)}
                            placeholder="15000"
                            className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                            {t.prodStockLabel}
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={prodStockInput}
                            onChange={(e) => setProdStockInput(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                            {t.prodCategoryLabel}
                          </label>
                          <select
                            value={prodCategoryInput}
                            onChange={(e) =>
                              setProdCategoryInput(e.target.value as ProductCategory)
                            }
                            className="w-full h-10 px-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-bold"
                          >
                            <option value="gourmet">{t.catGourmet}</option>
                            <option value="fashion">{t.catFashion}</option>
                            <option value="beauty">{t.catBeauty}</option>
                            <option value="electronics">{t.catElectronics}</option>
                            <option value="household">{t.catHousehold}</option>
                            <option value="crafts">{t.catCrafts}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                            {t.prodOrigPriceLabel}
                          </label>
                          <input
                            type="number"
                            value={prodOrigPriceInput}
                            onChange={(e) => setProdOrigPriceInput(e.target.value)}
                            placeholder="18000"
                            className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-mono-tabular font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                            {t.prodPromoBadgeLabel}
                          </label>
                          <input
                            type="text"
                            value={prodPromoBadgeInput}
                            onChange={(e) => setProdPromoBadgeInput(e.target.value)}
                            placeholder="Promo -15%"
                            className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Direct Device Image Uploader + Preset Gallery + Live Image Status */}
                      <div className="space-y-3 p-4 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)]/60">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-[var(--text-primary)]">
                            {isFr
                              ? 'Photo du Produit (Import Direct depuis l’Appareil)'
                              : 'Product Photo (Direct Upload from Device)'}
                          </span>

                          {prodImageStatus === 'ready' && (
                            <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)] text-white text-[11px] font-extrabold inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              {isFr
                                ? `Statut Image : Prête (${prodImageSizeKb} KB)`
                                : `Image Status: Ready & Verified (${prodImageSizeKb} KB)`}
                            </span>
                          )}
                          {prodImageStatus === 'processing' && (
                            <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)] text-white text-[11px] font-extrabold inline-flex items-center gap-1">
                              {isFr
                                ? 'Statut Image : Optimisation en cours...'
                                : 'Image Status: Optimizing photo...'}
                            </span>
                          )}
                          {prodImageStatus === 'error' && (
                            <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-extrabold inline-flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {isFr
                                ? 'Erreur fichier'
                                : 'File Error'}
                            </span>
                          )}
                          {prodImageStatus === 'empty' && (
                            <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--border-strong)] text-[11px] font-extrabold">
                              {isFr
                                ? 'Statut Image : En attente de photo'
                                : 'Image Status: Waiting for device upload'}
                            </span>
                          )}
                        </div>

                        <label className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-[var(--accent-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--accent-primary)]/10 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-center">
                          <div className="h-10 w-10 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-xs">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[var(--accent-primary)]">
                              {isFr
                                ? 'Cliquez pour choisir une photo sur votre téléphone ou ordinateur'
                                : 'Click to upload product image directly from your phone or computer'}
                            </p>
                            <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-0.5">
                              {isFr
                                ? 'Aucun lien requis · Compression automatique HD (JPG, PNG, WEBP)'
                                : 'No link needed · Auto-compressed for instant Firestore upload (JPG, PNG, WEBP)'}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                        </label>

                        <div className="space-y-1.5">
                          <p className="text-[11px] font-extrabold text-[var(--text-secondary)]">
                            {isFr
                              ? 'Ou sélectionnez une photo studio moderne en 1 clic :'
                              : 'Or pick a ready modern studio photo in 1 click:'}
                          </p>
                          <div className="grid grid-cols-5 gap-2">
                            {PRESET_PRODUCT_IMAGES.map((preset, idx) => {
                              const isSelectedPreset = prodImageUrlInput === preset.url;
                              return (
                                <button
                                  key={preset.labelEn}
                                  type="button"
                                  onClick={() => {
                                    setProdImageUrlInput(preset.url);
                                    setProdImageFileName(
                                      isFr ? preset.labelFr : preset.labelEn
                                    );
                                    setProdImageSizeKb(48 + idx * 6);
                                    setProdImageStatus('ready');
                                  }}
                                  className={`relative rounded-xl overflow-hidden border-2 aspect-square cursor-pointer ${
                                    isSelectedPreset
                                      ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]'
                                      : 'border-[var(--border-hairline)] opacity-80 hover:opacity-100'
                                  }`}
                                  title={isFr ? preset.labelFr : preset.labelEn}
                                >
                                  <img
                                    src={preset.url}
                                    alt={preset.labelEn}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {prodImageUrlInput && (
                          <div className="p-3 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={prodImageUrlInput}
                                alt="Product preview"
                                onLoad={() => setProdImageStatus('ready')}
                                onError={() => setProdImageStatus('error')}
                                className="w-14 h-14 rounded-lg object-cover border border-[var(--border-strong)] shrink-0"
                              />
                              <div className="min-w-0 space-y-0.5">
                                <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                                  {prodImageFileName ||
                                    (isFr ? 'Photo sélectionnée' : 'Selected Device Photo')}
                                </p>
                                <p className="text-[11px] font-extrabold text-[var(--accent-primary)]">
                                  {isFr
                                    ? `✓ Image vérifiée (${prodImageSizeKb} KB) · Prête à publier`
                                    : `✓ Image verified (${prodImageSizeKb} KB) · Ready to publish`}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setProdImageUrlInput('');
                                setProdImageFileName('');
                                setProdImageSizeKb(0);
                                setProdImageStatus('empty');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-[var(--border-strong)] bg-white text-xs font-extrabold text-[var(--accent-warm)] shrink-0 cursor-pointer"
                            >
                              {isFr ? 'Retirer' : 'Clear'}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                          {t.prodDescLabel}
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={prodDescInput}
                          onChange={(e) => setProdDescInput(e.target.value)}
                          placeholder={t.prodDescPlaceholder}
                          className="w-full p-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-semibold"
                        />
                      </div>

                      {productFeedback && (
                        <p className="text-xs font-extrabold text-[var(--accent-primary)]">
                          {productFeedback}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={publishingProduct}
                        className="w-full h-11 rounded-xl bg-[var(--accent-primary)] text-white border-2 border-[var(--accent-primary)] text-xs font-extrabold hover:bg-[var(--accent-primary-hover)] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {publishingProduct
                          ? t.publishingBtn
                          : editingProductId
                          ? t.updateProductBtn
                          : !isSellerApprovedByAdmin
                          ? (isFr
                              ? '📤 Soumettre le Produit pour Approbation Admin'
                              : '📤 Submit Product for Admin Approval')
                          : t.publishProductBtn}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Seller's Own Shop Products & Stock Inventory */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-5">
                      <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
                        <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)]">
                          {t.myProductsCardTitle}
                        </h2>
                        <span className="font-mono-tabular text-xs font-extrabold text-[var(--accent-warm)]">
                          {myUploadedProducts.length} {t.catalogCountSuffix}
                        </span>
                      </div>

                      {myUploadedProducts.length === 0 ? (
                        <div className="py-12 text-center text-sm font-bold text-[var(--text-muted)]">
                          {t.noProductsYet}
                        </div>
                      ) : (
                        <div className="divide-y divide-[var(--border-hairline)]">
                          {myUploadedProducts.map((prod) => {
                            const isDeviceUpload = prod.imageUrl.startsWith('data:image');
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
                                      (e.currentTarget as HTMLImageElement).src =
                                        HERO_IMAGE_URL;
                                    }}
                                    className="w-16 h-16 rounded-xl object-cover bg-[var(--bg-surface)] border-2 border-[var(--border-strong)] shrink-0"
                                  />
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-[var(--accent-warm)]">
                                      <span>{getCategoryLabel(prod.category)}</span>
                                      <span>·</span>
                                      <span>
                                        {prod.stock ?? 15} {t.inStockLabel}
                                      </span>
                                      <span>·</span>
                                      <span className="px-2 py-0.5 rounded-md bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] inline-flex items-center gap-1 text-[11px]">
                                        <Check className="w-3 h-3" />
                                        {isDeviceUpload
                                          ? isFr
                                            ? 'Image : Appareil Vérifiée'
                                            : 'Image: Device Upload Verified'
                                          : 'Image: Active HD'}
                                      </span>
                                    </div>
                                    <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                                      {prod.title}
                                    </h3>
                                    <p className="font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]">
                                      {formatXaf(prod.priceXaf)} · {prod.shopName}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
                                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] mr-1">
                                      Stock:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateProductStock(
                                          prod,
                                          Math.max(0, (prod.stock ?? 15) - 1)
                                        )
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
                                      onChange={(e) =>
                                        handleUpdateProductStock(prod, Number(e.target.value))
                                      }
                                      aria-label="Product stock quantity"
                                      className="w-12 h-6 px-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-center font-mono-tabular text-xs font-extrabold text-[var(--accent-primary)]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateProductStock(prod, (prod.stock ?? 15) + 1)
                                      }
                                      className="w-6 h-6 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs font-extrabold flex items-center justify-center cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleStartEditProduct(prod)}
                                    className="h-9 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>{t.editProductBtn}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setProductToDelete(prod)}
                                    className="h-9 px-3 rounded-xl border border-[var(--border-strong)] bg-white text-xs font-extrabold text-[var(--accent-warm)] inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{t.deleteProductBtn}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seller-Only Orders & Sales Panel (Strictly Seller's Own Shop) */}
                <SellerOrdersAndSalesPanel
                  lang={lang}
                  myShopName={
                    myShop?.shopName ||
                    shopNameInput.trim() ||
                    `${userProfile?.displayName || 'My'} Boutique`
                  }
                  myShop={myShop}
                  sellerProducts={myUploadedProducts}
                  sellerProductsCount={myUploadedProducts.length}
                  sellerTotalStockUnits={sellerTotalStockUnits}
                  sellerOrders={sellerScopedOrders}
                  commissionPercent={marketplaceSettings.commissionPercent}
                  subscriptionPlans={marketplaceSettings.subscriptionPlans}
                  promotionPackages={marketplaceSettings.promotionPackages}
                  sellerRevenueTransactions={revenueTransactions.filter(
                    (tx) =>
                      tx.shopId === (myShop?.ownerId || firebaseUser?.uid) ||
                      tx.sellerId === firebaseUser?.uid
                  )}
                  onSelectSubscriptionPlan={handleSelectSubscriptionPlan}
                  onPromoteProduct={handlePromoteProduct}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                />
              </>
            )}
          </section>
        )}

        {/* VIEW 5: DEDICATED ADMIN DASHBOARD (Full Marketplace Control: Users, Sellers, Products, Orders, Payments, Categories, Reviews & Settings) */}
        {activeSection === 'admin_dashboard' && (
          <section className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-[var(--border-hairline)] pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-extrabold uppercase tracking-wider mb-2">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>
                    {isFr ? 'Administration' : 'Admin Control'}
                  </span>
                </div>
                <h1 className="font-display text-3xl font-extrabold text-[var(--text-primary)]">
                  <AnimatedCharacters text={t.adminPanelHeading} />
                </h1>
                <p className="text-sm font-bold text-[var(--text-secondary)] mt-1">
                  {t.adminPanelSubheading}
                </p>
              </div>

              {firebaseUser && userProfile && (
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)]">
                  <span className="text-xs font-extrabold text-[var(--text-secondary)] px-2">
                    {t.roleSwitchLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetSpecificRole('customer')}
                    className={`h-9 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                      isCurrentUserCustomer
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-hairline)]'
                    }`}
                  >
                    {t.roleCustomerBadge}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSpecificRole('shop_owner')}
                    className={`h-9 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                      isCurrentUserSeller
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-hairline)]'
                    }`}
                  >
                    {t.roleShopOwnerBadge}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSpecificRole('admin')}
                    className={`h-9 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                      isCurrentUserAdmin
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-hairline)]'
                    }`}
                  >
                    {t.roleAdminBadge}
                  </button>
                </div>
              )}
            </div>

            {!firebaseUser ? (
              <div className="p-8 sm:p-12 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] max-w-xl mx-auto text-center space-y-5">
                <BadgeCheck className="w-12 h-12 text-[var(--accent-primary)] mx-auto" />
                <h2 className="font-display text-2xl font-extrabold">
                  {isFr
                    ? 'Connexion au Tableau de Bord Administrateur'
                    : 'Sign In to Admin Dashboard'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleInput('admin');
                    setAuthMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  className="h-11 px-5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold cursor-pointer"
                >
                  {isFr ? 'Connexion Administrateur' : 'Sign In as Admin'}
                </button>
              </div>
            ) : !isCurrentUserAdmin ? (
              <div className="p-8 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] max-w-2xl mx-auto text-center space-y-4">
                <Lock className="w-10 h-10 text-[var(--accent-primary)] mx-auto" />
                <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)]">
                  {isFr
                    ? 'Contrôle d’Accès par Rôle : Accès Réservé à l’Administrateur'
                    : 'Role-Based Access Control: Admin Role Required'}
                </h2>
                <p className="text-xs font-bold text-[var(--text-secondary)]">
                  {isFr
                    ? 'Seul le rôle Administrateur peut gérer l’ensemble des utilisateurs, vendeurs, paiements, catégories et paramètres.'
                    : 'Only users with the Admin role can access full marketplace governance (users, sellers, payments, categories, reviews, and settings).'}
                </p>
                <button
                  type="button"
                  onClick={() => handleSetSpecificRole('admin')}
                  className="h-10 px-5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold cursor-pointer"
                >
                  {isFr ? 'Activer le Rôle Administrateur' : 'Switch to Admin Role'}
                </button>
              </div>
            ) : (
              <>
                {/* Admin Product Creation / Edit Studio (Can assign to any shop across the marketplace) */}
                <form
                  id="admin-product-form"
                  onSubmit={handlePublishOrUpdateProduct}
                  className="p-6 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
                    <div>
                      <h2 className="font-display text-lg font-extrabold text-[var(--text-primary)]">
                        {editingProductId
                          ? isFr
                            ? 'Modifier un Produit du Catalogue (Admin)'
                            : 'Edit Marketplace Product (Admin Control)'
                          : isFr
                          ? 'Ajouter un Produit dans n’importe quelle Boutique (Admin)'
                          : 'Add Product to Any Marketplace Shop (Admin Control)'}
                      </h2>
                    </div>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={() => setEditingProductId(null)}
                        className="text-xs font-extrabold text-[var(--accent-warm)] cursor-pointer"
                      >
                        {t.cancelAction}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                        {t.prodTitleLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={prodTitleInput}
                        onChange={(e) => setProdTitleInput(e.target.value)}
                        placeholder={t.prodTitlePlaceholder}
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                        {t.prodPriceLabel}
                      </label>
                      <input
                        type="number"
                        required
                        min={50}
                        value={prodPriceInput}
                        onChange={(e) => setProdPriceInput(e.target.value)}
                        placeholder="25000"
                        className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                        {t.prodStockLabel}
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={prodStockInput}
                        onChange={(e) => setProdStockInput(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-mono-tabular font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                        {isFr
                          ? 'Sélectionner la Boutique Cible (Admin)'
                          : 'Target Marketplace Shop (Admin)'}
                      </label>
                      <select
                        value={prodTargetShopId}
                        onChange={(e) => setProdTargetShopId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-xs font-extrabold text-[var(--text-primary)]"
                      >
                        {allShops.map((s) => (
                          <option key={s.ownerId} value={s.ownerId}>
                            {s.shopName} ({s.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                        {t.prodCategoryLabel}
                      </label>
                      <select
                        value={prodCategoryInput}
                        onChange={(e) =>
                          setProdCategoryInput(e.target.value as ProductCategory)
                        }
                        className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-bold"
                      >
                        <option value="gourmet">{t.catGourmet}</option>
                        <option value="fashion">{t.catFashion}</option>
                        <option value="beauty">{t.catBeauty}</option>
                        <option value="electronics">{t.catElectronics}</option>
                        <option value="household">{t.catHousehold}</option>
                        <option value="crafts">{t.catCrafts}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                        {t.prodPromoBadgeLabel}
                      </label>
                      <input
                        type="text"
                        value={prodPromoBadgeInput}
                        onChange={(e) => setProdPromoBadgeInput(e.target.value)}
                        placeholder="Promo -15%"
                        className="w-full h-10 px-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="py-3 px-4 rounded-xl border-2 border-dashed border-[var(--accent-primary)] bg-[var(--bg-surface)] hover:bg-[var(--accent-primary)]/10 transition-colors flex items-center justify-between gap-3 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold text-[var(--accent-primary)]">
                            {isFr
                              ? 'Importer une photo depuis l’appareil'
                              : 'Upload product photo directly from device'}
                          </p>
                          <p className="text-[11px] font-bold text-[var(--text-secondary)]">
                            {prodImageStatus === 'ready'
                              ? `✓ Ready (${prodImageSizeKb} KB)`
                              : isFr
                              ? 'Aucun lien requis'
                              : 'No URL link required'}
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={prodDescInput}
                        onChange={(e) => setProdDescInput(e.target.value)}
                        placeholder={t.prodDescPlaceholder}
                        className="flex-1 h-11 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={publishingProduct}
                        className="h-11 px-5 rounded-xl bg-[var(--accent-primary)] text-white border-2 border-[var(--accent-primary)] text-xs font-extrabold cursor-pointer shrink-0"
                      >
                        {publishingProduct
                          ? t.publishingBtn
                          : editingProductId
                          ? t.updateProductBtn
                          : t.publishProductBtn}
                      </button>
                    </div>
                  </div>

                  {productFeedback && (
                    <p className="text-xs font-extrabold text-[var(--accent-primary)]">
                      {productFeedback}
                    </p>
                  )}
                </form>

                {/* Full 9-Module Admin Marketplace Control Suite */}
                <AdminMarketplaceDashboard
                  lang={lang}
                  allUsers={combinedUsersForAdmin}
                  allShops={allShops}
                  allProducts={allProducts}
                  allOrders={firestoreOrders}
                  allReviews={allReviews}
                  allTickets={firestoreTickets}
                  revenueTransactions={revenueTransactions}
                  settings={marketplaceSettings}
                  onSaveSettings={setMarketplaceSettings}
                  onUpdateUserRole={handleAdminUpdateUserRole}
                  onUpdateUserSellerStatus={handleAdminUpdateUserSellerStatus}
                  onDeleteUser={handleAdminDeleteUser}
                  onUpdateShopStatus={handleUpdateShopStatus}
                  onDeleteShop={handleDeleteShop}
                  onUpdateProductStock={handleUpdateProductStock}
                  onEditProduct={(prod) => {
                    handleStartEditProduct(prod);
                    const el = document.getElementById('admin-product-form');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onDeleteProduct={(prod) => setProductToDelete(prod)}
                  onOpenNewProductModal={() => {
                    setEditingProductId(null);
                    const el = document.getElementById('admin-product-form');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onDeleteReview={handleAdminDeleteReview}
                  onResolveTicket={handleResolveTicket}
                  getCategoryLabel={getCategoryLabel}
                  onApproveProduct={handleAdminApproveProduct}
                  onApproveAllSellerProducts={handleAdminApproveAllSellerProducts}
                />
              </>
            )}
          </section>
        )}

        {/* VIEW 5: SUPPORT, CONTACT, FAQ & SECURITY */}
        {activeSection === 'support' && (
          <SupportAndSecurityView
            lang={lang}
            onSubmitTicket={handleSubmitSupportTicket}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t-2 border-[var(--border-strong)] bg-[var(--bg-surface)] py-10 px-4 sm:px-8">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs font-bold text-[var(--text-secondary)]">
          <div className="flex items-center gap-4">
            <BrandLogo size="lg" />
            <div className="space-y-1.5">
              <div className="font-display text-xl sm:text-2xl font-extrabold tracking-tight flex items-center">
                <span className="text-[var(--accent-warm)]">SW</span>
                <span className="text-[var(--text-primary)]">MARKET</span>
                <span className="text-[var(--accent-primary)]">PLACE</span>
              </div>
              <p className="max-w-xl">{t.footerTagline}</p>
            </div>
          </div>
          <p className="text-[var(--text-primary)] font-extrabold">{t.footerCopyright}</p>
        </div>
      </footer>

      {/* 5. SHOPPING CART DRAWER (Subtotal, Delivery Fees, Total Amount & Proceed to Checkout) */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={t.cartDrawerTitle}
        >
          <div className="w-full max-w-md bg-[var(--bg-elevated)] h-full flex flex-col justify-between border-l-2 border-[var(--border-strong)] p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[var(--border-hairline)] pb-4">
                <h2 className="font-display text-xl font-extrabold text-[var(--text-primary)]">
                  {t.cartDrawerTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="h-9 w-9 rounded-xl border border-[var(--border-hairline)] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <ShoppingBag className="w-10 h-10 text-[var(--accent-primary)] mx-auto" />
                  <p className="text-sm font-bold text-[var(--text-secondary)] leading-relaxed">
                    {t.cartEmptyState}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartGroupedByShop.map((group) => {
                    const itemsText = group.items
                      .map(
                        (i) =>
                          `• ${i.quantity}x ${i.product.title} (${formatXaf(
                            i.product.priceXaf * i.quantity
                          )})`
                      )
                      .join('\n');
                    const groupWaLink = buildWhatsAppUrl(
                      group.whatsappNumber,
                      t.whatsappCartPrefill(
                        group.shopName,
                        itemsText,
                        formatXaf(group.subtotalXaf)
                      )
                    );

                    return (
                      <div
                        key={group.shopName}
                        className="p-4 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)]/70 space-y-4"
                      >
                        <div className="flex items-center justify-between text-xs font-extrabold border-b border-[var(--border-hairline)] pb-2">
                          <span className="text-[var(--text-primary)]">{group.shopName}</span>
                          <span className="font-mono-tabular text-[var(--accent-primary)]">
                            {formatXaf(group.subtotalXaf)}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {group.items.map(({ product, quantity }) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                                  {product.title}
                                </p>
                                <p className="font-mono-tabular text-xs font-bold text-[var(--accent-warm)]">
                                  {formatXaf(product.priceXaf)}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(product.id, -1)}
                                  className="h-7 w-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-mono-tabular text-xs font-extrabold w-6 text-center">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(product.id, 1)}
                                  className="h-7 w-7 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] flex items-center justify-center"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromCart(product.id)}
                                  className="h-7 w-7 rounded-lg text-red-600 flex items-center justify-center ml-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <a
                          href={groupWaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-9 px-3 rounded-xl bg-[var(--whatsapp-brand)] text-white text-xs font-extrabold flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>
                            {t.cartCheckoutWhatsApp} ({group.shopName})
                          </span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-6 border-t-2 border-[var(--border-strong)] space-y-3">
                <div className="space-y-1.5 text-xs font-extrabold">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>{t.cartSubtotal}</span>
                    <span className="font-mono-tabular">{formatXaf(totalCartPriceXaf)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>{t.cartDeliveryFee}</span>
                    <span className="font-mono-tabular">
                      {formatXaf(estimatedDeliveryFeeXaf)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base text-[var(--accent-primary)] pt-1 border-t border-[var(--border-hairline)]">
                    <span>{t.cartTotalAmount}</span>
                    <span className="font-mono-tabular">
                      {formatXaf(totalCartPriceXaf + estimatedDeliveryFeeXaf)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full h-11 rounded-xl bg-[var(--accent-primary)] text-white border-2 border-[var(--accent-primary)] text-xs font-extrabold hover:bg-[var(--accent-primary-hover)] shadow-md cursor-pointer"
                >
                  {t.cartProceedCheckoutBtn}
                </button>

                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="w-full h-9 rounded-xl border border-[var(--border-hairline)] text-xs font-bold text-[var(--text-secondary)]"
                >
                  {t.cartClearBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6 & 8. CHECKOUT & DELIVERY MODAL */}
      {isCheckoutOpen && (
        <CheckoutModal
          lang={lang}
          cart={cart}
          defaultName={userProfile?.displayName || ''}
          defaultPhone={userProfile?.phone || '237696751829'}
          defaultCity={userProfile?.defaultCity || 'Douala'}
          defaultAddress={userProfile?.defaultAddress || ''}
          onClose={() => setIsCheckoutOpen(false)}
          onPlaceOrder={handlePlaceOrder}
          onGoToAccount={() => setActiveSection('account')}
        />
      )}

      {/* 3 & 9. PRODUCT QUICK VIEW & CUSTOMER REVIEWS MODAL */}
      {selectedProductModal && (
        <ProductQuickViewModal
          lang={lang}
          product={selectedProductModal}
          reviews={allReviews.filter((r) => r.productId === selectedProductModal.id)}
          categoryLabel={getCategoryLabel(selectedProductModal.category)}
          canReview={Boolean(firebaseUser)}
          onClose={() => setSelectedProductModal(null)}
          onAddToCart={(p) => {
            handleAddToCart(p);
            setSelectedProductModal(null);
            setIsCartOpen(true);
          }}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* CONFIRM DELETE PRODUCT MODAL */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-display text-lg font-extrabold text-[var(--text-primary)]">
              {t.confirmDeleteTitle}
            </h3>
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              {t.confirmDeleteDesc} (<strong>{productToDelete.title}</strong>)
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="h-9 px-4 rounded-xl border border-[var(--border-hairline)] text-xs font-extrabold"
              >
                {t.cancelAction}
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="h-9 px-4 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold"
              >
                {t.confirmDeleteAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-hairline)] pb-3">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-0.5">
                    <span className="text-[var(--accent-warm)]">SW</span>
                    <span className="text-[var(--text-primary)]">MARKET</span>
                    <span className="text-[var(--accent-primary)]">PLACE</span>
                  </p>
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                    {authMode === 'signin' ? t.authModalSignInTitle : t.authModalSignUpTitle}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="h-8 w-8 rounded-xl border border-[var(--border-hairline)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                {t.authRoleLabel}
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoleInput('customer')}
                  className={`p-3 rounded-xl border-2 text-left text-xs font-extrabold flex items-center gap-2.5 cursor-pointer ${
                    selectedRoleInput === 'customer'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>{t.authRoleCustomer}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoleInput('shop_owner')}
                  className={`p-3 rounded-xl border-2 text-left text-xs font-extrabold flex items-center gap-2.5 cursor-pointer ${
                    selectedRoleInput === 'shop_owner'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Store className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>{t.authRoleShopOwner}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoleInput('admin')}
                  className={`p-3 rounded-xl border-2 text-left text-xs font-extrabold flex items-center gap-2.5 cursor-pointer ${
                    selectedRoleInput === 'admin'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  }`}
                >
                  <BadgeCheck className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>
                    {isFr
                      ? 'Administrateur (Superviser Vendeurs, Clients, Commandes & Catalogue)'
                      : 'Platform Admin (Manage Sellers, Customers, Orders & Catalog)'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authSubmitting}
              className="w-full h-11 rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-canvas)] text-sm font-extrabold flex items-center justify-center gap-2.5"
            >
              <span>{t.authGoogleBtn}</span>
            </button>

            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                    {t.authNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={t.authNamePlaceholder}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                  {t.authEmailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={t.authEmailPlaceholder}
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[var(--text-secondary)]">
                  {t.authPasswordLabel}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-sm font-bold"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full h-11 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-extrabold"
              >
                {authMode === 'signin' ? t.authSubmitSignIn : t.authSubmitSignUp}
              </button>
            </form>

            <div className="pt-2 border-t border-[var(--border-hairline)] text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
                }}
                className="text-xs font-extrabold text-[var(--accent-primary)] hover:underline"
              >
                {authMode === 'signin' ? t.authSwitchToSignUp : t.authSwitchToSignIn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
