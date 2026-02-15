# Tableau Independant — Design Document

## Context

The current Tableau implementation incorrectly reuses Kanban board data. The Figma shows Tableau as an **independent entity** — a flat table where users create rows with specific fields (Date, Nom, Texte, Etat, Priorite, Fichiers). Each Tableau is independent from Kanban boards and Todo lists.

## Approach

**Approach A: New Tableau Aggregate** — separate domain model, DB tables, use cases, and API routes.

## Domain Model

### Tableau Aggregate

```
src/domain/tableau/
  tableau.aggregate.ts
  tableau-id.ts
  tableau-row.entity.ts
  tableau-row-id.ts
  value-objects/
    tableau-title.vo.ts
    row-status.vo.ts      # "todo" | "in_progress" | "waiting" | "done"
    row-priority.vo.ts    # "low" | "medium" | "high" | "critical"
  events/
    tableau-created.event.ts
```

**Tableau props:** userId, title, rows[], createdAt, updatedAt
**TableauRow props:** name, text (optional), status, priority, date, files (string[] URLs), position, createdAt, updatedAt

**Aggregate methods:**
- `Tableau.create(userId, title)` — new empty tableau
- `addRow(props)` — add row at end
- `updateRow(rowId, updates)` — update row fields
- `removeRow(rowId)` — delete row

## Database Schema

```sql
tableau
  id         UUID PK
  userId     TEXT FK -> user
  title      TEXT NOT NULL
  createdAt  TIMESTAMP
  updatedAt  TIMESTAMP

tableau_row
  id         UUID PK
  tableauId  UUID FK -> tableau (CASCADE DELETE)
  name       TEXT NOT NULL
  text       TEXT
  status     TEXT DEFAULT 'todo'    -- enum: todo, in_progress, waiting, done
  priority   TEXT DEFAULT 'low'     -- enum: low, medium, high, critical
  date       TEXT                   -- ISO date string
  files      JSON DEFAULT '[]'     -- array of R2 URLs
  position   INTEGER NOT NULL
  createdAt  TIMESTAMP
  updatedAt  TIMESTAMP
```

## Use Cases

| Use Case | Input | Output |
|----------|-------|--------|
| GetUserTableaux | userId | ITableauDto[] |
| CreateTableau | userId, title | ITableauDto |
| DeleteTableau | userId, tableauId | void |
| AddTableauRow | userId, tableauId, row fields | ITableauDto |
| UpdateTableauRow | userId, tableauId, rowId, updates | ITableauDto |
| RemoveTableauRow | userId, tableauId, rowId | ITableauDto |

## API Routes

```
GET    /api/v1/tableaux           → list user tableaux
POST   /api/v1/tableaux           → create tableau
DELETE /api/v1/tableaux/:id       → delete tableau
POST   /api/v1/tableaux/:id/rows  → add row
PUT    /api/v1/tableaux/:id/rows/:rowId  → update row
DELETE /api/v1/tableaux/:id/rows/:rowId  → remove row
```

## Frontend

### Hooks (React Query)
- `useTableauxQuery()` — fetch all user tableaux
- `useCreateTableauMutation()` — create new tableau
- `useDeleteTableauMutation()` — delete tableau
- `useAddRowMutation(tableauId)` — add row
- `useUpdateRowMutation(tableauId)` — update row
- `useRemoveRowMutation(tableauId)` — remove row

### Components
- `tableau-view.tsx` — list all tableaux, create button
- `tableau-board.tsx` — single tableau as editable table
- Uses shadcn/ui Table component
- Inline editing for cells (click to edit)
- File upload via existing presigned URL system (add "tableau" context)

### Figma Mapping
| Column | UI | Interaction |
|--------|----|-------------|
| Date | Date text | Click to edit (date picker) |
| Nom | Text | Click to edit |
| Texte | Multiline text | Click to edit |
| Etat | Dropdown badge | Select from: A faire, En cours, En attente, Termine |
| Priorite | Priority bars | Select from: low, medium, high, critical |
| Fichiers | File count + link | Upload button, shows count |

## File Upload

Reuse existing R2 presigned URL infrastructure:
- Add "tableau" to upload context enum in `generate-upload-url.dto.ts`
- Frontend uses same presigned URL flow as gallery/moodboard
