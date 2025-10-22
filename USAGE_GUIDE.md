# Swipe-to-Delete Usage Guide

## Quick Start

Run your app:
```bash
npm start
```

Then press `i` for iOS or `a` for Android.

## How It Works

### Visual Flow

```
┌─────────────────────────────────┐
│  [Event Card - Normal State]   │  ← Normal view
└─────────────────────────────────┘

     👆 Swipe Left (< 60%)
     
┌─────────────────────────┐  ┌──┐
│  [Event Card]           │  │❌│  ← Partial swipe reveals delete button
└─────────────────────────┘  └──┘

     👆 Tap ❌
     
┌─────────────────────────────────┐
│     Delete Event?               │
│  Are you sure you want to...    │  ← Confirmation modal appears
│  [Cancel]  [Delete]             │
└─────────────────────────────────┘

     👆 Swipe Left (≥ 60%)
     
        💨 [Animating Out]           ← Auto-delete, no confirmation
```

## Three Ways to Delete

### 1. Partial Swipe + Tap Delete
- Swipe left about 100px
- Red delete button appears
- Tap the X button
- Confirmation modal shows
- Choose "Delete" or "Cancel"

### 2. Full Swipe Auto-Delete
- Swipe left all the way (60%+ of screen width)
- Event automatically deletes
- Smooth fade-out animation
- No confirmation needed

### 3. Quick Cancel
- Start swiping
- Release before 45px
- Card snaps back to original position

## Visual Indicators

- **Red Background (#FF3B30)**: iOS system red color for delete action
- **White X Icon**: Clear delete indicator
- **Smooth Animations**: Spring physics for natural feel
- **Fade Out**: Opacity + height collapse when deleting

## Tips

1. **Try both methods** - partial swipe for careful deletion, full swipe for quick removal
2. **Works with scroll** - Gesture detection distinguishes between swipe and scroll
3. **Multiple cards** - Each card is independent, swipe multiple at once
4. **Visual feedback** - Card slides smoothly revealing the delete button underneath

## Customization

To adjust thresholds, edit `components/SwipeableEventCard.tsx`:

```typescript
const DELETE_BUTTON_WIDTH = 90;  // Width of delete button
const SWIPE_THRESHOLD_FULL = SCREEN_WIDTH * 0.6;  // 60% = auto-delete
const SNAP_BACK_THRESHOLD = 45;  // Minimum to stay open
```

## Colors

To change delete button color, edit `components/SwipeableEventCard.tsx`:

```typescript
backgroundColor: '#FF3B30'  // iOS red
```

Common alternatives:
- `#FF3B30` - iOS Red (current)
- `#FF2D55` - iOS Pink
- `#FF9500` - iOS Orange
- `#FF453A` - iOS Red (Dark Mode)

Enjoy your new swipe-to-delete feature! 🎉

