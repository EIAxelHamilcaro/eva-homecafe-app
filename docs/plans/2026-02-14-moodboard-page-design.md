# Moodboard Page — Design

## Summary

Replace the existing pin-based `/moodboard` page with a mood tracking dashboard featuring a year-long calendar grid, mood slider, weekly/monthly charts, and badges.

## Architecture

### Page Structure

```
app/(protected)/moodboard/
├── page.tsx                          # Server Component — fetches year calendar data
└── _components/
    ├── moodboard-page-client.tsx     # Client layout (2-column: main + sidebar)
    ├── mood-year-calendar.tsx        # Year grid: 12 months × 31 days, CSS grid
    ├── mood-cell-popover.tsx         # Inline popover with 9 mood color options
    ├── mood-legend-card.tsx          # Legend card with 9 color dots
    ├── date-sticker-card.tsx         # Today's date display + stickers
    └── suivi-monthly-card.tsx        # Server wrapper for MonthlyMoodChart
```

### Data Flow

1. `page.tsx` (Server): `requireAuth()` → session, calls `getMoodYearCalendar(userId, year)` + passes to client
2. `moodboard-page-client.tsx` (Client): Orchestrates layout, manages selected date state
3. `mood-year-calendar.tsx` (Client): CSS grid, colored cells, popover on click
4. Sidebar widgets: Reused from dashboard/journal (MoodboardWidget, SuiviWeeklyWidget, MonthlyMoodChart, JournalBadges)

### New Query

```typescript
// src/adapters/queries/mood-year-calendar.query.ts
getMoodYearCalendar(userId: string, year: number): Promise<{ date: string; category: string }[]>
```

Returns all mood entries for a given year as date+category pairs.

### Reused Components (no changes)

- `MoodboardWidget` + `MoodboardWidgetServer` (dashboard) — mood slider
- `SuiviWeeklyWidget` (dashboard) — weekly line chart
- `MonthlyMoodChart` (dashboard) — monthly bar chart
- `JournalBadges` (journal) — badges card
- `Footer` — "Inviter des ami·es" button
- `MOOD_CATEGORIES` / `getMoodColor` (mood/_components/mood-config.ts)
- `Popover` from shadcn/ui

### New Components (4)

1. **mood-year-calendar.tsx** (~120 lines): CSS grid 12×31, colored cells, click handler
2. **mood-cell-popover.tsx** (~50 lines): Popover with 9 color buttons, calls `recordMoodAction`
3. **date-sticker-card.tsx** (~30 lines): Date display card + stickers
4. **mood-legend-card.tsx** (~30 lines): Legend with color dots

### Interaction

- Click cell → popover with 9 mood colors
- Select color → `recordMoodAction({ category, intensity: 5, moodDate })` → cell updates
- Slider in sidebar → `recordMoodAction` for today (existing behavior)
- Invalid cells (e.g., Feb 31) → hidden
- Future dates without mood → gray with chevron

### Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  [Date Card]  [Title + Calendar Grid]    [Sidebar Cards]    │
│  [Stickers]   [31 rows × 12 cols]       [Mood Slider]      │
│  [Legend]      [Valider button]          [Weekly Chart]     │
│                                          [Monthly Chart]    │
│                                          [Badges]           │
│               [Footer: Inviter]                             │
└─────────────────────────────────────────────────────────────┘
```

### Deleted Code

All existing `/moodboard/_components/` files (pin-based moodboard) will be removed:
- moodboard-client.tsx, moodboard-grid.tsx, moodboard-detail.tsx
- create-moodboard-dialog.tsx, add-pin-dialog.tsx, delete-moodboard-dialog.tsx
