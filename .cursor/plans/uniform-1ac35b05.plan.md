<!-- 1ac35b05-3095-47ad-a412-7805ade9afb6 8a8d1696-d505-44e6-a90f-38dcd57667b3 -->
# Uniform swipe gestures for all Home cards

## What we'll do

- Create a reusable `components/home-event-card/HomeEventCard.tsx` that composes `SwipeActionCard` + `FlippableCard`.
- Right swipe: call `addSavedEvent` (from `useEvents`) with current card data.
- Left swipe: call `onDismiss(id)` from parent; parent filters the Home list so dismissed cards disappear.
- Replace inline card markup in `app/(tabs)/index.tsx` to render `HomeEventCard` for every item.

## Files to change

- New: `components/home-event-card/HomeEventCard.tsx`
- Edit: `app/(tabs)/index.tsx` (wrap every rendered card with the new component and manage dismissed ids)

## Key integration points

- Context: `contexts/events-context.tsx` already provides `addSavedEvent`; we’ll use it inside `HomeEventCard`.
- Gestures: `components/SwipeActionCard.tsx` already implements symmetric left/right swipe with badges; we’ll re-use it.
- Flip control: parent (`index.tsx`) continues to own `flippedIndex` so scroll resets still work. `HomeEventCard` accepts `flipped` and flip callbacks.

## Minimal, essential snippets

Existing location to replace in `app/(tabs)/index.tsx` (wrap this block with our component):

```256:316:/Users/sumit/Documents/reactnative/ballot/app/(tabs)/index.tsx
<View style={{ height: viewportHeight, paddingHorizontal: 20 }}>
  <View style={styles.cardContainer}>
    <FlippableCard
      style={styles.eventCard}
      flipped={flippedIndex === index}
      front={/* ... */}
      back={/* ... */}
    />
  </View>
</View>
```

New wrapper interface and behavior (HomeEventCard):

```tsx
// components/home-event-card/HomeEventCard.tsx
import { SavedEvent, useEvents } from '@/contexts/events-context';
import SwipeActionCard from '@/components/SwipeActionCard';
import FlippableCard from '@/components/FlippableCard';

interface HomeEventCardProps extends SavedEvent {
  flipped: boolean;
  onFlip: () => void;
  onUnflip: () => void;
  onDismiss: (id: string) => void;
}

export function HomeEventCard({ id, title, location, date, image, flipped, onFlip, onUnflip, onDismiss }: HomeEventCardProps) {
  const { addSavedEvent } = useEvents();
  return (
    <SwipeActionCard
      onSwipeRight={() => addSavedEvent({ id, title, location, date, image })}
      onSwipeLeft={() => onDismiss(id)}
    >
      <FlippableCard
        style={/* pass style from parent */ undefined}
        flipped={flipped}
        front={/* render existing front content */}
        back={/* render existing back content */}
      />
    </SwipeActionCard>
  );
}
```

Usage in `index.tsx` (every item gets uniform gestures):

```tsx
<HomeEventCard
  id={item.id}
  title={item.title}
  location={item.location}
  date={item.date}
  image={item.image}
  flipped={flippedIndex === index}
  onFlip={() => setFlippedIndex(index)}
  onUnflip={() => setFlippedIndex(null)}
  onDismiss={(id) => setDismissedIds(prev => new Set([...prev, id]))}
/>
```

Filtering dismissed cards before rendering (keeps infinite paging intact):

```tsx
const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
const VISIBLE_EVENTS = useMemo(() => EVENTS.filter(e => !dismissedIds.has(e.id)), [dismissedIds]);
// Then feed VISIBLE_EVENTS into VirtualizedList `data`
```

## Notes

- If all cards dismissed, show a small placeholder (e.g., “No more events”).
- `SwipeActionCard` already uses horizontal activation thresholds suitable for vertical paging.
- Saved Events screen already reads from `savedEvents`, so right swipes will appear there.

### To-dos

- [ ] Create HomeEventCard composing SwipeActionCard + FlippableCard
- [ ] Replace inline card in Home with HomeEventCard for all items
- [ ] Add dismissedIds state and filter VISIBLE_EVENTS in Home
- [ ] Show placeholder when all home events dismissed