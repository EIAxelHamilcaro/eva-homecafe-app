# PRD: HomeCafe Expo UI Implementation

## 1. Executive Summary

### Product Vision
Implement all UI screens for the HomeCafe Expo mobile app based on Figma designs. Reference existing web UI from `@.claude/screenshots/` and continue from the already implemented Expo mobile screens to maintain consistent styling and behavior across platforms. HomeCafe is a personal wellness and productivity companion app with mood tracking, journaling, organization tools, and social features.

### Target Users
- Users seeking a cozy, aesthetic productivity and wellness app
- French-speaking primary audience
- Mobile-first experience (iOS/Android via Expo)

### Success Metrics
- All 28 design screens implemented with pixel-perfect accuracy
- UI matches HomeCafe brand identity (pink, cream, warm colors)
- All screens pass type-check, lint, and visual review
- Navigation flows work seamlessly

---

## 2. Current State Analysis

### Existing Screens (Already Implemented)
- **Auth Flow**: login, register, forgot-password, reset-password ✓
- **Tab Navigation**: home (index), messages, notifications, profile ✓
- **Friends**: add, qr-code, scan, index ✓
- **Profile**: edit ✓

### Missing Screens (To Implement)
1. **Dashboard** - Connected landing page with widget overview
2. **Journal** - Personal journal with posts feed
3. **Moodboard** - Mood tracking system with graphs
4. **Organisation** - Todo lists, Kanban boards, Calendar
5. **Galerie** - Photo gallery modal
6. **Social** - Public posts feed
7. **Récompenses** - Badge/reward collection
8. **Stickers** - Sticker collection
9. **Réglages** - Settings screen
10. **Posts** - Post detail, create post modals

---

## 3. Feature Specifications

### 3.1 Dashboard (Landing Page Connecté)
**Route**: `app/(protected)/(tabs)/index.tsx` (update existing)

**Components**:
- Galerie preview card (4 image thumbnails + "Voir plus")
- Messagerie preview card (unread count + "Voir plus")
- Suivi graph card (monthly mood bar chart)
- Calendar widget (current month view)
- To do list preview (3 items + "Voir plus")
- Journal quick entry card (rich text editor mini)
- Moodboard slider card (mood rating 0-100)
- Suivi weekly line graph
- "Inviter des ami•es" CTA button

### 3.2 Journal
**Route**: `app/(protected)/journal/index.tsx`

**Components**:
- Header with Logo + Menu hamburger
- "Ajouter un post" pink button
- "Derniers posts" feed with date-grouped entries
- Each post: date (Lundi 11 août 2025), content preview
- Galerie section (horizontal scroll of images)
- Badges section (achievement badges display)

**Sub-screens**:
- `journal/post/[id].tsx` - Single post detail
- `journal/create.tsx` - Create post modal

### 3.3 Moodboard
**Route**: `app/(protected)/moodboard/index.tsx`

**Components**:
- Date display with stickers button (août 18)
- **Légende card**: Mood palette with 9 emotions
  - Calme (blue), Énervement (red), Excitation (yellow)
  - Anxieté (gray), Tristesse (black), Bonheur (green)
  - Ennui (orange), Nervosité (pink), Productivité (purple)
- **"Que ressens-tu aujourd'hui?"** card: Weekly grid (L M M J V S D)
- **Moodboard slider**: Rate mood 0-100 + "Valider" button
- **Suivi weekly card**: Line graph (semaine du 11 au 17 août)
- **Suivi monthly card**: Bar chart (janvier → juin 2025)
- **Badges card**: Achievement badges
- "Inviter des ami•es" bottom button

**Sub-screens**:
- `moodboard/tracker.tsx` - Full year mood grid (colored squares)

### 3.4 Organisation
**Route**: `app/(protected)/organisation/index.tsx`

**Components**:
- **Tab bar**: To do list | Timings | Kanban | Chronologie | Calendrier
- **To do lists**: Multiple lists with checkbox items
- **Kanban boards**: Tasks with colored labels, progress bars
- **Chronologie**: Timeline view with tasks
- **Calendrier**: Month calendar (Juin 2024 style)
- Badges section at bottom

**Sub-screens**:
- `organisation/todo/new.tsx` - Create todo list modal
- `organisation/kanban/new.tsx` - Create kanban modal
- `organisation/task/[id].tsx` - Task detail

### 3.5 Galerie (Modal)
**Route**: `app/(protected)/galerie.tsx` (modal)

**Components**:
- Close button (×) top right
- Vertical scrolling image grid
- Image placeholders with mountain icon

### 3.6 Social
**Route**: `app/(protected)/social/index.tsx`

**Components**:
- Header: Logo + Menu
- "Derniers posts publics" title
- Post feed (same as Journal but public posts)
- Each post: date, content, sticker icon

### 3.7 Récompenses (Modal)
**Route**: `app/(protected)/recompenses.tsx` (modal)

**Components**:
- Close button (×)
- Badge grid (2 columns)
- Badge types: 7 JOURS, 14 JOURS, 1 MOIS
- Multiple color variants (orange, pink, blue, purple, yellow)
- Status dots under each badge

