# Expo Post Creation Parity Design

## Goal

Port all post creation features from Next.js web to Expo mobile:
- Rich text editing (bold, italic, underline) with HTML output
- Photo upload (already exists, keep as-is)
- Friend @mentions with real-time search dropdown

## Approach

Use **@10play/tentap-editor** (TenTap) — a React Native wrapper around Tiptap (same engine as the web editor). This ensures HTML output compatibility between web and mobile.

## Architecture

### Rich Text Editor

Replace the current `PostEditor` component (plain `TextInput` with decorative toolbar) with a TenTap-based editor.

**Current state:** `PostEditor` uses `TextInput` + formatting buttons that toggle visual state but don't produce HTML.

**New state:** TenTap editor with WebView-based Tiptap instance. Toolbar buttons call real formatting commands (`toggleBold`, `toggleItalic`, `toggleUnderline`). Output is HTML via `editor.getHTML()`.

### Component Structure

```
apps/expo/components/journal/
  post-editor.tsx          <- REWRITE: TenTap editor with native toolbar
  mention-list.tsx         <- CREATE: FlatList-based mention suggestion dropdown
```

### Mention System

- Triggered by typing `@` in the editor (Tiptap Mention extension)
- Toolbar `@` button inserts `@` character to trigger suggestion
- FlatList overlay renders above keyboard with avatar + name
- Fetches friends from `/api/v1/friends?limit=100`
- Case-insensitive filtering, max 8 results
- HTML output: `<span data-mention data-id="userId">@Name</span>`

### Image Upload

No changes. Existing `usePostImages` hook + `expo-image-picker` + presigned R2 upload stays as-is. Images displayed separately below the editor (not inline).

## Screens Impacted

| Screen | Change |
|--------|--------|
| `journal/create.tsx` | Replace PostEditor + string state with TenTap + HTML state |
| `journal/edit/[id].tsx` | Same replacement, load initialContent from existing post |
| `dashboard/journal-widget.tsx` | Connect to TenTap if it has an editor, otherwise keep as-is |
| `journal/post-card.tsx` | Verify HTML rendering (currently uses stripHtml) |

## Data Flow

1. User types in TenTap editor (bold, italic, @mentions)
2. `editor.getHTML()` produces HTML string
3. `useCreatePost.mutate({ content: html, isPrivate, images })` sends to API
4. Backend `PostController` sanitizes HTML with `sanitize-html`
5. `CreatePostUseCase` persists via `PostContent` VO (already validates HTML)

## Dependencies

- `@10play/tentap-editor` — React Native Tiptap wrapper
- `react-native-webview` — Required peer dependency for TenTap
- Both require EAS build (user confirmed EAS CLI usage)

## Constraints

- No Expo Go support for full TenTap features (acceptable — user uses EAS)
- TenTap mention suggestion rendering requires custom RN component (not DOM portals)
- HTML output must match web format for cross-platform post rendering
