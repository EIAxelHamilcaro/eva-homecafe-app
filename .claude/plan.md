# HomeCafe Expo UI - Plan

## Overview
Implement all UI screens for the HomeCafe Expo mobile app based on Figma designs.

**Reference:** `PRD.md`

---

## Task List

```json
[
  {
    "id": "001",
    "category": "setup",
    "description": "Create button.tsx component",
    "steps": [
      "Create expo/components/ui/button.tsx",
      "Add variants: default, outline, ghost, link",
      "Add sizes: sm, md, lg",
      "Use NativeWind for styling"
    ],
    "passes": true
  },
  {
    "id": "002",
    "category": "setup",
    "description": "Create card.tsx component",
    "steps": [
      "Create expo/components/ui/card.tsx",
      "Add Card, CardHeader, CardContent, CardFooter subcomponents",
      "Use NativeWind for styling"
    ],
    "passes": true
  },
  {
    "id": "003",
    "category": "setup",
    "description": "Create input.tsx component",
    "steps": [
      "Create expo/components/ui/input.tsx",
      "Add label prop support",
      "Add error state styling"
    ],
    "passes": true
  },
  {
    "id": "004",
    "category": "setup",
    "description": "Create checkbox.tsx component",
    "steps": [
      "Create expo/components/ui/checkbox.tsx",
      "Add checked/unchecked states",
      "Add label support"
    ],
    "passes": true
  },
  {
    "id": "005",
    "category": "setup",
    "description": "Create toggle.tsx component",
    "steps": [
      "Create expo/components/ui/toggle.tsx",
      "Implement switch/toggle behavior",
      "Add on/off visual states"
    ],
    "passes": true
  },
  {
    "id": "006",
    "category": "setup",
    "description": "Create modal.tsx component",
    "steps": [
      "Create expo/components/ui/modal.tsx",
      "Add overlay backdrop",
      "Add close button support",
      "Handle open/close animations"
    ],
    "passes": true
  },
  {
    "id": "007",
    "category": "setup",
    "description": "Create tabs.tsx component",
    "steps": [
      "Create expo/components/ui/tabs.tsx",
      "Add Tabs, TabsList, TabsTrigger, TabsContent",
      "Handle active tab state"
    ],
    "passes": true
  },
  {
    "id": "008",
    "category": "setup",
    "description": "Create badge.tsx and avatar.tsx",
    "steps": [
      "Create expo/components/ui/badge.tsx",
      "Create expo/components/ui/avatar.tsx with image and fallback"
    ],
    "passes": true
  },
  {
    "id": "009",
    "category": "setup",
    "description": "Create separator.tsx and slider.tsx",
    "steps": [
      "Create expo/components/ui/separator.tsx",
      "Create expo/components/ui/slider.tsx with min/max/value props"
    ],
    "passes": true
  },
  {
    "id": "010",
    "category": "setup",
    "description": "Create dropdown.tsx and radio-group.tsx",
    "steps": [
      "Create expo/components/ui/dropdown.tsx",
      "Create expo/components/ui/radio-group.tsx"
    ],
    "passes": true
  },
  {
    "id": "011",
    "category": "setup",
    "description": "Create UI barrel export",
    "steps": [
      "Create expo/components/ui/index.ts",
      "Export all UI components"
    ],
    "passes": true
  },
  {
    "id": "012",
    "category": "setup",
    "description": "Add mood colors to tailwind config",
    "steps": [
      "Open expo/tailwind.config.js",
      "Add mood.calme (#7CB9E8), mood.enervement (#E85454), mood.excitation (#FFD93D)",
      "Add mood.anxiete (#9CA3AF), mood.tristesse (#374151), mood.bonheur (#4ADE80)",
      "Add mood.ennui (#FB923C), mood.nervosite (#F472B6), mood.productivite (#A78BFA)"
    ],
    "passes": true
  },
  {
    "id": "013",
    "category": "feature",
    "description": "Create Settings - Notifications card",
    "steps": [
      "Create app/(protected)/settings/index.tsx",
      "Add Notifications card with email toggle, push toggle",
      "Add nouveaux messages checkbox, invitations checkbox",
      "Add Enregistrer les préférences button"
    ],
    "passes": true
  },
  {
    "id": "014",
    "category": "feature",
    "description": "Create Settings - Sécurité card",
    "steps": [
      "Add Sécurité card to settings screen",
      "Add Double authentification toggle",
      "Add Appareils connectés list"
    ],
    "passes": true
  },
  {
    "id": "015",
    "category": "feature",
    "description": "Create Settings - Confidentialité card",
    "steps": [
      "Add Confidentialité card",
      "Add Profil visible toggle",
      "Add Qui peut voir mes récompenses dropdown",
      "Add Télécharger mes données button"
    ],
    "passes": true
  },
  {
    "id": "016",
    "category": "feature",
    "description": "Create Settings - Custom mode card",
    "steps": [
      "Add Custom mode card",
      "Add Clair/Sombre radio buttons",
      "Add Taille du texte checkboxes (Petit, Moyen)",
      "Add Animations toggle"
    ],
    "passes": true
  },
  {
    "id": "017",
    "category": "feature",
    "description": "Create Settings - À propos and actions",
    "steps": [
      "Add À propos card with version 1.0.3, legal links",
      "Add Se déconnecter button",
      "Add Supprimer le compte button (red)",
      "Add Inviter des ami•es button"
    ],
    "passes": true
  },
  {
    "id": "018",
    "category": "feature",
    "description": "Create badge-item component",
    "steps": [
      "Create expo/components/badges/badge-item.tsx",
      "Support color variants (orange, pink, blue, purple, yellow)",
      "Support types (7 JOURS, 14 JOURS, 1 MOIS)",
      "Add status dots"
    ],
    "passes": false
  },
  {
    "id": "019",
    "category": "feature",
    "description": "Create badge-grid component",
    "steps": [
      "Create expo/components/badges/badge-grid.tsx",
      "Render badges in 2 columns",
      "Use badge-item component"
    ],
    "passes": false
  },
  {
    "id": "020",
    "category": "feature",
    "description": "Implement Récompenses modal",
    "steps": [
      "Create app/(protected)/recompenses.tsx",
      "Configure as modal in _layout",
      "Add close button (×)",
      "Add badge-grid"
    ],
    "passes": false
  },
  {
    "id": "021",
    "category": "feature",
    "description": "Create sticker-item component",
    "steps": [
      "Create expo/components/stickers/sticker-item.tsx",
      "Support sticker types (bubble tea, envelope, coffee, etc.)",
      "Add sticker image display"
    ],
    "passes": false
  },
  {
    "id": "022",
    "category": "feature",
    "description": "Implement Stickers modal",
    "steps": [
      "Create app/(protected)/stickers.tsx",
      "Configure as modal",
      "Add close button (×)",
      "Add vertical sticker list"
    ],
    "passes": false
  },
  {
    "id": "023",
    "category": "feature",
    "description": "Implement Galerie modal",
    "steps": [
      "Create app/(protected)/galerie.tsx",
      "Configure as modal",
      "Add close button (×)",
      "Add scrolling image grid with placeholders"
    ],
    "passes": false
  },
  {
    "id": "024",
    "category": "feature",
    "description": "Create section-card component",
    "steps": [
      "Create expo/components/shared/section-card.tsx",
      "Add title and optional icon props",
      "Style with HomeCafe theme"
    ],
    "passes": false
  },
  {
    "id": "025",
    "category": "feature",
    "description": "Create widget-card component",
    "steps": [
      "Create expo/components/shared/widget-card.tsx",
      "Add title and Voir plus link",
      "Add onPress handler"
    ],
    "passes": false
  },
  {
    "id": "026",
    "category": "feature",
    "description": "Create action-bar component",
    "steps": [
      "Create expo/components/shared/action-bar.tsx",
      "Add heart, comment, repost, share icons",
      "Add press handlers"
    ],
    "passes": false
  },
  {
    "id": "027",
    "category": "feature",
    "description": "Create post-card component",
    "steps": [
      "Create expo/components/journal/post-card.tsx",
      "Add date, time, lock icon, content, likes",
      "Integrate action-bar"
    ],
    "passes": false
  },
  {
    "id": "028",
    "category": "feature",
    "description": "Create post-feed component",
    "steps": [
      "Create expo/components/journal/post-feed.tsx",
      "Group posts by date",
      "Use FlatList with post-card"
    ],
    "passes": false
  },
  {
    "id": "029",
    "category": "feature",
    "description": "Create post-editor component",
    "steps": [
      "Create expo/components/journal/post-editor.tsx",
      "Add B/I/U toolbar",
      "Add image and mention buttons",
      "Add text input"
    ],
    "passes": false
  },
  {
    "id": "030",
    "category": "feature",
    "description": "Implement Journal feed screen",
    "steps": [
      "Create app/(protected)/journal/index.tsx",
      "Add header with Logo",
      "Add Ajouter un post button",
      "Add post-feed"
    ],
    "passes": false
  },
  {
    "id": "031",
    "category": "feature",
    "description": "Implement Journal create modal",
    "steps": [
      "Create app/(protected)/journal/create.tsx",
      "Add avatar, date, lock toggle",
      "Add post-editor",
      "Add Publier button"
    ],
    "passes": false
  },
  {
    "id": "032",
    "category": "feature",
    "description": "Implement Journal post detail",
    "steps": [
      "Create app/(protected)/journal/post/[id].tsx",
      "Display full post",
      "Add comments section",
      "Add comment input with Envoyer"
    ],
    "passes": false
  },
  {
    "id": "033",
    "category": "feature",
    "description": "Create mood-legend component",
    "steps": [
      "Create expo/components/moodboard/mood-legend.tsx",
      "Display 9 emotions with colors",
      "Use mood colors from config"
    ],
    "passes": false
  },
  {
    "id": "034",
    "category": "feature",
    "description": "Create mood-grid component",
    "steps": [
      "Create expo/components/moodboard/mood-grid.tsx",
      "Display weekly grid (L M M J V S D)",
      "Allow mood selection per day"
    ],
    "passes": false
  },
  {
    "id": "035",
    "category": "feature",
    "description": "Create mood-slider component",
    "steps": [
      "Create expo/components/moodboard/mood-slider.tsx",
      "Add 0-100 slider",
      "Add Valider button"
    ],
    "passes": false
  },
  {
    "id": "036",
    "category": "feature",
    "description": "Install victory-native",
    "steps": [
      "Run: cd expo && pnpm add victory-native react-native-svg",
      "Verify installation"
    ],
    "passes": false
  },
  {
    "id": "037",
    "category": "feature",
    "description": "Create mood-chart component",
    "steps": [
      "Create expo/components/moodboard/mood-chart.tsx",
      "Add line chart for weekly",
      "Add bar chart for monthly",
      "Use victory-native"
    ],
    "passes": false
  },
  {
    "id": "038",
    "category": "feature",
    "description": "Create year-tracker component",
    "steps": [
      "Create expo/components/moodboard/year-tracker.tsx",
      "Display full year grid",
      "Color squares based on mood"
    ],
    "passes": false
  },
  {
    "id": "039",
    "category": "feature",
    "description": "Implement Moodboard main screen",
    "steps": [
      "Create app/(protected)/moodboard/index.tsx",
      "Add date with stickers button",
      "Add mood-legend card",
      "Add mood-grid card",
      "Add mood-slider card"
    ],
    "passes": false
  },
  {
    "id": "040",
    "category": "feature",
    "description": "Complete Moodboard screen",
    "steps": [
      "Add Suivi weekly with mood-chart",
      "Add Suivi monthly with mood-chart",
      "Add Badges card",
      "Add Inviter button"
    ],
    "passes": false
  },
  {
    "id": "041",
    "category": "feature",
    "description": "Implement Moodboard tracker",
    "steps": [
      "Create app/(protected)/moodboard/tracker.tsx",
      "Add year-tracker component",
      "Add back navigation"
    ],
    "passes": false
  },
  {
    "id": "042",
    "category": "feature",
    "description": "Install react-native-calendars",
    "steps": [
      "Run: cd expo && pnpm add react-native-calendars",
      "Verify installation"
    ],
    "passes": false
  },
  {
    "id": "043",
    "category": "feature",
    "description": "Install react-native-draggable-flatlist",
    "steps": [
      "Run: cd expo && pnpm add react-native-draggable-flatlist",
      "Verify reanimated and gesture-handler present"
    ],
    "passes": false
  },
  {
    "id": "044",
    "category": "feature",
    "description": "Create todo-item component",
    "steps": [
      "Create expo/components/organisation/todo-item.tsx",
      "Add checkbox with label",
      "Add completed styling"
    ],
    "passes": false
  },
  {
    "id": "045",
    "category": "feature",
    "description": "Create todo-list component",
    "steps": [
      "Create expo/components/organisation/todo-list.tsx",
      "Add list title",
      "Render todo-items",
      "Add new item input"
    ],
    "passes": false
  },
  {
    "id": "046",
    "category": "feature",
    "description": "Create kanban-card component",
    "steps": [
      "Create expo/components/organisation/kanban-card.tsx",
      "Add title, colored labels",
      "Add progress bar"
    ],
    "passes": false
  },
  {
    "id": "047",
    "category": "feature",
    "description": "Create kanban-board component",
    "steps": [
      "Create expo/components/organisation/kanban-board.tsx",
      "Add columns (To Do, In Progress, Done)",
      "Use draggable-flatlist"
    ],
    "passes": false
  },
  {
    "id": "048",
    "category": "feature",
    "description": "Create timeline component",
    "steps": [
      "Create expo/components/organisation/timeline.tsx",
      "Display vertical timeline",
      "Add time markers and task cards"
    ],
    "passes": false
  },
  {
    "id": "049",
    "category": "feature",
    "description": "Create calendar component",
    "steps": [
      "Create expo/components/organisation/calendar.tsx",
      "Use react-native-calendars",
      "Apply HomeCafe theme"
    ],
    "passes": false
  },
  {
    "id": "050",
    "category": "feature",
    "description": "Implement Organisation main screen",
    "steps": [
      "Create app/(protected)/organisation/index.tsx",
      "Add tab bar with 5 tabs",
      "Use tabs component"
    ],
    "passes": false
  },
  {
    "id": "051",
    "category": "feature",
    "description": "Implement Organisation tabs content",
    "steps": [
      "Add To do list tab with todo-list",
      "Add Kanban tab with kanban-board",
      "Add Chronologie tab with timeline",
      "Add Calendrier tab with calendar"
    ],
    "passes": false
  },
  {
    "id": "052",
    "category": "feature",
    "description": "Implement Organisation modals",
    "steps": [
      "Create app/(protected)/organisation/todo/new.tsx",
      "Create app/(protected)/organisation/kanban/new.tsx",
      "Create app/(protected)/organisation/task/[id].tsx"
    ],
    "passes": false
  },
  {
    "id": "053",
    "category": "feature",
    "description": "Create public-post-card component",
    "steps": [
      "Create expo/components/social/public-post-card.tsx",
      "Similar to post-card",
      "Add sticker icon"
    ],
    "passes": false
  },
  {
    "id": "054",
    "category": "feature",
    "description": "Implement Social screen",
    "steps": [
      "Create app/(protected)/social/index.tsx",
      "Add header",
      "Add Derniers posts publics title",
      "Add public post feed"
    ],
    "passes": false
  },
  {
    "id": "055",
    "category": "feature",
    "description": "Dashboard - Galerie widget",
    "steps": [
      "Update app/(protected)/(tabs)/index.tsx",
      "Add Galerie preview (4 thumbnails)",
      "Add Voir plus to galerie"
    ],
    "passes": false
  },
  {
    "id": "056",
    "category": "feature",
    "description": "Dashboard - Messagerie widget",
    "steps": [
      "Add Messagerie preview card",
      "Show unread count",
      "Add Voir plus to messages"
    ],
    "passes": false
  },
  {
    "id": "057",
    "category": "feature",
    "description": "Dashboard - Suivi widgets",
    "steps": [
      "Add Suivi monthly bar chart",
      "Add Suivi weekly line graph"
    ],
    "passes": false
  },
  {
    "id": "058",
    "category": "feature",
    "description": "Dashboard - Calendar widget",
    "steps": [
      "Add Calendar widget",
      "Link to organisation"
    ],
    "passes": false
  },
  {
    "id": "059",
    "category": "feature",
    "description": "Dashboard - Todo widget",
    "steps": [
      "Add To do list preview (3 items)",
      "Add Voir plus to organisation"
    ],
    "passes": false
  },
  {
    "id": "060",
    "category": "feature",
    "description": "Dashboard - Journal and Mood widgets",
    "steps": [
      "Add Journal quick entry card",
      "Add Moodboard slider card"
    ],
    "passes": false
  },
  {
    "id": "061",
    "category": "feature",
    "description": "Dashboard - CTA button",
    "steps": [
      "Add Inviter des ami•es button",
      "Link to friends invite"
    ],
    "passes": false
  },
  {
    "id": "062",
    "category": "testing",
    "description": "Run type-check and lint",
    "steps": [
      "Run: cd expo && pnpm type-check",
      "Run: cd expo && pnpm check",
      "Fix all errors"
    ],
    "passes": false
  },
  {
    "id": "063",
    "category": "testing",
    "description": "Final visual review",
    "steps": [
      "Verify screens match Figma",
      "Test all navigation",
      "Test all modals"
    ],
    "passes": false
  }
]
```

---

## Agent Instructions

1. Read `activity.md` first to understand current state
2. Find next task with `"passes": false` (lowest ID first)
3. Complete all steps for that task
4. Verify no errors (type-check, lint if applicable)
5. **Update ONLY the `"passes"` field from `false` to `true`** - do not modify anything else in the task
6. Log in `activity.md`: `[ID] description - done`
7. Commit: `feat(expo): [ID] description`
8. Repeat until all tasks pass

**Critical:** 
- Only change `"passes": false` → `"passes": true`
- Do not remove, reorder, or rewrite tasks
- Do not modify task descriptions or steps

---

## Completion Criteria
All 63 tasks marked with `"passes": true`