### 3.8 Stickers (Modal)
**Route**: `app/(protected)/stickers.tsx` (modal)

**Components**:
- Close button (×)
- Vertical sticker list
- Stickers: Bubble tea, Envelope heart, Coffee cup, Notebook, Heart face, Clouds (happy/sad), Sparkles, Colored tape strips

### 3.9 Réglages (Settings)
**Route**: `app/(protected)/settings/index.tsx`

**Components**:
- **Notifications card**:
  - Notifications email (toggle)
  - Notifications push (toggle)
  - Nouveaux messages (checkbox)
  - Invitations (checkbox)
  - "Enregistrer les préférences" button

- **Sécurité card**:
  - Double authentification (toggle)
  - Appareils connectés list

- **Confidentialité card**:
  - Profil visible (toggle)
  - Qui peut voir mes récompenses (dropdown: Amis)
  - "Télécharger mes données" button

- **Custom mode card**:
  - Clair / Sombre radio buttons
  - Taille du texte: Petit, Moyen checkboxes
  - Animations toggle
  - "Enregistrer les préférences" button

- **À propos card**:
  - Version de l'application 1.0.3
  - Mentions légales
  - Politique de confidentialité
  - Centre d'aide

- Se déconnecter button
- Supprimer le compte button (red)
- "Inviter des ami•es" bottom button

### 3.10 Posts System
**Components**:
- **Post Card**: Date, time, lock icon, content, likes count, action bar
- **Action bar**: Heart, Comment, Repost, Share icons
- **Post Detail Modal**: Full post + "Ajouter un commentaire" input + "Envoyer" button
- **Create Post Modal**: User avatar, date, lock toggle, rich text editor (B/I/U), image/mention buttons, "Publier" button

---

## 4. Technical Architecture

### 4.1 Component Library Architecture

#### Approach: shadcn-style for Expo
Create a custom component library in `expo/components/ui/` following shadcn/ui patterns:
- **Composable primitives** (not a published package)
- **Copy-paste ownership** (components live in the project)
- **NativeWind styling** (Tailwind classes, same tokens as web)
- **Consistent API** with web shadcn components where possible

```
expo/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── checkbox.tsx
├── toggle.tsx
├── radio-group.tsx
├── dropdown.tsx
├── modal.tsx
├── tabs.tsx
├── badge.tsx
├── avatar.tsx
├── separator.tsx
└── ...
```

#### External Libraries for Complex Components

| Component | Library | Why |
|-----------|---------|-----|
| **Calendar** | `react-native-calendars` | Highly customizable, theming support, works with NativeWind |
| **Charts** | `victory-native` | SVG-based, full style control, better than chart-kit |
| **Drag & Drop (Kanban)** | `react-native-draggable-flatlist` | Performant, Reanimated-based |
| **Date Picker** | `react-native-modal-datetime-picker` | Native feel, customizable |

#### Theming Consistency
- Use existing `tailwind.config.js` tokens (`homecafe-pink`, `background`, `foreground`, etc.)
- Mood colors to add in config
- All UI components consume theme via NativeWind `className`

### 4.2 Navigation Structure
```
app/
├── (auth)/                    # Existing
├── (protected)/
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Update: add new tabs
│   │   ├── index.tsx          # Dashboard (update)
│   │   ├── messages/          # Existing
│   │   ├── notifications/     # Existing
│   │   └── profile.tsx        # Existing
│   │
│   ├── journal/
│   │   ├── index.tsx          # Journal feed
│   │   ├── create.tsx         # Create post modal
│   │   └── post/[id].tsx      # Post detail
│   │
│   ├── moodboard/
│   │   ├── index.tsx          # Moodboard main
│   │   └── tracker.tsx        # Full year grid
│   │
│   ├── organisation/
│   │   ├── index.tsx          # Organisation tabs
│   │   ├── todo/new.tsx       # Create todo modal
│   │   ├── kanban/new.tsx     # Create kanban modal
│   │   └── task/[id].tsx      # Task detail
│   │
│   ├── social/
│   │   └── index.tsx          # Public feed
│   │
│   ├── settings/
│   │   └── index.tsx          # Settings
│   │
│   ├── galerie.tsx            # Gallery modal
│   ├── recompenses.tsx        # Badges modal
│   ├── stickers.tsx           # Stickers modal
│   │
│   ├── friends/               # Existing
│   └── profile/               # Existing
```

### 4.3 Shared Components to Create
```
expo/components/
├── ui/                        # shadcn-style primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── checkbox.tsx
│   ├── toggle.tsx
│   ├── radio-group.tsx
│   ├── dropdown.tsx
│   ├── modal.tsx
│   ├── tabs.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── separator.tsx
│   ├── slider.tsx
│   └── index.ts               # barrel export
│
├── journal/
│   ├── post-card.tsx
│   ├── post-feed.tsx
│   └── post-editor.tsx
│
├── moodboard/
│   ├── mood-legend.tsx
│   ├── mood-grid.tsx
│   ├── mood-slider.tsx
│   ├── mood-chart.tsx
│   └── year-tracker.tsx
│
├── organisation/
│   ├── todo-list.tsx
│   ├── todo-item.tsx
│   ├── kanban-board.tsx
│   ├── kanban-card.tsx
│   ├── timeline.tsx
│   └── calendar.tsx
│
├── social/
│   └── public-post-card.tsx
│
├── badges/
│   ├── badge-grid.tsx
│   └── badge-item.tsx
│
├── stickers/
│   └── sticker-item.tsx
│
└── shared/
    ├── section-card.tsx
    ├── widget-card.tsx
    └── action-bar.tsx
```

