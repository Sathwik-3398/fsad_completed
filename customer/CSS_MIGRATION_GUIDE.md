# 🎨 Customer Portal CSS Module Setup Guide

## Overview

You now have **separate CSS files** for your customer portal! These are organized, modular, and easy to customize.

### Files Created:
1. **`customer/CustomerPortal.module.css`** - Main customer portal styles (1000+ lines)
2. **`customer/OrderTracking.module.css`** - Order tracking animations & styles

---

## How to Use These CSS Files

### Step 1: Import CSS in Your Components

Add these imports at the top of your TSX files:

#### In `CustomerPortal.tsx`:
```typescript
import styles from './CustomerPortal.module.css';
```

#### In `OrderTracking.tsx`:
```typescript
import styles from './OrderTracking.module.css';
```

---

### Step 2: Replace Tailwind Classes with CSS Classes

**Before (Tailwind):**
```tsx
<div className="min-h-screen bg-[#f4f6fb] pb-32">
  <header className="sticky top-0 z-40 bg-white border-b px-6 pt-6 pb-4 shadow-sm">
```

**After (CSS Module):**
```tsx
<div className={styles.mainContainer}>
  <header className={styles.header}>
```

---

## CSS Class Mapping Reference

### Main Layout
| Element | Tailwind | CSS Class |
|---------|----------|-----------|
| Main container | `min-h-screen bg-[#f4f6fb] pb-32` | `styles.mainContainer` |
| Content wrapper | `p-4` | `styles.mainContent` |

### Header
| Element | Tailwind | CSS Class |
|---------|----------|-----------|
| Header | `sticky top-0 z-40 bg-white border-b px-6` | `styles.header` |
| Location button | `flex items-center gap-2 cursor-pointer` | `styles.locationBtn` |
| Wallet button | `bg-black text-white px-4 py-2 rounded-2xl` | `styles.walletBtn` |
| Search input | `w-full bg-slate-100 rounded-2xl py-3` | `styles.searchInput` |

### Products (Home View)
| Element | Tailwind | CSS Class |
|---------|----------|-----------|
| Product grid | `grid grid-cols-2 gap-4` | `styles.productsGrid` |
| Product card | `bg-white p-3 rounded-[2.2rem]` | `styles.productCard` |
| Product image | `h-32 bg-slate-50 rounded-[1.8rem]` | `styles.productImageContainer` |
| Sold out badge | `opacity-50 brightness-75` | `styles.productCard.soldOut` |
| Category buttons | `flex gap-2 overflow-x-auto` | `styles.categoryScroll` |

### Cart
| Element | Tailwind | CSS Class |
|---------|----------|-----------|
| Cart view | `space-y-6 animate-fade-in` | `styles.cartView` |
| Cart items list | `bg-white rounded-[2.5rem] p-6` | `styles.cartItemsList` |
| Cart item | `py-4 flex justify-between items-center` | `styles.cartItem` |
| Empty cart | `text-center py-24 opacity-20` | `styles.emptyCart` |
| Floating cart button | `fixed bottom-28 left-4 right-4` | `styles.cartFloatingBtn` |

### Checkout
| Element | Tailwind | CSS Class |
|---------|----------|-----------|
| Billing card | `bg-white p-8 rounded-[2.5rem]` | `styles.billingCard` |
| Billing row | `flex justify-between` | `styles.billingRow` |
| Payment button | `w-full p-4 rounded-xl border-2` | `styles.paymentBtn` |
| Payment button active | + active class | `styles.paymentBtn.active` |
| Checkout button | `w-full bg-black text-white py-6` | `styles.checkoutBtn` |

### Address Form
| Element | Tailwind | CSS Class |
|---------|----------|-----------|
| Address section | `space-y-3` | `styles.addressSection` |
| Address form | `bg-white p-8 rounded-[2.5rem]` | `styles.addressForm` |
| Address input | `w-full p-4 rounded-xl border` | `styles.addressInput` |
| Address grid | `grid grid-cols-2 gap-4` | `styles.addressGrid` |

### Coupons
| Element | Tailwind | CSS Class |
|---------|----------|-----------|
| Coupons section | `space-y-4` | `styles.offersSection` |
| Coupon card | `bg-gradient-to-r from-purple-500 to-pink-500` | `styles.couponCard` |
| Coupon card applied | `ring-2 ring-white` | `styles.couponCard.applied` |

### Account & Subscriptions
| Element | Tailwind | CSS Class |
|---------|----------|-----------|
| Profile card | `bg-white p-6 rounded-3xl` | `styles.profileCard` |
| Subscription card | `bg-white p-6 rounded-[2.5rem]` | `styles.subscriptionCard` |
| Subscription header | `flex items-start gap-4` | `styles.subscriptionHeader` |
| Subscription details | `grid grid-cols-2 gap-3` | `styles.subscriptionDetails` |

