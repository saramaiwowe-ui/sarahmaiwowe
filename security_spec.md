# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Global Default Deny**: Any path not explicitly matched (`/{document=**}`) is strictly denied for both read and write.
2. **PII Isolation (`users/{userId}`)**:
   - Contains personal account details (`email`, `displayName`, `role`).
   - Only the authenticated owner (`request.auth.uid == userId`) can `get`, `create`, or `update` their own user document.
   - `list` and `delete` on `/users` are strictly forbidden to prevent user enumeration.
   - `uid` and `createdAt` are immutable after creation.
3. **Shop Profile Integrity (`shops/{shopId}`)**:
   - `shopId` must match `request.auth.uid` and `incoming().ownerId == request.auth.uid`.
   - Publicly readable (`get` and `list`) only when `resource.data.isPublic == true` or `request.auth.uid == resource.data.ownerId`.
   - Only the verified owner with a valid `/users/$(request.auth.uid)` profile can create or update their shop profile.
   - `ownerId` and `createdAt` are immutable across updates.
4. **Product Catalog Integrity (`products/{productId}`)**:
   - Publicly readable (`get` and `list`) only when `resource.data.isPublic == true` or `request.auth.uid == resource.data.ownerId`.
   - A product can only be created if `incoming().ownerId == request.auth.uid`, `incoming().shopId == request.auth.uid`, and the parent shop `/shops/$(request.auth.uid)` exists (`exists(...)`).
   - Price (`priceXaf`) must be a positive number (`> 0` and `<= 100000000`).
   - Category must strictly belong to `['fashion', 'gourmet', 'crafts', 'beauty', 'electronics']`.
   - Only the product owner (`resource.data.ownerId == request.auth.uid`) can update or delete the product.

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection on Product Creation**: Includes an undeclared field `"isFeatured": true` in `/products/prod_1`. Rejected by `hasOnly()`.
2. **Identity Spoofing on Product Creation**: Authenticated as `user_A`, attempts to create a product with `ownerId: "user_B"`. Rejected by `data.ownerId == request.auth.uid`.
3. **Orphaned Product Creation (Missing Shop)**: Authenticated as `user_no_shop`, attempts to create a product when `/shops/user_no_shop` does not exist. Rejected by `exists(/databases/$(database)/documents/shops/$(request.auth.uid))`.
4. **PII Cross-User Read**: Authenticated as `user_A`, attempts `get(/users/user_B)`. Rejected by `isOwner(userId)`.
5. **User Collection Scraping (`list`)**: Authenticated user attempts `list(/users)`. Rejected because `allow list` is omitted/false on `/users`.
6. **Negative or Zero Price Manipulation**: Shop owner attempts to create a product with `priceXaf: -5000`. Rejected by `data.priceXaf > 0`.
7. **Denial of Wallet String Overflow**: Attacker sends a 5,000-character string in `title` (limit 120). Rejected by `data.title.size() <= 120`.
8. **ID Poisoning Attack**: Attacker attempts to create `/products/invalid$id!with*spaces`. Rejected by `isValidId(productId)`.
9. **Immutable Field Mutation (`createdAt` / `ownerId`)**: Shop owner updates a product and attempts to overwrite `createdAt` or `ownerId`. Rejected by `incoming().createdAt == existing().createdAt && incoming().ownerId == existing().ownerId`.
10. **Timestamp Forgery**: Client sends a past or future timestamp in `createdAt` instead of `request.time`. Rejected by `data.createdAt == request.time`.
11. **Invalid Category Enum**: Shop owner submits `category: "weapons"`. Rejected by `data.category in ['fashion', 'gourmet', 'crafts', 'beauty', 'electronics']`.
12. **Unauthorized Product Deletion**: Authenticated as `user_A`, attempts to delete a product owned by `user_B`. Rejected by `existing().ownerId == request.auth.uid`.
