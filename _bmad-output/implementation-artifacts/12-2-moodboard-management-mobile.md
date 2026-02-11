# Story 12.2: Moodboard Management (Mobile)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want to create and manage visual moodboards from my phone,
So that I can curate and browse visual inspiration anywhere.

## Acceptance Criteria

1. **Given** an authenticated mobile user **When** they navigate to the moodboard screen **Then** they see a list of their moodboards fetched from `GET /api/v1/moodboards` with pagination, showing title, pin count, and preview thumbnails (up to 4 pins)

2. **Given** an authenticated mobile user **When** they tap "Create Moodboard" and enter a title **Then** a new moodboard is created via `POST /api/v1/moodboards` and appears in the list

3. **Given** an authenticated mobile user viewing a moodboard detail **When** they see the moodboard **Then** all pins (images and colors) are displayed in a grid, fetched from `GET /api/v1/moodboards/:id`

4. **Given** an authenticated mobile user viewing a moodboard **When** they tap "Add Image" and select a photo via expo-image-picker **Then** the image is uploaded via the presigned URL flow (`POST /api/v1/upload` with context "moodboard" → PUT to R2 → `POST /api/v1/moodboards/:id/pins` with type "image") and appears in the pin grid

5. **Given** an authenticated mobile user viewing a moodboard **When** they tap "Add Color" and select a hex color **Then** a color pin is added via `POST /api/v1/moodboards/:id/pins` with type "color" and appears in the pin grid

6. **Given** an authenticated mobile user viewing a moodboard **When** they long-press a pin **Then** they see a delete confirmation, and on confirm the pin is removed via `DELETE /api/v1/moodboards/:id/pins/:pinId`

7. **Given** an authenticated mobile user on the moodboard list **When** they long-press a moodboard **Then** they see a delete confirmation, and on confirm the moodboard is removed via `DELETE /api/v1/moodboards/:id`

8. **Given** no moodboards exist **When** the user views the moodboard screen **Then** they see an empty state encouraging creation of their first moodboard with a CTA button

9. **Given** a moodboard with no pins **When** the user views the detail **Then** they see an empty state encouraging them to add their first pin

10. **Given** the dashboard **When** it loads **Then** a moodboard widget displays a preview of the most recent moodboard (title + 4 pin thumbnails) fetched from `GET /api/v1/moodboards?limit=1`, or an empty state with CTA

## Tasks / Subtasks

