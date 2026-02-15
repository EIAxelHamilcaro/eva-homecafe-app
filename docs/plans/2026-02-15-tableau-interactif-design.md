# Tableau Interactif & Personnalisable — Design

## Objectif

Transformer le tableau en mini-Notion : tout est éditable inline, les colonnes sont dynamiques, les statuts/priorités sont personnalisables.

## Changements

### 1. Schema DB

**Table `tableau`** — nouveaux champs :
- `status_options jsonb` : `[{id, label, color}]` — default : todo/in_progress/waiting/done
- `priority_options jsonb` : `[{id, label, level}]` — default : low/medium/high/critical
- `columns jsonb` : `[{id, name, type, position, options?}]` — colonnes custom

**Table `tableau_row`** — changements :
- `status` : enum → text (migration)
- `priority` : enum → text (migration)
- `custom_fields jsonb` : `{columnId: value}` — valeurs des colonnes custom

### 2. Backend

- **UpdateTableauUseCase** (nouveau) : met à jour titre, statusOptions, priorityOptions, columns
- **PATCH /api/v1/tableaux/:id** (nouveau endpoint)
- **UpdateTableauRowUseCase** : ajouter support `customFields`
- Domaine : ajouter `statusOptions`, `priorityOptions`, `columns` à l'agrégat Tableau
- Domaine : ajouter `customFields` à l'entité TableauRow

### 3. Frontend — Inline Editing

Pattern click-to-edit pour : titre tableau, nom ligne, texte ligne
- Repos : texte normal, cursor pointer
- Clic : Input auto-focused
- Blur/Enter : sauvegarde mutation
- Escape : annule

Date : Popover + Calendar shadcn
Fichiers : input file caché, click → upload

### 4. Frontend — Statuts/Priorités

- Options lues depuis `tableau.statusOptions` (pas hardcodées)
- Header "État" : bouton edit → Popover pour renommer labels/couleurs
- Pareil pour "Priorité"

### 5. Frontend — Colonnes dynamiques

- Bouton "+" → Popover choix type (texte, nombre, checkbox, date, select)
- Header renommable (click-to-edit)
- Cellules : input adapté au type
- Suppression colonne via menu header

## Types de colonnes custom

| Type | Input | Stockage |
|------|-------|----------|
| text | Input | string |
| number | Input type=number | number |
| checkbox | Checkbox | boolean |
| date | Calendar picker | string (ISO) |
| select | Select dropdown | string |
