# Story 12.1: Photo Gallery (Mobile)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want to upload, browse, and delete photos from my phone gallery,
So that I can build my visual collection using my phone camera or photo library.

## Acceptance Criteria

1. **Given** an authenticated mobile user **When** they navigate to the gallery screen **Then** they see a photo grid fetched from `GET /api/v1/gallery` with pagination, replacing all placeholder mock data

2. **Given** an authenticated mobile user **When** they tap upload and select photos via expo-image-picker **Then** photos are uploaded via the two-step presigned URL flow: `POST /api/v1/upload` (context: "gallery") to get presigned URL, then PUT to R2, then `POST /api/v1/gallery` to register the photo

3. **Given** an authenticated mobile user uploading a photo **When** the upload is in progress **Then** they see a progress indicator, and on completion the gallery refreshes automatically

4. **Given** an authenticated mobile user **When** they long-press a photo **Then** they see a delete confirmation, and on confirm the photo is removed via `DELETE /api/v1/gallery/[photoId]`

5. **Given** no photos in gallery **When** the user views the gallery **Then** they see an empty state encouraging first upload with a CTA button

6. **Given** the dashboard gallery widget **When** it loads **Then** it displays real photo thumbnails from `GET /api/v1/gallery?limit=4` (replacing `MOCK_GALLERY_IMAGES`), or an empty state with CTA

7. **Given** an authenticated mobile user on the gallery screen **When** they pull down **Then** a pull-to-refresh triggers a gallery refetch

## Tasks / Subtasks