- [x] Task 1: Create moodboard type definitions and query keys (AC: #1, #3, #10)
  - [x] 1.1 Create `types/moodboard.ts` with `MoodboardListItemDto`, `MoodboardDetailDto`, `MoodboardPinDto`, `CreateMoodboardInput`, `AddPinInput`, `MoodboardListResponse`, `PresignedUploadResponse` interfaces matching backend DTOs
  - [x] 1.2 Add `moodboardKeys` factory to `lib/api/hooks/query-keys.ts` with keys: `all`, `list(page?, limit?)`, `detail(id)`

- [x] Task 2: Create moodboard API hooks (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] 2.1 Create `lib/api/hooks/use-moodboards.ts` with:
    - `useMoodboards(page?, limit?)` — `useQuery` fetching `GET /api/v1/moodboards`
    - `useMoodboardDetail(id)` — `useQuery` fetching `GET /api/v1/moodboards/:id` (enabled when id is truthy)
    - `useCreateMoodboard()` — `useMutation` calling `POST /api/v1/moodboards`
    - `useDeleteMoodboard()` — `useMutation` calling `DELETE /api/v1/moodboards/:id`
    - `useAddPin()` — `useMutation` calling `POST /api/v1/moodboards/:id/pins`
    - `useDeletePin()` — `useMutation` calling `DELETE /api/v1/moodboards/:id/pins/:pinId`
  - [x] 2.2 Create `lib/api/hooks/use-moodboard-upload.ts` with `useMoodboardUpload(moodboardId)` hook that:
    - Gets presigned URL via `POST /api/v1/upload` with `{ context: "moodboard", filename, mimeType, size }`
    - Uploads file to R2 via XHR PUT to the presigned URL (with progress tracking)
    - Adds image pin via `POST /api/v1/moodboards/:id/pins` with `{ type: "image", imageUrl: fileUrl }`
    - Invalidates `moodboardKeys.all` + `moodboardKeys.detail(id)` on success
  - [x] 2.3 Create `lib/hooks/use-moodboard-image-picker.ts` wrapping expo-image-picker + useMoodboardUpload for the complete pick-and-upload flow

- [x] Task 3: Create moodboard list screen (AC: #1, #2, #7, #8)
  - [x] 3.1 Create `app/(protected)/inspirations/index.tsx` — moodboard list screen with `useMoodboards()` hook data
  - [x] 3.2 Create `app/(protected)/inspirations/_layout.tsx` — Stack layout for list + detail screens
  - [x] 3.3 Render moodboard cards showing title, pin count, and up to 4 preview pin thumbnails
  - [x] 3.4 Add create moodboard button — opens a TextInput modal/alert for title entry → `useCreateMoodboard()` mutation
  - [x] 3.5 Add long-press delete with `Alert.alert` confirmation → `useDeleteMoodboard()` mutation
  - [x] 3.6 Add empty state component when no moodboards exist
  - [x] 3.7 Add loading skeleton while data fetches, error state with retry
  - [x] 3.8 Add `RefreshControl` pull-to-refresh to refetch moodboard list
  - [x] 3.9 Register `inspirations` route in `app/(protected)/_layout.tsx` Stack

- [x] Task 4: Create moodboard detail screen (AC: #3, #4, #5, #6, #9)
  - [x] 4.1 Create `app/(protected)/inspirations/[id].tsx` — detail screen with `useMoodboardDetail(id)` hook data
  - [x] 4.2 Render pin grid showing images (via `<Image>`) and color swatches (via colored `<View>`)
  - [x] 4.3 Add "Add Image" FAB button wired to `useMoodboardImagePicker(moodboardId)` with upload progress indicator
  - [x] 4.4 Add "Add Color" button — opens a simple color picker (predefined palette or hex input) → `useAddPin()` with type "color"
  - [x] 4.5 Add long-press pin delete with `Alert.alert` confirmation → `useDeletePin()` mutation
  - [x] 4.6 Add empty state when moodboard has no pins
  - [x] 4.7 Add loading skeleton, error state with retry, pull-to-refresh

- [x] Task 5: Create dashboard moodboard widget (AC: #10)
  - [x] 5.1 Create `app/(protected)/(tabs)/_components/moodboard-widget.tsx` with `useMoodboards(1, 1)` data — show most recent moodboard preview
  - [x] 5.2 Render moodboard card with title and up to 4 pin thumbnails (images or color swatches)
  - [x] 5.3 Show empty state with "Crée ton premier moodboard" CTA linking to `/inspirations` when no moodboards exist
  - [x] 5.4 Add `<MoodboardWidget />` to dashboard `index.tsx` between Journal and Mood widgets

## Dev Notes

### Backend API Contract (Existing — DO NOT modify backend)

The web backend API is fully implemented. The mobile app consumes these endpoints:

| Method | Endpoint | Purpose | Request Body | Response Shape |
|--------|----------|---------|-------------|----------------|
| GET | `/api/v1/moodboards` | List user's moodboards | Query: `?page=1&limit=20` | `MoodboardListResponse` |
| POST | `/api/v1/moodboards` | Create moodboard | `{ title }` | `CreateMoodboardOutput` (201) |
| GET | `/api/v1/moodboards/[id]` | Get moodboard detail with pins | — | `MoodboardDetailDto` |
| DELETE | `/api/v1/moodboards/[id]` | Delete moodboard + R2 cleanup | — | `{ id }` |
| POST | `/api/v1/moodboards/[id]/pins` | Add pin to moodboard | `{ type, imageUrl?, color? }` | `PinDto` (201) |
| DELETE | `/api/v1/moodboards/[id]/pins/[pinId]` | Remove pin | — | `{ id }` |
| POST | `/api/v1/upload` | Get presigned upload URL | `{ context: "moodboard", filename, mimeType, size }` | `PresignedUploadResponse` |

**MoodboardListResponse Structure:**
```typescript
{
  moodboards: MoodboardListItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

**MoodboardListItemDto Structure:**
```typescript
{
  id: string;
  title: string;
  pinCount: number;
  previewPins: {
    id: string;
    type: "image" | "color";
    imageUrl: string | null;
    color: string | null;
    position: number;
  }[];
  createdAt: string; // ISO 8601
}
```

**MoodboardDetailDto Structure:**
```typescript
{
  id: string;
  title: string;
  userId: string;
  pins: {
    id: string;
    type: "image" | "color";
    imageUrl: string | null;
    color: string | null;
    position: number;
    createdAt: string; // ISO 8601
  }[];
  createdAt: string; // ISO 8601
}
```

**CreateMoodboardOutput Structure:**
```typescript
{
  id: string;
  title: string;
  userId: string;
  createdAt: string; // ISO 8601
}
```

**AddPinInput — Image Pin:**
```typescript
{
  type: "image";
  imageUrl: "https://r2.example.com/moodboard/userId/uuid.jpg";
}
```

**AddPinInput — Color Pin:**
```typescript
{
  type: "color";
  color: "#FF5733";
}
```

**AddPinOutput Structure:**
```typescript
{
  id: string;
  type: "image" | "color";
  imageUrl: string | null;
  color: string | null;
  position: number;
  createdAt: string; // ISO 8601
}
```

**PresignedUploadResponse Structure:**
```typescript
{
  uploadUrl: string;  // Presigned R2 PUT URL (15min expiry)
  fileUrl: string;    // Final public URL for the file
  key: string;        // R2 object key: "moodboard/{userId}/{uuid}.{ext}"
  expiresAt: string;  // ISO 8601 expiry timestamp
}
```

**Image Upload Flow (3 steps — same as gallery):**
1. `POST /api/v1/upload` with `{ context: "moodboard", filename, mimeType, size }` → returns `{ uploadUrl, fileUrl }`
2. `PUT {uploadUrl}` — upload raw file bytes to R2 via XHR (supports progress events)
3. `POST /api/v1/moodboards/:id/pins` with `{ type: "image", imageUrl: fileUrl }` → registers pin on moodboard

**Accepted MIME types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`
**Max file size:** 10MB
**Max pins per moodboard:** 50
**Moodboard title:** 1-100 characters

### Architecture Compliance

- **API Client**: Use existing `lib/api/client.ts` — NEVER create a new client
- **Auth Tokens**: Handled automatically by `ApiClient` (SecureStore + in-memory cache)
- **TanStack Query**: Follow patterns from `use-gallery.ts`, `use-mood.ts`, `use-posts.ts`
- **Query Keys**: Add `moodboardKeys` to existing `query-keys.ts` using factory pattern
- **Error Handling**: Use `ApiError` class, display via Alert.alert or inline error
- **NativeWind Styling**: All styles via Tailwind classNames, not StyleSheet
- **Type Everything**: No `any`, use proper TypeScript interfaces
- **SafeAreaView**: Import from `react-native-safe-area-context` (NOT from `react-native`)

### Upload Architecture — Reuse Gallery Presigned URL Pattern

The moodboard image upload follows the **same presigned URL flow** as gallery (Story 12.1). Key references:
- **Gallery upload hook**: `lib/api/hooks/use-gallery-upload.ts` — copy this pattern for `use-moodboard-upload.ts`
- **Gallery image picker**: `lib/hooks/use-gallery-image-picker.ts` — copy for `use-moodboard-image-picker.ts`
- **Upload endpoint**: `POST /api/v1/upload` with `context: "moodboard"` (NOT "gallery")
- **Registration endpoint**: `POST /api/v1/moodboards/:id/pins` (NOT `/api/v1/gallery`)

**DO NOT reuse `use-media-upload.ts`** — it's chat-specific with a different upload flow (multipart vs presigned URL).
**DO NOT reuse `use-gallery-upload.ts` directly** — it registers photos in the gallery. Create a separate hook that registers pins on a moodboard.

### Color Picker Implementation

There is no color picker library installed. For color pins, use a **predefined color palette** approach:
- Define a `MOODBOARD_COLORS` constant array with 12-16 curated hex colors
- Display as a grid of colored circles/squares the user can tap
- Optionally add a hex input field for custom colors (validate with `/^#[0-9a-fA-F]{6}$/`)
- This avoids installing a new library (critical guardrail)

### Existing Components to Reuse or Modify

| Component | Path | Current State | Action |
|-----------|------|---------------|--------|
| API Client | `lib/api/client.ts` | Complete with `uploadFile()` XHR method | Use `api.get()`, `api.post()`, `api.delete()` for moodboard API; XHR for R2 presigned upload |
| Gallery Upload | `lib/api/hooks/use-gallery-upload.ts` | Complete presigned URL flow | **Reference pattern** — copy structure for moodboard upload |
| Gallery Image Picker | `lib/hooks/use-gallery-image-picker.ts` | Complete | **Reference pattern** — copy for moodboard image picker |
| Dashboard Index | `app/(protected)/(tabs)/index.tsx` | 8 widgets displayed | Add `<MoodboardWidget />` |

### New Files to Create

```
apps/expo/
├── types/
│   └── moodboard.ts                              # Moodboard type definitions
├── lib/
│   ├── api/hooks/
│   │   ├── use-moodboards.ts                     # Moodboard TanStack Query hooks (list, detail, CRUD)
│   │   └── use-moodboard-upload.ts               # Presigned URL upload flow for image pins
│   └── hooks/
│       └── use-moodboard-image-picker.ts          # Image picker + moodboard upload integration
└── app/(protected)/
    ├── inspirations/
    │   ├── _layout.tsx                             # Stack layout for list + detail
    │   ├── index.tsx                               # Moodboard list screen
    │   └── [id].tsx                                # Moodboard detail screen (pins)
    └── (tabs)/_components/
        └── moodboard-widget.tsx                    # Dashboard moodboard preview widget
```

Plus additions to existing:
- `lib/api/hooks/query-keys.ts` — add `moodboardKeys` factory
- `app/(protected)/_layout.tsx` — register `inspirations` route in Stack
- `app/(protected)/(tabs)/index.tsx` — add `<MoodboardWidget />`

### Key Implementation Patterns (from stories 10.1–12.1)

**Query key factory pattern:**
```typescript
export const moodboardKeys = {
  all: ["moodboards"] as const,
  list: (page?: number, limit?: number) =>
    [...moodboardKeys.all, "list", { page, limit }] as const,
  detail: (id: string) =>
    [...moodboardKeys.all, "detail", id] as const,
};
```

**Query hook pattern (follow use-gallery.ts):**
```typescript
export function useMoodboards(page = 1, limit = 20) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  return useQuery({
    queryKey: moodboardKeys.list(page, limit),
    queryFn: () => api.get<MoodboardListResponse>(`/api/v1/moodboards?${params}`),
    staleTime: 1000 * 60,
  });
}

export function useMoodboardDetail(id: string) {
  return useQuery({
    queryKey: moodboardKeys.detail(id),
    queryFn: () => api.get<MoodboardDetailDto>(`/api/v1/moodboards/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}
```

**Mutation hook patterns:**
```typescript
export function useCreateMoodboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMoodboardInput) =>
      api.post<CreateMoodboardOutput>("/api/v1/moodboards", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
    },
  });
}

