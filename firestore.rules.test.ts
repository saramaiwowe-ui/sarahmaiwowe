/**
 * Firestore Security Rules Test Specification (Dirty Dozen Verification)
 * Verifies that all 12 adversarial payloads in security_spec.md return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  authUid: string | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on Product Creation',
    collection: 'products',
    docId: 'prod_1',
    operation: 'create',
    authUid: 'shop_1',
    payload: {
      title: 'Bamenda Ndop Cloth',
      description: 'Handwoven indigo cotton textile',
      priceXaf: 25000,
      category: 'fashion',
      imageUrl: 'https://example.com/ndop.jpg',
      shopId: 'shop_1',
      shopName: 'Bamenda Heritage Loom',
      shopCity: 'Bamenda',
      whatsappNumber: '237677112233',
      ownerId: 'shop_1',
      isPublic: true,
      isFeatured: true // Ghost field
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Identity Spoofing on Product Creation',
    collection: 'products',
    docId: 'prod_2',
    operation: 'create',
    authUid: 'user_A',
    payload: {
      title: 'Penja White Pepper',
      description: 'Organic volcanic soil pepper',
      priceXaf: 6500,
      category: 'gourmet',
      imageUrl: 'https://example.com/pepper.jpg',
      shopId: 'user_B',
      shopName: 'Moungo Spice Co',
      shopCity: 'Douala',
      whatsappNumber: '237699112233',
      ownerId: 'user_B',
      isPublic: true
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Orphaned Product Creation Without Existing Shop',
    collection: 'products',
    docId: 'prod_3',
    operation: 'create',
    authUid: 'user_without_shop',
    payload: {
      title: 'Oku White Honey',
      description: 'Pure highland white honey',
      priceXaf: 8500,
      category: 'gourmet',
      imageUrl: 'https://example.com/honey.jpg',
      shopId: 'user_without_shop',
      shopName: 'Ghost Shop',
      shopCity: 'Kumbo',
      whatsappNumber: '237670000000',
      ownerId: 'user_without_shop',
      isPublic: true
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'PII Cross-User Read',
    collection: 'users',
    docId: 'user_B',
    operation: 'get',
    authUid: 'user_A',
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'User Collection Scraping via List',
    collection: 'users',
    docId: '*',
    operation: 'list',
    authUid: 'user_A',
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'Negative Price Manipulation',
    collection: 'products',
    docId: 'prod_6',
    operation: 'create',
    authUid: 'shop_1',
    payload: {
      title: 'Bafoussam Arabica Coffee',
      description: 'Dark roast highland coffee',
      priceXaf: -5000,
      category: 'gourmet',
      imageUrl: 'https://example.com/coffee.jpg',
      shopId: 'shop_1',
      shopName: 'Highland Roasters',
      shopCity: 'Bafoussam',
      whatsappNumber: '237677112233',
      ownerId: 'shop_1',
      isPublic: true
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Denial of Wallet String Overflow on Title',
    collection: 'products',
    docId: 'prod_7',
    operation: 'create',
    authUid: 'shop_1',
    payload: {
      title: 'A'.repeat(500),
      description: 'Valid description text',
      priceXaf: 10000,
      category: 'crafts',
      imageUrl: 'https://example.com/craft.jpg',
      shopId: 'shop_1',
      shopName: 'Foumban Bronze',
      shopCity: 'Foumban',
      whatsappNumber: '237677112233',
      ownerId: 'shop_1',
      isPublic: true
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'ID Poisoning Attack',
    collection: 'products',
    docId: 'invalid$id!with*spaces',
    operation: 'create',
    authUid: 'shop_1',
    payload: {},
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Immutable OwnerId Mutation on Update',
    collection: 'products',
    docId: 'prod_1',
    operation: 'update',
    authUid: 'shop_1',
    payload: {
      ownerId: 'hacker_uid'
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Client Forged Timestamp on Creation',
    collection: 'users',
    docId: 'user_A',
    operation: 'create',
    authUid: 'user_A',
    payload: {
      uid: 'user_A',
      email: 'usera@example.cm',
      displayName: 'Jean Mbarga',
      role: 'customer',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z'
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Invalid Category Enum Value',
    collection: 'products',
    docId: 'prod_11',
    operation: 'create',
    authUid: 'shop_1',
    payload: {
      title: 'Unauthorized Item',
      description: 'Invalid category payload test',
      priceXaf: 15000,
      category: 'unauthorized_category',
      imageUrl: 'https://example.com/item.jpg',
      shopId: 'shop_1',
      shopName: 'Douala Shop',
      shopCity: 'Douala',
      whatsappNumber: '237677112233',
      ownerId: 'shop_1',
      isPublic: true
    },
    expectedResult: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Unauthorized Cross-Owner Product Deletion',
    collection: 'products',
    docId: 'prod_1',
    operation: 'delete',
    authUid: 'user_B',
    expectedResult: 'PERMISSION_DENIED'
  }
];
