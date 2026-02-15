# Design : Calendrier interactif + Google Calendar

## Contexte

La page Organisation possède un CalendarView (lecture seule) qui affiche les cartes des boards par date. L'objectif est de transformer ce calendrier en un outil interactif complet :

1. **Événements locaux** : créer des événements propres au calendrier (titre + couleur + date)
2. **Auth Google** : login/signup avec Google via BetterAuth + lien de compte
3. **Google Calendar** : lecture/écriture d'événements Google Calendar
4. **Tuto** : modale explicative pour connecter Google Calendar

## Architecture

### Domaine CalendarEvent (DDD léger)

Nouveau domaine indépendant — pas d'event dispatch (CRUD simple sans side effects).

```
src/domain/calendar-event/
├── calendar-event.aggregate.ts    # Aggregate (title, color, date, userId)
├── calendar-event-id.ts           # Typed ID
└── value-objects/
    ├── event-title.vo.ts          # 1-100 chars
    └── event-color.vo.ts          # Enum de couleurs prédéfinies
```

**Propriétés :**
- `title: EventTitle` — nom de l'événement (1-100 chars)
- `color: EventColor` — couleur parmi palette prédéfinie (pink, green, orange, blue, purple, amber, red, teal)
- `date: string` — format YYYY-MM-DD
- `userId: string` — propriétaire
- `createdAt: Date`
- `updatedAt?: Date`

### Application Layer

```
src/application/use-cases/calendar-event/
├── create-calendar-event.use-case.ts
├── update-calendar-event.use-case.ts
├── delete-calendar-event.use-case.ts
└── __tests__/
    ├── create-calendar-event.use-case.test.ts
    ├── update-calendar-event.use-case.test.ts
    └── delete-calendar-event.use-case.test.ts

src/application/dto/calendar-event/
├── common-calendar-event.dto.ts
├── create-calendar-event.dto.ts
├── update-calendar-event.dto.ts
└── delete-calendar-event.dto.ts

src/application/ports/
└── calendar-event-repository.port.ts   # ICalendarEventRepository
```

### Adapters

```
src/adapters/repositories/calendar-event.repository.ts
src/adapters/mappers/calendar-event.mapper.ts
src/adapters/controllers/calendar-event/calendar-event.controller.ts
```

### API Routes

```
app/api/v1/calendar-events/route.ts           # GET (list by month), POST (create)
app/api/v1/calendar-events/[eventId]/route.ts  # PUT (update), DELETE
```

### Schema DB

```sql
-- packages/drizzle/src/schema/calendar-event.ts
calendar_event (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  color       TEXT NOT NULL,
  date        TEXT NOT NULL,          -- YYYY-MM-DD
  user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP
)
```

### DI Module

```
common/di/modules/calendar-event.module.ts
```

Bindings : `ICalendarEventRepository`, `CreateCalendarEventUseCase`, `UpdateCalendarEventUseCase`, `DeleteCalendarEventUseCase`.

## Auth Google (BetterAuth)

### Configuration serveur

Ajouter dans `common/auth.ts` :

```typescript
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    accessType: "offline",
    prompt: "consent",
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  },
},
```

### Client auth

Créer `common/auth-client.ts` avec `createAuthClient()` de `better-auth/client` pour le sign-in social côté client.

### Pages login/signup

Ajouter un bouton "Se connecter avec Google" sous le formulaire existant, séparé par un divider "ou".

### Lien de compte (profil)

Bouton "Connecter Google Calendar" dans le profil pour les utilisateurs existants (email/password) qui veulent lier leur compte Google.

## Google Calendar Integration

### Lecture

- Endpoint serveur : `GET /api/v1/google-calendar/events?month=YYYY-MM`
- Utilise `auth.api.getAccessToken({ providerId: "google" })` pour récupérer le token
- Appelle `https://www.googleapis.com/calendar/v3/calendars/primary/events`
- Retourne les événements formatés pour la grille

### Écriture

- Endpoint serveur : `POST /api/v1/google-calendar/events`
- Crée un événement sur Google Calendar via l'API
- Utilisé optionnellement lors de la création d'un événement local

### Fusion dans CalendarGrid

Le CalendarView fusionne 3 sources :
1. **Events locaux** (CalendarEvent) — icône locale
2. **Events boards** (IChronologyCardDto) — icône board
3. **Events Google** (si connecté) — icône Google

Chaque source a un badge visuel pour différencier l'origine.

## Frontend

### Hook React Query

```
app/(protected)/_hooks/use-calendar-events.ts
```

- `useCalendarEventsQuery(month)` — événements locaux du mois
- `useCreateCalendarEventMutation()`
- `useUpdateCalendarEventMutation()`
- `useDeleteCalendarEventMutation()`
- `useGoogleCalendarEventsQuery(month)` — événements Google (si connecté)

### Modale création événement

Clic sur une cellule de date → Dialog avec :
- Input titre
- Palette de couleurs (8 pastilles cliquables)
- Checkbox "Ajouter aussi à Google Calendar" (si connecté)
- Boutons Annuler / Créer

### Modale tuto Google Calendar

Accessible via le bouton "Lier un calendrier externe" existant :
- Step 1 : "Connectez votre compte Google"
- Step 2 : "Autorisez l'accès à votre calendrier"
- Step 3 : "Vos événements apparaissent automatiquement"
- Bouton CTA "Connecter Google" → lance OAuth flow
- Si déjà connecté : affiche statut "Connecté" + bouton déconnecter

## Hors scope

- Pas de récurrence d'événements
- Pas de notifications/rappels
- Pas de partage de calendrier entre utilisateurs
- Pas de drag-and-drop pour déplacer les événements
- Pas d'autres providers (Apple, Outlook)
