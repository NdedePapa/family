# Responsive Design Quick Reference

## Breakpoint Overview

```
┌─────────────────────────────────────────────────────────────┐
│ 320px    420px    600px    768px    900px   1024px   1200px │
│   │        │        │        │        │        │        │    │
│   └────────┴────────┴────────┴────────┴────────┴────────┘    │
│   Mobile SM  Mobile LG  Tablet SM  Tablet LG  Desktop        │
└─────────────────────────────────────────────────────────────┘
```

---

## Device-Specific Layouts

### 📱 Small Mobile (< 420px)
**Target:** iPhone SE, small Android phones

**Header:**
- 2 rows: Logo + Buttons | Search
- Icon-only buttons (no text)
- Hamburger menu for secondary actions
- No connection status bar

**Buttons:**
- Min height: 34px (44px in sidebar)
- Icons only, no labels
- 3px spacing between buttons

**Sidebar:**
- Bottom sheet (slides up from bottom)
- Max height: 85vh
- Swipe handle indicator
- Single column info grid

**Modals:**
- Full width, rounded top corners
- Slide up from bottom
- Single column form layout

---

### 📱 Large Mobile (420px - 600px)
**Target:** iPhone 12/13/14, standard Android

**Header:**
- 2 rows: Logo + Buttons | Search
- Some button text visible
- Connection bar visible on focus

**Buttons:**
- Show text on primary actions
- Spacing: 4px

**Other:**
- Same as small mobile but more breathing room

---

### 📟 Tablet Small (600px - 768px)
**Target:** iPad Mini portrait, small tablets

**Header:**
- Single row layout
- Search box: max 180px width
- Most buttons visible
- Connection bar hidden

**Sidebar:**
- Desktop-style right panel
- Width: 300px
- Smooth slide animation

**Buttons:**
- Show most labels except "hide-tablet" class

---

### 📟 Tablet Large (768px - 1024px)
**Target:** iPad, Android tablets

**Header:**
- Full single row
- Search box: max 220px
- All desktop buttons visible
- Connection bar visible
- Tighter spacing (4px gaps)

**Buttons:**
- Smaller padding: 5px 9px
- Font size: 11px
- Hide "hide-tablet" labels

**Sidebar:**
- Width: 300px
- All features visible

---

### 💻 Desktop (1024px - 1200px)
**Target:** Laptops, small desktops

**Header:**
- Full layout with all buttons
- Search box: max 340px
- Connection status visible
- 6px button spacing

**Sidebar:**
- Width: 300px

**Modals:**
- Centered with backdrop blur
- Max width: 500-900px depending on type

---

### 🖥️ Large Desktop (> 1200px)
**Target:** Large monitors, 4K displays

**Sidebar:**
- Expanded width: 320px
- More padding and spacing

**Other:**
- Same as desktop with more breathing room

---

## Component Behavior by Size

### Search Box

| Screen Size | Width | Padding | Buttons |
|-------------|-------|---------|---------|
| < 420px | 100% | 8px 10px 8px 30px | Hidden on type |
| 420-600px | 100% | 8px 10px 8px 30px | Compact |
| 600-768px | 180px max | 6px 80px 6px 28px | Normal |
| 768-1024px | 220px max | 6px 80px 6px 28px | Normal |
| > 1024px | 340px max | 6px 100px 6px 28px | Full |

### Sidebar

| Screen Size | Position | Width | Animation |
|-------------|----------|-------|-----------|
| < 600px | Fixed bottom | 100% | Slide up |
| 600-1200px | Fixed right | 300px | Slide left |
| > 1200px | Fixed right | 320px | Slide left |

### Buttons

| Screen Size | Size | Text | Spacing |
|-------------|------|------|---------|
| < 420px | 34x34 | Icons only | 3px |
| 420-600px | 32-34px | Selective | 4px |
| 600-768px | Standard | Most labels | 5px |
| 768-1024px | Compact | Selected | 4px |
| > 1024px | Standard | All labels | 6px |

---

## Z-Index Hierarchy