- [x] Task 1: Create gallery type definitions and query keys (AC: #1, #6)
  - [x]1.1 Create `types/gallery.ts` with `PhotoDto`, `GalleryResponse`, `AddPhotoInput`, `PresignedUploadResponse` interfaces matching backend DTOs
  - [x]1.2 Add `galleryKeys` factory to `lib/api/hooks/query-keys.ts` with keys: `all`, `list(page?, limit?)`

- [x] Task 2: Create gallery upload hook with presigned URL flow (AC: #2, #3)
  - [x]2.1 Create `lib/api/hooks/use-gallery.ts` with:
    - `useGallery(page?, limit?)` — `useQuery` fetching `GET /api/v1/gallery`
    - `useAddPhoto()` — `useMutation` orchestrating the 3-step upload: request presigned URL → upload to R2 → register in gallery
    - `useDeletePhoto()` — `useMutation` calling `DELETE /api/v1/gallery/[photoId]`
  - [x]2.2 Create `lib/api/hooks/use-gallery-upload.ts` with `useGalleryUpload()` hook that:
    - Gets presigned URL via `POST /api/v1/upload` with `{ context: "gallery", filename, mimeType, size }`
    - Uploads file to R2 via XHR PUT to the presigned URL (with progress tracking)
    - Registers the photo via `POST /api/v1/gallery` with `{ url: fileUrl, filename, mimeType, size }`
    - Invalidates `galleryKeys.all` on success
  - [x]2.3 Create `lib/hooks/use-gallery-image-picker.ts` wrapping expo-image-picker + useGalleryUpload for the complete pick-and-upload flow

- [x] Task 3: Connect gallery screen to real API (AC: #1, #2, #3, #4, #5, #7)
  - [x]3.1 Rewrite `app/(protected)/galerie.tsx` — replace `mockImages` with `useGallery()` hook data
  - [x]3.2 Render real photos via `<Image>` with actual URLs from API
  - [x]3.3 Add upload FAB button wired to `useGalleryImagePicker()`
  - [x]3.4 Add long-press delete with `Alert.alert` confirmation → `useDeletePhoto()` mutation
  - [x]3.5 Add empty state component when gallery is empty
  - [x]3.6 Add loading skeleton while data fetches, error state with retry
  - [x]3.7 Add `RefreshControl` pull-to-refresh to refetch gallery data
  - [x]3.8 Add upload progress indicator (overlay or bottom sheet)

- [x] Task 4: Connect dashboard gallery widget to real API (AC: #6)
  - [x]4.1 Replace `MOCK_GALLERY_IMAGES` in `gallery-widget.tsx` with `useGallery(1, 4)` data — show 4 most recent photos
  - [x]4.2 Render real photo thumbnails via `<Image>` with actual URLs
  - [x]4.3 Show empty state with "Ajoute ta premiere photo" CTA linking to `/galerie` when no photos exist

## Dev Notes

### Backend API Contract (Existing — DO NOT modify backend)

The web backend API is fully implemented. The mobile app consumes these endpoints:

| Method | Endpoint | Purpose | Request Body | Response Shape |
|--------|----------|---------|-------------|----------------|
| POST | `/api/v1/upload` | Get presigned upload URL | `{ context: "gallery", filename, mimeType, size }` | `{ uploadUrl, fileUrl, key, expiresAt }` |
| GET | `/api/v1/gallery` | List user's photos | Query: `?page=1&limit=20` | `{ data: PhotoDto[], pagination }` |
| POST | `/api/v1/gallery` | Register uploaded photo | `{ url, filename, mimeType, size, caption? }` | `PhotoDto` (201) |
| DELETE | `/api/v1/gallery/[photoId]` | Delete photo + R2 file | — | `{ id }` |

**PhotoDto Structure:**
```typescript
{
  id: string;
  userId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  caption: string | null;
  createdAt: string; // ISO 8601
}
```

**PresignedUploadResponse Structure:**
```typescript
{
  uploadUrl: string;  // Presigned R2 PUT URL (15min expiry)
  fileUrl: string;    // Final public URL for the file
  key: string;        // R2 object key: "gallery/{userId}/{uuid}.{ext}"
  expiresAt: string;  // ISO 8601 expiry timestamp
}
```

**Upload Flow (3 steps):**
1. `POST /api/v1/upload` with `{ context: "gallery", filename, mimeType, size }` → returns `{ uploadUrl, fileUrl }`
2. `PUT {uploadUrl}` — upload raw file bytes to R2 via XHR (supports progress events)
3. `POST /api/v1/gallery` with `{ url: fileUrl, filename, mimeType, size }` → registers photo in DB

**Accepted MIME types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`
**Max file size:** 10MB

**Pagination Response:**
```typescript
{
  data: PhotoDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
}
```

### Architecture Compliance

- **API Client**: Use existing `lib/api/client.ts` — NEVER create a new client
- **Auth Tokens**: Handled automatically by `ApiClient` (SecureStore + in-memory cache)
- **TanStack Query**: Follow patterns from `use-mood.ts`, `use-posts.ts`, and `use-boards.ts`
- **Query Keys**: Add `galleryKeys` to existing `query-keys.ts` using factory pattern
- **Error Handling**: Use `ApiError` class, display via Alert.alert or inline error
- **NativeWind Styling**: All styles via Tailwind classNames, not StyleSheet
- **Type Everything**: No `any`, use proper TypeScript interfaces
- **SafeAreaView**: Import from `react-native-safe-area-context` (NOT from `react-native`)

### Upload Architecture — DO NOT reuse chat upload

The existing `use-media-upload.ts` uploads to `/api/v1/chat/upload` (a chat-specific direct upload endpoint). The gallery uses a DIFFERENT flow:
- **Chat upload**: POST multipart/form-data to `/api/v1/chat/upload` → server stores file → returns URL
- **Gallery upload**: POST JSON to `/api/v1/upload` → get presigned R2 URL → client uploads directly to R2 → POST to `/api/v1/gallery` to register

**Create a new `use-gallery-upload.ts` hook** for the presigned URL flow. Do NOT modify `use-media-upload.ts`. The XHR-based upload with progress tracking in `ApiClient.uploadFile()` can be referenced for the progress pattern, but the actual upload goes to the presigned R2 URL, not to the API server.

### Existing Components to Reuse or Modify

| Component | Path | Current State | Action |
|-----------|------|---------------|--------|
| Gallery Screen | `app/(protected)/galerie.tsx` | Placeholder with `mockImages` array (8 items, no real images) | Replace mock data with `useGallery()`, add upload/delete UI |
| Gallery Widget | `app/(protected)/(tabs)/_components/gallery-widget.tsx` | Uses `MOCK_GALLERY_IMAGES` from constants | Replace with `useGallery(1, 4)` data |
| Image Picker | `lib/hooks/use-image-picker.ts` | Complete (expo-image-picker + upload) | Reference for picker pattern, but DON'T reuse directly — it's wired to chat upload |
| API Client | `lib/api/client.ts` | Complete with `uploadFile()` XHR method | Use `api.post()` and `api.delete()` for gallery API; use XHR for R2 presigned upload |

### Data Mapping: Backend DTO → Component Props

**PhotoDto → Gallery grid item:**
```typescript
// Backend: { id, userId, url, filename, mimeType, size, caption, createdAt }
// Component expects: { id, uri, aspectRatio? } or direct Image source
const mapPhotoToGridItem = (photo: PhotoDto) => ({
  id: photo.id,
  uri: photo.url,
  caption: photo.caption,
});
```

### New Files to Create

```
apps/expo/
├── types/
│   └── gallery.ts                         # Gallery type definitions
└── lib/
    ├── api/hooks/
    │   └── use-gallery.ts                 # Gallery TanStack Query hooks
    └── hooks/
        └── use-gallery-upload.ts          # Presigned URL upload flow hook
```

Plus additions to existing:
- `lib/api/hooks/query-keys.ts` — add `galleryKeys` factory

### Key Implementation Patterns (from stories 10.1–11.2)

**Query key factory pattern:**
```typescript
export const galleryKeys = {
  all: ["gallery"] as const,
  list: (page?: number, limit?: number) =>
    [...galleryKeys.all, "list", { page, limit }] as const,
};
```

**Query hook pattern (follow use-mood.ts):**
```typescript
export function useGallery(page = 1, limit = 20) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  return useQuery({
    queryKey: galleryKeys.list(page, limit),
    queryFn: () => api.get<GalleryResponse>(`/api/v1/gallery?${params}`),
    staleTime: 1000 * 60,
  });
}
```

**Mutation hook pattern (follow use-posts.ts):**
```typescript
export function useDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) =>
      api.delete<{ id: string }>(`/api/v1/gallery/${photoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}
```

**Presigned upload pattern (new for gallery):**
```typescript
export function useGalleryUpload() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (asset: ImagePickerAsset) => {
      // Step 1: Get presigned URL
      const presigned = await api.post<PresignedUploadResponse>("/api/v1/upload", {
        context: "gallery",
        filename: asset.fileName ?? `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
        size: asset.fileSize ?? 0,
      });

      // Step 2: Upload to R2 via XHR (progress tracking)
      await uploadToPresignedUrl(presigned.uploadUrl, asset.uri, presigned.key, setProgress);

      // Step 3: Register in gallery
      return api.post<PhotoDto>("/api/v1/gallery", {
        url: presigned.fileUrl,
        filename: asset.fileName ?? `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
        size: asset.fileSize ?? 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      setProgress(0);
    },
  });

  return { ...mutation, progress };
}
```

### Library Versions (Already Installed — DO NOT upgrade or install new)

| Library | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.67.3 | Server state management |
| `expo-image-picker` | ~16.1.4 | Photo selection from camera/library |
| `expo-camera` | ~16.1.6 | Camera access (if needed) |
| `expo-router` | 6.0.21 | File-based routing |
| `nativewind` | 4.1.23 | Tailwind CSS for RN |
| `react-native-reanimated` | 3.17.4 | Animations |

### Critical Guardrails

1. **DO NOT modify any backend code** — all gallery and upload APIs are implemented and working
2. **DO NOT reuse `use-media-upload.ts`** — it's chat-specific with a different upload flow (multipart vs presigned URL)
3. **DO NOT install new libraries** — everything needed is already installed
4. **DO NOT use Redux or Zustand** — use TanStack Query for server state, useState for local UI state
5. **Follow NativeWind styling** — all styles via Tailwind classNames, not StyleSheet
6. **Type everything** — no `any`, use proper TypeScript interfaces
7. **Handle loading and error states** — skeleton loaders, empty states, Alert.alert on error
8. **Invalidate caches on mutations** — all gallery mutations must invalidate `galleryKeys.all` on success
9. **SafeAreaView** — import from `react-native-safe-area-context` (NOT from `react-native`)
10. **Upload progress** — use XHR (not fetch) for the R2 presigned URL upload to get progress events
11. **Permission handling** — request camera/photo library permissions via expo-image-picker before access
12. **Image quality** — use quality: 0.8 in image picker options (same as existing `use-image-picker.ts`)
13. **Alert feedback** — show Alert.alert on successful upload and deletion (learned from 11.1 code review)
14. **Delete confirmation** — always show Alert.alert confirmation before deletion (prevent accidental deletes)

### Previous Story Intelligence (11.2 — Organisation Todo, Kanban, Timeline Mobile)

**Key Learnings:**
- SafeAreaView MUST be imported from `react-native-safe-area-context`, NOT from `react-native`
- Mutations must actually call the API, not just toggle local state (H1 fix from 11.1)
- All hooks should invalidate related keys on mutation success
- Add Alert.alert success feedback after significant mutations
- Extract shared utilities, don't duplicate across screens
- Make conditional UI elements dependent on callback prop presence
- Error states with retry button on all data-fetching views
- Mutation error feedback via Alert.alert on all mutation errors

**Code Review Patterns to Follow (avoid repeating previous issues):**
- H1: Ensure mutations actually call the API
- H2: Add user feedback (Alert) after create/delete operations
- H3: Filter widget data correctly (e.g., pending items only for todo)
- M1: Make optional UI elements conditional on callback props
- M3: Avoid unnecessary type casts

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
- Navigation: Gallery screen is at `app/(protected)/galerie.tsx` (not in a folder, just a flat file)
- Protected layout at `app/(protected)/_layout.tsx` handles auth guard
- Dashboard widgets at `app/(protected)/(tabs)/_components/`
- Dashboard constants at `constants/dashboard-mock-data.ts` — `MOCK_GALLERY_IMAGES` needs replacement

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 12: Story 12.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#File Upload — Shared Endpoint]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Client Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/implementation-artifacts/11-2-organisation-todo-kanban-timeline-mobile.md — Previous story learnings]
- [Source: apps/nextjs/src/domain/gallery/ — Photo aggregate, events]
- [Source: apps/nextjs/src/application/use-cases/gallery/ — AddPhoto, DeletePhoto use cases]
- [Source: apps/nextjs/src/application/use-cases/upload/ — GenerateUploadUrl use case]
- [Source: apps/nextjs/src/adapters/controllers/gallery/ — Gallery controller (GET/POST/DELETE)]
- [Source: apps/nextjs/src/adapters/controllers/upload/ — Upload controller (POST presigned)]
- [Source: apps/nextjs/src/adapters/queries/gallery.query.ts — getUserGallery query]
- [Source: apps/nextjs/src/application/dto/gallery/ — add-photo.dto, delete-photo.dto]
- [Source: apps/nextjs/src/application/dto/upload/ — generate-upload-url.dto]
- [Source: packages/drizzle/src/schema/gallery.ts — photo table schema]
- [Source: apps/expo/app/(protected)/galerie.tsx — Current placeholder screen]
- [Source: apps/expo/app/(protected)/(tabs)/_components/gallery-widget.tsx — Dashboard widget with mock data]
- [Source: apps/expo/lib/api/client.ts — ApiClient with uploadFile() method]
- [Source: apps/expo/lib/api/hooks/query-keys.ts — Query key factory pattern]
- [Source: apps/expo/lib/api/hooks/use-mood.ts — Reference query hook pattern]
- [Source: apps/expo/lib/api/hooks/use-posts.ts — Reference mutation hook pattern]
- [Source: apps/expo/lib/api/hooks/use-media-upload.ts — Reference upload pattern (chat-specific, DO NOT reuse)]
- [Source: apps/expo/lib/hooks/use-image-picker.ts — Reference image picker pattern]
- [Source: apps/expo/constants/dashboard-mock-data.ts — MOCK_GALLERY_IMAGES to replace]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed unused `Trash2` import in galerie.tsx (Biome error)
- Fixed unused `ImageIcon` import in gallery-widget.tsx (Biome error)
- Fixed skeleton key using array index → replaced with static string array (Biome error)
- Fixed TypeScript strict error: `ImagePickerAsset | undefined` not assignable — added null guard

### Completion Notes List

- **Task 1**: Created `types/gallery.ts` with 6 interfaces matching backend DTOs (PhotoDto, GalleryResponse, AddPhotoInput, PresignedUploadRequest, PresignedUploadResponse). Added `galleryKeys` factory to `query-keys.ts` with `all` and `list(page, limit)` keys.
- **Task 2**: Created `use-gallery.ts` with 3 hooks (useGallery query, useAddPhoto mutation, useDeletePhoto mutation). Created `use-gallery-upload.ts` with presigned URL 3-step flow (request URL → XHR PUT to R2 with progress → register in gallery). Created `use-gallery-image-picker.ts` wrapping expo-image-picker + gallery upload with permission handling and toast feedback.
- **Task 3**: Rewrote `galerie.tsx` — replaced mockImages with useGallery() API hook. Added: real photo grid with Image components, upload FAB with progress indicator, long-press delete with Alert confirmation, empty state with CTA, loading skeleton, error state with retry, pull-to-refresh via RefreshControl. SafeAreaView from react-native-safe-area-context.
- **Task 4**: Rewrote `gallery-widget.tsx` — replaced MOCK_GALLERY_IMAGES with useGallery(1, 4) data. Added loading spinner, empty state with "Ajoute ta premiere photo" CTA, real photo thumbnails via Image component.

### Change Log

- 2026-02-11: Implemented story 12.1 — Photo Gallery (Mobile). Replaced all mock/placeholder data with real API hooks. All 4 tasks completed. 0 regressions (389 tests pass). TypeScript and Biome clean.
- 2026-02-11: **Code Review** — 10 issues found (2H, 4M, 4L). All 6 HIGH+MEDIUM fixed:
  - H1: Added `useInfiniteQuery` + `FlatList` infinite scroll (was showing only page 1)
  - H2: Added client-side file size validation (10MB max)
  - M1: Replaced `ScrollView` with `FlatList` for virtualization/performance
  - M2: Added MIME type validation (JPEG/PNG/GIF/WebP only)
  - M3: Added XHR abort mechanism via `useRef` + `useEffect` cleanup
  - M4: Replaced `showToast` with `Alert.alert` for upload feedback (guardrail #13)
  - 4 LOW issues left as-is (cosmetic: skeleton inline style, nested pressable, fileSize fallback, no photo count)

### File List

- `apps/expo/types/gallery.ts` (new) — Gallery type definitions matching backend DTOs
- `apps/expo/lib/api/hooks/use-gallery.ts` (new) — Gallery TanStack Query hooks (query + mutations)
- `apps/expo/lib/api/hooks/use-gallery-upload.ts` (new) — Presigned URL upload flow with XHR progress
- `apps/expo/lib/hooks/use-gallery-image-picker.ts` (new) — Image picker + gallery upload integration
- `apps/expo/lib/api/hooks/query-keys.ts` (modified) — Added `galleryKeys` factory
- `apps/expo/app/(protected)/galerie.tsx` (modified) — Full rewrite: mock → real API with upload/delete/empty/loading/error states
- `apps/expo/app/(protected)/(tabs)/_components/gallery-widget.tsx` (modified) — Replaced mock data with API hook + real thumbnails
