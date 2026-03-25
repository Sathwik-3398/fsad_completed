# CSS Module Integration Guide

## Current Status

✅ **COMPLETED:**
- CSS Modules created with full dairy theme (`CustomerPortal.module.css`, `OrderTracking.module.css`)
- CSS module imports added to both TSX files
- Home view, Header, Navigation, and OrderTracking component updated to use CSS classes

⏳ **NEEDS COMPLETION:**
- CART view section (lines 360-550)
- PRODUCT_DETAIL view (lines ~360)
- ACCOUNT view (lines ~1000+)
- SUBSCRIPTIONS view
- TRACKING view
- All remaining inline Tailwind classes need conversion

## Why You Still See Old CSS

The **CustomerPortal.tsx file is 1716 lines long**. Only sections with `styles.className` are using the dairy theme CSS. Sections still using inline Tailwind classes (`className="..."`) show old styling.

## Quick Fix Pattern

### OLD (Tailwind inline):
```tsx
<div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8">
  <button className="bg-black text-white px-10 py-4 rounded-2xl">...</button>
</div>
```

### NEW (CSS Modules):
```tsx
import styles from './CustomerPortal.module.css';

<div className={styles.containerName}>
  <button className={styles.buttonName}>...</button>
</div>
```

## Sections to Update (Priority Order)

1. **PRODUCT_DETAIL view** - Lines ~360-400
2. **CART view** - Lines ~450-700 (Most important - users see this)
3. **ACCOUNT > OVERVIEW** - Lines ~900-950
4. **ACCOUNT > ORDERS** - Lines ~1050-1100  
5. **TRACKING view** - Lines ~1300-1400
6. **SUBSCRIPTIONS view** - Lines ~700-850
7. **INVOICE view** - Lines ~1100-1250

## Available CSS Classes in Module

All classes are defined in `CustomerPortal.module.css`:
- `.maintenanceContainer`, `.maintenanceButton`, etc.
- `.productCard`, `.productImage`, `.addToCartBtn`
- `.cartContainer`, `.cartHeader`, `.checkoutBtn`
- `.walletBtn`, `.walletBalance`
- `.searchContainer`, `.searchInput`
- `.bottomNav`, `.navBtn`
- And many more...

## Next Steps

Apply the same pattern used in the HOME section to remaining views by:
1. Identifying the view section
2. Finding corresponding CSS classes in `.module.css`
3. Replacing `className="<tailwind>"` with `className={styles.classNameFromCss}`

**Estimated effort:** 2-3 hours for complete migration of all views