```
1000 - Mobile menu dropdown (always on top)
 500 - Toast notifications
 250 - Overlay (mobile modals)
 200 - Overlay (desktop modals)  
 150 - Mobile sidebar (bottom sheet)
 100 - Search dropdown
  45 - Header (mobile with wrap)
  40 - Header (desktop)
  30 - Desktop sidebar
   5 - Canvas controls (zoom, legend, hint)
   2 - Search internal controls
   1 - Default stacking
```

---

## Touch Targets

All interactive elements meet **44x44px** minimum:

```css
/* Minimum touch target sizes */
.btn { min-height: 34px }           /* Desktop */
.btn (mobile) { min-height: 44px }  /* Mobile in sidebar */
.btn-help { width: 34px; height: 34px }
.sb-close { min-width: 36px; min-height: 36px }
.ctrl-btn { width: 44px; height: 44px }
.kid-chip { min-height: 30px }      /* Acceptable for chips */
```

---

## Critical CSS Classes

### Responsive Visibility

```css
.hide-mobile    /* Hidden < 600px */
.hide-tablet    /* Hidden < 900px */
.mobile-menu-btn /* Visible < 600px only */
.desktop-buttons /* Hidden < 600px */
```

### State Classes

```css
.sidebar.open    /* Active sidebar */
.overlay.show    /* Visible overlay */
.mobile-menu.active /* Open mobile menu */
.toast.show      /* Visible toast */
.loading-screen.gone /* Hidden loading */
```

---

## Common Responsive Patterns

### Header Flex Wrapping
```css
/* Mobile: 2 rows */
.hdr { flex-wrap: wrap }
.hdr-search { order: 3; flex: 1 1 100% }

/* Desktop: 1 row */
.hdr { flex-wrap: nowrap }
.hdr-search { order: 0; flex: 0 1 auto }
```

### Modal Positioning
```css
/* Mobile: Bottom aligned */
.overlay { align-items: flex-end; padding: 0 }
.modal { border-radius: 16px 16px 0 0 }

/* Desktop: Center aligned */
.overlay { align-items: center; padding: 16px }
.modal { border-radius: var(--radius) }
```

### Button Text Visibility
```css
/* Hide all button text on mobile */
@media(max-width:600px){
  .btn span { display: none !important }
}

/* Show text in sidebar actions */
.sb-actions .btn span { display: inline !important }
```

---

## Testing Checklist

### Visual Testing
- [ ] No horizontal scroll at any size
- [ ] No overlapping elements
- [ ] All text readable (not cut off)
- [ ] Proper spacing maintained
- [ ] Animations smooth

### Functional Testing
- [ ] All buttons clickable
- [ ] Search functional
- [ ] Modals open/close
- [ ] Sidebar slides smoothly
- [ ] Forms submit correctly
- [ ] Mobile menu toggles

### Accessibility Testing
- [ ] Tab navigation works
- [ ] Focus states visible
- [ ] Touch targets 44px min
- [ ] Text scales to 200%
- [ ] Color contrast sufficient

---

## Quick Fixes Reference

### Element Overlapping?
1. Check z-index hierarchy
2. Verify parent overflow settings
3. Check fixed/absolute positioning

### Button Text Cut Off?
1. Check parent width constraints
2. Verify white-space settings
3. Add word-wrap/overflow-wrap

### Sidebar Not Opening?
1. Check z-index conflicts
2. Verify transition properties
3. Check `.open` class applied

### Search Not Working?
1. Check input padding (room for buttons)
2. Verify button positioning
3. Check z-index on controls

---

## Performance Tips

1. **Use transforms** for animations (not width/height)
2. **Debounce** resize events if needed
3. **Use CSS** over JS where possible
4. **Minimize reflows** with will-change hints
5. **Test on real devices** not just browser DevTools

---

## Browser Support

- ✅ Chrome/Edge 90+ (Chromium)
- ✅ Safari 14+ (iOS/macOS)
- ✅ Firefox 88+
- ✅ Mobile Safari (iOS 13+)
- ✅ Chrome Mobile (Android 8+)

**Graceful degradation** for:
- backdrop-filter (blur fallback)
- Custom scrollbar styles (default fallback)
- CSS Grid (flexbox fallback where needed)

---

**Last Updated:** April 13, 2026  
**Responsive Design Status:** ✅ Production Ready