### 4.4 Design System

#### Colors (existing in tailwind config)
- Primary: `homecafe-pink` (#F691C3)
- Background: `background` (cream #FFF8F0)
- Text: `foreground` (#3D2E2E)
- Muted: `muted-foreground` (#8D7E7E)

#### Mood Colors (to add in tailwind config)
```js
mood: {
  calme: '#7CB9E8',        // blue
  enervement: '#E85454',   // red
  excitation: '#FFD93D',   // yellow
  anxiete: '#9CA3AF',      // gray
  tristesse: '#374151',    // dark gray/black
  bonheur: '#4ADE80',      // green
  ennui: '#FB923C',        // orange
  nervosite: '#F472B6',    // pink
  productivite: '#A78BFA', // purple
}
```

---

## 5. Implementation Phases

### Phase 1: Foundation (P0)
1. Setup `expo/components/ui/` with base primitives (button, card, input, checkbox, toggle, modal, tabs)
2. Add mood colors to tailwind config
3. Implement Settings screen (uses most UI primitives)

### Phase 2: Core Screens (P0)
4. Create Badge components + Récompenses modal
5. Create Stickers modal
6. Create Galerie modal
7. Update Dashboard with widget cards

### Phase 3: Journal & Moodboard (P1)
8. Create Journal components (post-card, post-feed, post-editor)
9. Implement Journal screens (feed, create, detail)
10. Create Moodboard components (legend, grid, slider, charts)
11. Implement Moodboard screens (main, tracker)

### Phase 4: Organisation (P1)
12. Install external libs (`react-native-calendars`, `victory-native`, `react-native-draggable-flatlist`)
13. Create Organisation components (todo, kanban, timeline, calendar)
14. Implement Organisation screens with all tabs

### Phase 5: Social & Polish (P2)
15. Implement Social screen
16. Post interactions (like, comment, share)
17. Final validation & visual QA

---

## 6. Dependencies

### New Packages to Install
```bash
# Charts
pnpm add victory-native react-native-svg

# Calendar
pnpm add react-native-calendars

# Drag & Drop for Kanban
pnpm add react-native-draggable-flatlist react-native-reanimated react-native-gesture-handler

# Date Picker (optional)
pnpm add react-native-modal-datetime-picker @react-native-community/datetimepicker
```

### Existing Packages (already in use)
- `react-native-qrcode-svg` - QR codes
- `lucide-react-native` - Icons
- `nativewind` - Tailwind styling
- `expo-router` - Navigation

---

## 7. Acceptance Criteria

### Visual
- [ ] All screens match Figma designs
- [ ] Consistent use of HomeCafe brand colors
- [ ] Proper spacing and typography
- [ ] Responsive on various screen sizes
- [ ] UI components consistent with web shadcn equivalents

### Functional
- [ ] All navigation routes work correctly
- [ ] Modals open/close properly
- [ ] Tab navigation is intuitive
- [ ] Loading states for async operations
- [ ] External libs (calendar, charts, drag&drop) properly themed

### Quality
- [ ] `pnpm type-check` passes
- [ ] `pnpm check` passes (Biome lint)
- [ ] `pnpm check:unused` shows no new unused code
- [ ] No TypeScript errors

---

## 8. Out of Scope (Backend)

The following require backend implementation (NOT in this PRD):
- Actual post creation/storage
- Mood data persistence
- Todo/Kanban data management
- Badge unlock logic
- Sticker collection
- Settings persistence

This PRD focuses on **UI implementation only**. Backend integration will be a separate task.

---

## 9. Task List

| ID | Task | Priority | Status |
|----|------|----------|--------|
| 1 | Setup `expo/components/ui/` base primitives | P0 | pending |
| 2 | Add mood colors to tailwind config | P0 | pending |
| 3 | Implement Settings screen | P0 | pending |
| 4 | Create Badge components | P0 | pending |
| 5 | Implement Récompenses modal | P0 | pending |
| 6 | Implement Stickers modal | P0 | pending |
| 7 | Implement Galerie modal | P0 | pending |
| 8 | Update Dashboard with widgets | P0 | pending |
| 9 | Create Journal components | P1 | pending |
| 10 | Implement Journal screens | P1 | pending |
| 11 | Create Moodboard components | P1 | pending |
| 12 | Implement Moodboard screens | P1 | pending |
| 13 | Install external libs | P1 | pending |
| 14 | Create Organisation components | P1 | pending |
| 15 | Implement Organisation screens | P1 | pending |
| 16 | Implement Social screen | P2 | pending |
| 17 | Post interactions | P2 | pending |
| 18 | Final validation | P2 | pending |