### Order Tracking
| Element | Tailwind | CSS Class |
|---------|----------|-----------|
| Tracking container | `p-6 rounded-[2rem] border` | `styles.orderTrackingCard` |
| Timeline | `flex flex-col gap-0` | `styles.orderTimeline` |
| Timeline step | `flex gap-4` | `styles.timelineStep` |
| Timeline circle | `w-8 h-8 rounded-full` | `styles.timelineCircle` |
| Timeline circle completed | green gradient | `styles.timelineCircle.completed` |
| Timeline circle current | black + pulse | `styles.timelineCircle.current` |

---

## All Available CSS Classes

Here's a complete list of all CSS classes you can use:

### Animations
- `animateFadeIn` - Fade in animation
- `animateSlideUp` - Slide up animation
- `animateScaleUp` - Scale up animation
- `checkmarkAnimated` - Checkmark bounce animation
- `pulseGlow` - Pulse glow effect

### Layout & Containers
- `mainContainer` - Main app container
- `mainContent` - Main content area
- `header` - Header/navigation
- `homeSpace` - Home view container
- `cartView` - Cart view container
- `accountView` - Account view container
- `subscriptionsView` - Subscriptions view

### Buttons
- `walletBtn` - Wallet button
- `cartFloatingBtnContent` - Floating cart button
- `addToCartBtn` - Add to cart button
- `paymentBtn` - Payment method button
- `checkoutBtn` - Checkout button
- `saveAddressBtn` - Save address button
- `categoryBtn` - Category filter button

### Input Elements
- `searchInput` - Search input field
- `addressInput` - Address form input

### Typography & Utilities
- `fontBold` - Font weight 700
- `fontBlack` - Font weight 900
- `uppercase` - Text transform uppercase
- `textCenter` - Text align center
- `truncate` - Text truncate with ellipsis
- `lineClamp1` - Line clamp 1 line
- `lineClamp2` - Line clamp 2 lines

### Spacing Utilities
- `gap1`, `gap2`, `gap4` - Gap classes
- `mt1`, `mt2`, `mt4` - Margin top
- `mb1`, `mb2`, `mb4` - Margin bottom
- `p2`, `p4`, `p6` - Padding

### Border & Shadow
- `rounded`, `roundedLg`, `roundedXl`, `rounded2xl` - Border radius
- `shadow`, `shadowSm`, `shadowMd`, `shadowLg`, `shadowXl`, `shadow2xl` - Shadows

---

## Customizing Colors

### Update the CSS Variables
Edit the `:root` section in `CustomerPortal.module.css`:

```css
:root {
  --color-primary-black: #000000;        /* Change primary color */
  --color-accent-green: #16a34a;        /* Change accent color */
  --color-secondary-white: #ffffff;     /* Change background */
  /* ... more colors */
}
```

### Example: Change Primary Color to Blue
```css
:root {
  --color-primary-black: #2563eb; /* Changed to blue */
}
```

---

## Quick Migration Example

### Before (Old Tailwind):
```tsx
<button className="w-full bg-green-600 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-95 transition-all">
  <ArrowRight size={16} />
</button>
```

### After (New CSS Module):
```tsx
<button className={styles.cartFloatingBtnContent}>
  <ArrowRight size={16} />
</button>
```

---

## File Structure
```
customer/
├── CustomerPortal.tsx              (Main component)
├── CustomerPortal.module.css       (NEW! Main styles)
├── OrderTracking.tsx               (Tracking component)
├── OrderTracking.module.css        (NEW! Tracking styles)
└── ... other files
```

---

## Benefits of CSS Modules ✅

✅ **Separation of Concerns** - CSS separate from JSX  
✅ **Scoped Classes** - No naming conflicts  
✅ **Easy to Customize** - All colors/sizes in one place  
✅ **Better Performance** - Optimized CSS output  
✅ **Type Safe** - VS Code auto-complete for class names  
✅ **Maintainable** - Organized by sections  

---

## Next Steps

1. **Start migrating** one component at a time
2. **Replace Tailwind classes** with CSS module classes
3. **Test** each view thoroughly
4. **Customize colors** as needed
5. **Enjoy** much cleaner code!

---

## Issues or Questions?

If you need help with:
- Specific class mappings
- Custom styling
- Migration
- Performance optimization

Just let me know! 🚀

---

**Created:** 2026-03-05  
**Files:** 2 CSS modules  
**Total Styles:** 1500+ CSS rules
