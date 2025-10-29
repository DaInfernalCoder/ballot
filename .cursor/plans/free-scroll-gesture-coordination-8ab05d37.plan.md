<!-- 8ab05d37-0574-46db-a6c0-238af57c8b45 76e9dcb4-a171-4b8b-8207-818f74b51399 -->
# Enable Free Scrolling with Smart Gesture Coordination

## Current Architecture

The gesture hierarchy is:

```
VirtualizedList (vertical paging)
  └─ AnimatedEventCard (entrance animation wrapper)
      └─ SwipeActionCard (horizontal Pan gesture)
          └─ FlippableCard (state-driven 3D flip)
              └─ HomeEventCard
                  ├─ Front: ScrollView (Gesture.Native wrapper)
                  └─ Back: ScrollView (Gesture.Native wrapper)
                      └─ CustomScrollbar (Pan gesture for thumb)
```

## Implementation Steps

### Step 1: Remove VirtualizedList Paging Configuration

**File:** `app/(tabs)/index.tsx` (lines 378-398)

Remove these paging-related props from VirtualizedList:

- `pagingEnabled`
- `snapToInterval={viewportHeight}`
- `snapToAlignment="start"`
- `decelerationRate="fast"`

Keep:

- `showsVerticalScrollIndicator={false}` (aesthetic preference)
- `scrollEventThrottle={16}` (performance)
- All windowing/virtualization props (`windowSize`, `maxToRenderPerBatch`, etc.)
- `onMomentumScrollEnd` handler (for flip state management)

### Step 2: Update SwipeActionCard Gesture Logic

**File:** `components/SwipeActionCard.tsx` (lines 61-98)

Current issues:

- `failOffsetY([-20, 20])` may block vertical scrolling too aggressively
- No velocity-based intent detection

Changes:

1. Increase `failOffsetY` threshold from 20 to 40 pixels for more forgiving vertical scroll
2. Add `activeOffsetY` with larger threshold to prevent premature horizontal swipe during vertical scrolling
3. Track gesture velocity to determine user intent (horizontal vs vertical)
4. Add simultaneous gesture handling with external gestures

Updated gesture configuration:

```typescript
const gesture = Gesture.Pan()
  .enabled(enabled)
  .activeOffsetX([-16, 16])           // Keep existing
  .failOffsetY([-40, 40])             // Increased from 20 to 40
  .activeOffsetY([-40, 40])           // NEW: Allow vertical movement before failing
  .simultaneousWithExternalGesture()  // NEW: Coordinate with VirtualizedList
  .enableTrackpadTwoFingerGesture(false)
  // Rest of gesture handlers...
```

### Step 3: Add Velocity-Based Intent Detection

**File:** `components/SwipeActionCard.tsx`

Add to gesture handlers to make horizontal swipe more intentional:

```typescript
const velocityX = useSharedValue(0);
const velocityY = useSharedValue(0);

// In .onUpdate()
velocityX.value = e.velocityX;
velocityY.value = e.velocityY;

// In .onEnd()
const isHorizontalIntent = Math.abs(velocityX.value) > Math.abs(velocityY.value);
// Only commit swipe if horizontal intent is clear
```

This ensures horizontal swipes don't interfere with vertical scrolling momentum.

### Step 4: Update Gesture.Native Configuration in HomeEventCard

**File:** `components/home-event-card/HomeEventCard.tsx` (lines 117-118)

Current setup already disables gestures when flipped/not-flipped, but we should ensure they properly allow VirtualizedList scrolling:

```typescript
// Replace Gesture.Native() with more explicit configuration
const frontScrollViewGesture = Gesture.Native()
  .enabled(!flipped)
  .simultaneousWithExternalGesture();  // NEW: Allow VirtualizedList to scroll

const backScrollViewGesture = Gesture.Native()
  .enabled(flipped)
  .simultaneousWithExternalGesture();  // NEW: Allow VirtualizedList to scroll
```

### Step 5: Test Gesture Coordination

After implementation, verify these scenarios work correctly:

1. ✓ Free vertical scrolling through all cards (no snapping)
2. ✓ Horizontal swipe-to-add (right) still works
3. ✓ Horizontal swipe-to-dismiss (left) still works
4. ✓ Card content scrolling (both front and back) works independently
5. ✓ Scrollbar dragging doesn't interfere with list scrolling
6. ✓ Flip animation works during scroll momentum
7. ✓ No gesture conflicts between layers

### Step 6: Update CLAUDE.md Documentation

Update these sections:

- **Three-Layer Gesture System**: Note that VirtualizedList is now free-scrolling, not paged
- **List View**: Update pattern description to reflect continuous scrolling instead of Quizlet-style paging
- **Architecture Decisions**: Document why we chose simultaneous gestures over exclusive gesture zones

## Key Technical Considerations

1. **Gesture Priority**: VirtualizedList vertical scrolling takes precedence when vertical velocity > horizontal velocity
2. **Fail Offsets**: Increased to 40px to prevent accidental gesture failures during deliberate scrolling
3. **Simultaneous Handling**: All gestures use `simultaneousWithExternalGesture()` to prevent conflicts
4. **Performance**: Keep all existing virtualization optimizations (windowSize, removeClippedSubviews, etc.)

## Expected Behavior Changes

**Before:** Quizlet-style card swiping - one card at a time with snapping

**After:** Instagram/Twitter-style feed - free scrolling through all cards with smooth momentum

Horizontal swipe gestures (add/dismiss) remain identical - no UX change there.

### To-dos

- [ ] Remove paging props from VirtualizedList (pagingEnabled, snapToInterval, snapToAlignment, decelerationRate)
- [ ] Update SwipeActionCard gesture with increased failOffsetY (40px), activeOffsetY, and simultaneousWithExternalGesture()
- [ ] Add velocity-based intent detection to SwipeActionCard to distinguish horizontal vs vertical gestures
- [ ] Add simultaneousWithExternalGesture() to both Gesture.Native() wrappers in HomeEventCard
- [ ] Test all gesture scenarios: free scrolling, horizontal swipes, card content scrolling, scrollbar dragging, flip during momentum
- [ ] Update CLAUDE.md sections: Three-Layer Gesture System, List View, and Architecture Decisions