export function useDeleteMoodboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moodboardId: string) =>
      api.delete<{ id: string }>(`/api/v1/moodboards/${moodboardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
    },
  });
}

export function useAddPin(moodboardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddPinInput) =>
      api.post<AddPinOutput>(`/api/v1/moodboards/${moodboardId}/pins`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
      queryClient.invalidateQueries({ queryKey: moodboardKeys.detail(moodboardId) });
    },
  });
}

export function useDeletePin(moodboardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pinId: string) =>
      api.delete<{ id: string }>(`/api/v1/moodboards/${moodboardId}/pins/${pinId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
      queryClient.invalidateQueries({ queryKey: moodboardKeys.detail(moodboardId) });
    },
  });
}
```

**Presigned upload pattern (adapt from use-gallery-upload.ts):**
```typescript
export function useMoodboardUpload(moodboardId: string) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const mutation = useMutation({
    mutationFn: async (asset: ImagePickerAsset) => {
      const filename = asset.fileName ?? `pin_${Date.now()}.jpg`;
      const mimeType = asset.mimeType ?? "image/jpeg";
      const size = asset.fileSize ?? 0;

      // Validate
      if (size > 10 * 1024 * 1024) throw new Error("File exceeds 10MB limit");

      // Step 1: Get presigned URL
      const presigned = await api.post<PresignedUploadResponse>("/api/v1/upload", {
        context: "moodboard",
        filename,
        mimeType,
        size,
      });

      // Step 2: Upload to R2 via XHR (progress tracking)
      await uploadToPresignedUrl(presigned.uploadUrl, asset.uri, mimeType, setProgress, xhrRef);

      // Step 3: Register as pin on moodboard
      return api.post<AddPinOutput>(`/api/v1/moodboards/${moodboardId}/pins`, {
        type: "image",
        imageUrl: presigned.fileUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
      queryClient.invalidateQueries({ queryKey: moodboardKeys.detail(moodboardId) });
      setProgress(0);
    },
  });

  useEffect(() => {
    return () => { xhrRef.current?.abort(); };
  }, []);

  return { ...mutation, progress };
}
```

### Library Versions (Already Installed — DO NOT upgrade or install new)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.67.3 | Server state management |
| `expo-image-picker` | ~16.1.4 | Photo selection from camera/library |
| `expo-router` | 6.0.21 | File-based routing |
| `nativewind` | 4.1.23 | Tailwind CSS for RN |
| `react-native-reanimated` | 3.17.4 | Animations |
| `lucide-react-native` | (installed) | Icons |

### Critical Guardrails

1. **DO NOT modify any backend code** — all moodboard and upload APIs are implemented and working
2. **DO NOT reuse `use-media-upload.ts`** — it's chat-specific with a different upload flow (multipart vs presigned URL)
3. **DO NOT reuse `use-gallery-upload.ts` directly** — it registers photos in the gallery, not pins on a moodboard. Create a separate `use-moodboard-upload.ts`
4. **DO NOT install new libraries** — everything needed is already installed. Color picker = predefined palette, no library needed
5. **DO NOT use Redux or Zustand** — use TanStack Query for server state, useState for local UI state
6. **Follow NativeWind styling** — all styles via Tailwind classNames, not StyleSheet
7. **Type everything** — no `any`, use proper TypeScript interfaces
8. **Handle loading and error states** — skeleton loaders, empty states, Alert.alert on error
9. **Invalidate caches on mutations** — all mutations must invalidate `moodboardKeys.all` + `moodboardKeys.detail(id)` on success
10. **SafeAreaView** — import from `react-native-safe-area-context` (NOT from `react-native`)
11. **Upload progress** — use XHR (not fetch) for the R2 presigned URL upload to get progress events
12. **Permission handling** — request photo library permissions via expo-image-picker before access
13. **Image quality** — use quality: 0.8 in image picker options (same as existing `use-gallery-image-picker.ts`)
14. **Alert feedback** — show Alert.alert on successful create, upload, and deletion (learned from 11.1 code review)
15. **Delete confirmation** — always show Alert.alert confirmation before deletion (prevent accidental deletes)
16. **Max 50 pins** — the backend enforces a 50-pin limit per moodboard. Show clear error if user hits the limit
17. **Hex color validation** — validate color pins match `/^#[0-9a-fA-F]{6}$/` before sending to API
18. **Route naming** — use `inspirations` (not `moodboards`) to avoid confusion with the existing `moodboard/` folder that contains mood tracking

### Previous Story Intelligence (12.1 — Photo Gallery Mobile)

**Key Learnings:**
- SafeAreaView MUST be imported from `react-native-safe-area-context`, NOT from `react-native`
- Use `useInfiniteQuery` + `FlatList` for large paginated lists (not `useQuery` page 1 only)
- Client-side file size validation (10MB max) BEFORE requesting presigned URL
- Client-side MIME type validation (JPEG/PNG/GIF/WebP only)
- XHR abort mechanism via `useRef` + `useEffect` cleanup to prevent memory leaks
- Replace `showToast` with `Alert.alert` for upload/delete feedback (guardrail from code review)
- Use `FlatList` instead of `ScrollView` for virtualized lists (performance)
- Always show delete confirmation via `Alert.alert` before destructive actions

**Code Review Patterns to Follow (avoid repeating previous issues):**
- H1: Use `useInfiniteQuery` for paginated list data (not just page 1)
- H2: Add client-side file size validation before upload
- M1: Use `FlatList` for virtualized rendering (not `ScrollView` for list data)
- M2: Add MIME type validation before upload
- M3: Add XHR abort mechanism for upload cancellation
- M4: Use `Alert.alert` for mutation feedback (not showToast)

### Git Intelligence (Recent Commits)

```
bb749ca docs: add epic 11 retrospective and update sprint status
5bd71dd feat(expo): implement story 11.2 — organisation todo, kanban, timeline mobile with code review fixes
b5c5778 feat(expo): implement story 11.1 — mood tracking mobile with code review fixes
703e21d docs: add epic 10 retrospective and mark epic complete
ab0038f feat(expo): implement story 10.2 — social feed & reactions mobile with code review fixes
```

**Pattern**: All mobile stories follow same structure — create types, create hooks, connect screen, connect dashboard widget. Commit format: `feat(expo): implement story X.Y — description with code review fixes`.

### Project Structure Notes

- Alignment with monorepo: Mobile app at `apps/expo/`, shares no code with `apps/nextjs/` except `packages/`
- API hooks are mobile-specific — web uses Server Actions, mobile uses TanStack Query
- **NAMING ALERT**: The Expo folder `app/(protected)/moodboard/` contains MOOD TRACKING (epic 3/11), NOT visual moodboards. The new moodboard screens MUST use a different route name: `inspirations/`
- Protected layout at `app/(protected)/_layout.tsx` handles auth guard — register new `inspirations` route
- Dashboard widgets at `app/(protected)/(tabs)/_components/`
- Navigation: Moodboard list at `inspirations/index.tsx`, detail at `inspirations/[id].tsx`

### Data Mapping: Backend DTO → Component Props

**MoodboardListItemDto → Moodboard card:**
```typescript
// Backend: { id, title, pinCount, previewPins: [...], createdAt }
// Component expects: card with title, subtitle (pin count), and thumbnail grid
```

**MoodboardPinDto → Pin grid item:**
```typescript
// Backend: { id, type, imageUrl, color, position, createdAt }
// For "image" pins → <Image source={{ uri: pin.imageUrl }} />
// For "color" pins → <View style={{ backgroundColor: pin.color }} />
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 12: Story 12.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#File Upload — Shared Endpoint]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/implementation-artifacts/12-1-photo-gallery-mobile.md — Previous story learnings + code review fixes]
- [Source: apps/nextjs/src/domain/moodboard/ — Moodboard aggregate, Pin entity, events, VOs]
- [Source: apps/nextjs/src/application/use-cases/moodboard/ — CreateMoodboard, AddPin, DeletePin, DeleteMoodboard use cases]
- [Source: apps/nextjs/src/application/use-cases/upload/ — GenerateUploadUrl use case]
- [Source: apps/nextjs/src/adapters/controllers/moodboard/ — Moodboard controller (GET/POST/DELETE list + detail + pins)]
- [Source: apps/nextjs/src/adapters/controllers/upload/ — Upload controller (POST presigned)]
- [Source: apps/nextjs/src/adapters/queries/moodboard.query.ts — getUserMoodboards, getMoodboardDetail queries]
- [Source: apps/nextjs/src/application/dto/moodboard/ — create-moodboard.dto, add-pin.dto, delete-pin.dto, delete-moodboard.dto]
- [Source: apps/nextjs/src/application/dto/upload/ — generate-upload-url.dto]
- [Source: packages/drizzle/src/schema/moodboard.ts — moodboard + pin table schemas]
- [Source: apps/expo/lib/api/client.ts — ApiClient with uploadFile() method]
- [Source: apps/expo/lib/api/hooks/query-keys.ts — Query key factory pattern]
- [Source: apps/expo/lib/api/hooks/use-gallery.ts — Reference query hook pattern]
- [Source: apps/expo/lib/api/hooks/use-gallery-upload.ts — Reference presigned upload pattern]
- [Source: apps/expo/lib/hooks/use-gallery-image-picker.ts — Reference image picker pattern]
- [Source: apps/expo/app/(protected)/(tabs)/index.tsx — Dashboard with 8 widgets (add moodboard widget)]
- [Source: apps/expo/app/(protected)/_layout.tsx — Protected layout Stack (register inspirations route)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation with no blocking issues.

### Completion Notes List

- Task 1: Created `types/moodboard.ts` with all DTO interfaces matching backend contracts. Added `moodboardKeys` factory to `query-keys.ts` following established pattern.
- Task 2: Created 3 hook files — `use-moodboards.ts` (CRUD hooks with query invalidation), `use-moodboard-upload.ts` (3-step presigned URL flow with XHR progress + abort), `use-moodboard-image-picker.ts` (expo-image-picker + upload orchestration). All follow gallery patterns from 12.1.
- Task 3: Created moodboard list screen at `inspirations/index.tsx` with FlatList, MoodboardCard (4-pin preview grid), create modal (cross-platform Modal+TextInput instead of iOS-only Alert.prompt), long-press delete with confirmation, empty state, loading skeleton, error retry, pull-to-refresh. Registered `inspirations` route in protected layout.
- Task 4: Created detail screen at `inspirations/[id].tsx` with pin grid (image + color), FAB for image upload with progress bar, color picker modal (16 predefined colors + custom hex input with regex validation), long-press pin delete, empty state with dual CTA, loading/error/refresh states.
- Task 5: Created `moodboard-widget.tsx` with `useMoodboards(1,1)` — shows most recent moodboard preview (title + 4 pin thumbnails) or empty state CTA. Added to dashboard between Journal and Mood widgets.

### Implementation Plan

- Followed established patterns from stories 10.1–12.1 (TanStack Query hooks, presigned upload, NativeWind styling)
- Used cross-platform Modal+TextInput for moodboard creation (Alert.prompt is iOS-only)
- Predefined color palette approach avoids new library dependency
- Hex color validation via regex before API submission
- Route named `inspirations` to avoid conflict with existing `moodboard/` (mood tracking)

### File List

New files:
- apps/expo/types/moodboard.ts
- apps/expo/lib/api/hooks/use-moodboards.ts
- apps/expo/lib/api/hooks/use-moodboard-upload.ts
- apps/expo/lib/api/upload-utils.ts (shared upload utility — extracted from gallery + moodboard)
- apps/expo/lib/hooks/use-moodboard-image-picker.ts
- apps/expo/app/(protected)/inspirations/_layout.tsx
- apps/expo/app/(protected)/inspirations/index.tsx
- apps/expo/app/(protected)/inspirations/[id].tsx
- apps/expo/app/(protected)/(tabs)/_components/moodboard-widget.tsx

Modified files:
- apps/expo/lib/api/hooks/query-keys.ts (added moodboardKeys with infinite key)
- apps/expo/lib/api/hooks/use-gallery-upload.ts (refactored to use shared upload-utils)
- apps/expo/app/(protected)/_layout.tsx (registered inspirations route)
- apps/expo/app/(protected)/(tabs)/index.tsx (added MoodboardWidget)

## Senior Developer Review (AI)

**Reviewer:** Axel — 2026-02-11
**Outcome:** Approved with fixes applied

### Issues Found & Fixed

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| H1 | HIGH | No `useInfiniteQuery` — only first 20 moodboards shown | Added `useInfiniteMoodboards()` + `onEndReached` infinite scroll + `ListFooterComponent` loading indicator |
| H2 | HIGH | No 50-pin limit UI check (Critical Guardrail #16) | Added `MAX_PINS=50` constant, `isAtPinLimit` check, Alert on limit reached, disabled FAB buttons, pin counter in header |
| M1 | MEDIUM | `uploadToPresignedUrl` function + constants duplicated (40 lines) | Extracted to shared `lib/api/upload-utils.ts`, updated both gallery and moodboard upload hooks |
| M2 | MEDIUM | Zero-byte file size validation bypass (`fileSize ?? 0`) | Added `size <= 0` validation before upload in both hooks |
| M3 | MEDIUM | No visual feedback during delete operations | Added `isDeleting` prop with opacity + ActivityIndicator overlay, uses `mutation.variables` for targeted feedback |
| M4 | MEDIUM | Custom hex input without color preview | Added live color swatch preview next to hex input (shown when valid hex entered) |

### Issues Not Fixed (LOW — acceptable)

| # | Severity | Issue | Rationale |
|---|----------|-------|-----------|
| L1 | LOW | `PinPreview`/`PinThumbnail` component duplication | Components are co-located with their screens; extraction would add coupling for minimal benefit |
| L2 | LOW | Inline style objects in list items | Minimal performance impact for typical moodboard sizes |

## Change Log

- 2026-02-11: Code review — fixed 6 issues (2 HIGH, 4 MEDIUM), extracted shared upload utility, added infinite scroll + pin limit check
- 2026-02-11: Implemented story 12.2 — Moodboard Management (Mobile) with full CRUD, presigned image upload, color picker, dashboard widget
