# Organisation Page — Design Document

**Date:** 2026-02-15
**Scope:** Web uniquement (pas Expo)

## Overview

Refonte complète de la page Organisation pour matcher le design Figma (node 584-9202). Page scrollable type dashboard avec toutes les sections visibles, sections collapsables et réorganisables par drag & drop.

## Layout

### Structure principale

```
Header (nav existant)
├── Tab bar (pill-style, scroll-to-section navigation)
├── Section 1: Todo + Kanban (side by side)
│   ├── Left column (w-1/3): To-do lists empilées
│   └── Right column (w-2/3): Kanban boards
├── Section 2: Tableau (table views)
├── Section 3: Chronologie (Gantt timeline)
├── Section 4: Calendrier (monthly calendar)
└── Section 5: Badges (achievement badges)
```

### Tab Bar
- Container arrondi (bg-orange-50/border) centré
- 5 pill buttons: "To-do list", "Tableau", "Kanban", "Chronologie", "Calendrier"
- Active tab highlighted (bg-orange-400 text-white)
- Clic = smooth scroll vers la section correspondante
- Bouton "Filtre" à droite du tab bar

### Sections collapsables
- Chaque section = carte avec header (titre + toggle collapse + drag handle)
- Toggle button (⚙️) pour expand/collapse le contenu
- Drag handle (≡) pour réorganiser
- Layout order sauvegardé en localStorage

## Vues à implémenter

### 1. Todo List View (existe, polish)
- Colonne gauche du premier bloc
- To-do lists empilées verticalement
- Chaque list: titre, checkboxes, items
- Bouton "+ Ajouter une Nouvelle To do list" en bas
- Settings toggle icon par liste

### 2. Kanban View (existe, polish)
- Colonne droite du premier bloc
- Kanban board avec colonnes (À faire, En cours, En attente)
- Cards avec titre, description, progress, couleurs
- Settings toggle icon

### 3. Tableau View (NOUVEAU)
- Vue table des tâches d'un board
- Colonnes: Date, Nom, Texte, État, Priorité, Fichiers
- Rangées = cartes du board
- État affiché avec badges colorés (emoji + label)
- Priorité avec icônes (tally-3 = Prioritaire, tally-5 = Critique)
- Bouton + pour ajouter une rangée

### 4. Chronologie / Gantt View (NOUVEAU, remplace l'ancien)
- Timeline horizontale
- Axe X: Semaines (Semaine 1, 2, 3, 4) ou Mois (Janvier-Juin)
- Axe Y: Tâches
- Barres colorées représentant la durée des tâches
- Deux variantes: "Chronologie 1" (semaines) et "Chronologie 3" (mois)

### 5. Calendrier View (NOUVEAU, remplace l'ancien basique)
- Calendrier mensuel plein écran
- Grille 7 colonnes (Lun-Dim)
- Chaque cellule = une date avec les événements/tâches
- Événements affichés comme barres colorées dans les cellules
- Navigation mois précédent/suivant
- Bouton "Lier un calendrier externe"

### 6. Badges Section (NOUVEAU)
- Titre "Badges" + description
- Badges d'achievement (7 jours, 14 jours, 1 mois)
- Icônes badge colorées

## Backend

**Aucune modification** — les use cases existants fournissent toutes les données nécessaires:
- `GetUserBoardsUseCase` → boards (todo + kanban) avec colonnes et cartes
- Chronology API → cartes avec due dates
- Les nouvelles vues sont juste des rendus différents des mêmes données

## Fichiers à créer/modifier

### Nouveaux fichiers
- `_components/organisation-dashboard.tsx` — Orchestrateur principal
- `_components/section-wrapper.tsx` — Wrapper collapsable/draggable
- `_components/tab-navigation.tsx` — Tab bar pill-style
- `_components/tableau-view.tsx` — Vue table
- `_components/tableau-board.tsx` — Table d'un board spécifique
- `_components/gantt-view.tsx` — Vue Gantt timeline
- `_components/gantt-chart.tsx` — Chart Gantt component
- `_components/calendar-view.tsx` — Calendrier mensuel
- `_components/calendar-grid.tsx` — Grille du calendrier
- `_components/badges-section.tsx` — Section badges

### Fichiers modifiés
- `page.tsx` — Remplacé par le nouveau dashboard
- `todo-list-view.tsx` — Polish visuel
- `kanban-list-view.tsx` — Polish visuel, intégré side-by-side

### Fichiers supprimés
- `chronology-view.tsx` — Remplacé par gantt-view
- `chronology-calendar.tsx` — Remplacé par calendar-view
- `chronology-event-list.tsx` — Plus nécessaire
- `chronology-card-detail.tsx` — Plus nécessaire
