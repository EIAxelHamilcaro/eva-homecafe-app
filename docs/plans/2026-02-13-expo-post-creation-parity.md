# Expo Post Creation Parity — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port rich text editing (B/I/U), photo upload, and @mentions from Next.js web to Expo mobile, achieving feature parity for post creation.

**Architecture:** Replace the current decorative `PostEditor` (plain `TextInput`) with `@10play/tentap-editor` (TenTap) — a React Native Tiptap wrapper. TenTap runs Tiptap inside a WebView with native RN bridges for formatting commands and HTML output. Images remain separate via the existing `usePostImages` hook.

**Tech Stack:** @10play/tentap-editor, react-native-webview, Tiptap Mention extension, Expo SDK 54, EAS builds

---

### Task 1: Install TenTap and verify build

**Files:**
- Modify: `apps/expo/package.json`

**Step 1: Install dependencies**

Run:
```bash
cd apps/expo && npx expo install @10play/tentap-editor react-native-webview
```

**Step 2: Verify the app starts**

Run:
```bash
cd /home/axel/DEV/eva-homecafe-app && pnpm dev --filter expo
```
Expected: Metro bundler starts without errors. If Expo SDK 54 compatibility issues arise (GitHub issue #330), check for patches or pin versions.

**Step 3: Commit**

```bash
git add apps/expo/package.json pnpm-lock.yaml
git commit -m "chore(expo): install @10play/tentap-editor and react-native-webview"
```

---

### Task 2: Rewrite PostEditor with TenTap rich text

**Files:**
- Rewrite: `apps/expo/components/journal/post-editor.tsx`

**Context:** The current `PostEditor` is a `TextInput` with decorative B/I/U buttons that don't produce HTML. Replace it with a TenTap editor that uses real formatting commands and outputs HTML.

**Key APIs:**
- `useEditorBridge({ initialContent, avoidIosKeyboard, editable })` — creates the editor instance
- `RichText` — renders the editor WebView
- `useBridgeState(editor)` — reactive state: `isBold`, `isItalic`, `isUnderline`
- `useEditorContent(editor, { type: 'html' })` — debounced HTML output
- `editor.toggleBold()`, `editor.toggleItalic()`, `editor.toggleUnderline()` — formatting commands
- `editor.focus()`, `editor.getHTML()`, `editor.getText()`

**Step 1: Rewrite post-editor.tsx**

Replace the entire file. The new component:
- Accepts `initialContent` (HTML string), `onChangeHTML` callback, `onImagePress`, `onMentionPress`, `editable`
- Renders a custom toolbar with B/I/U + image + @mention buttons (using lucide-react-native icons)
- Uses `useBridgeState` for active formatting state (highlight active buttons)
- Uses `useEditorContent` with `debounceInterval: 300` to report HTML changes
- Renders `RichText` below the toolbar
- Toolbar styling: matches current border/border-border card style, buttons match homecafe blue active state

```tsx
import {
  RichText,
  useEditorBridge,
  useEditorContent,
  useBridgeState,
} from "@10play/tentap-editor";
import { AtSign, Bold, ImageIcon, Italic, Underline } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, View, type ViewProps } from "react-native";
import { colors } from "@/src/config/colors";
import { cn } from "@/src/libs/utils";

type PostEditorProps = ViewProps & {
  initialContent?: string;
  onChangeHTML?: (html: string) => void;
  onImagePress?: () => void;
  onMentionPress?: () => void;
  editable?: boolean;
  minHeight?: number;
  className?: string;
};

function PostEditor({
  initialContent = "",
  onChangeHTML,
  onImagePress,
  onMentionPress,
  editable = true,
  minHeight = 200,
  className,
  ...props
}: PostEditorProps) {
  const editor = useEditorBridge({
    initialContent,
    avoidIosKeyboard: true,
    editable,
  });

  const editorState = useBridgeState(editor);
  const htmlContent = useEditorContent(editor, {
    type: "html",
    debounceInterval: 300,
  });

  useEffect(() => {
    if (htmlContent !== undefined && onChangeHTML) {
      onChangeHTML(htmlContent);
    }
  }, [htmlContent, onChangeHTML]);

  return (
    <View
      className={cn(
        "bg-card rounded-xl border border-border overflow-hidden",
        className,
      )}
      {...props}
    >
      <View className="flex-row items-center justify-between px-3 py-2 border-b border-border">
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() => editor.toggleBold()}
            className={cn(
              "items-center justify-center w-8 h-8 rounded-md",
              editorState.isBoldActive ? "bg-blue-500" : "bg-transparent",
            )}
            hitSlop={4}
          >
            <Bold
              size={18}
              color={editorState.isBoldActive ? colors.white : colors.icon.default}
              strokeWidth={2.5}
            />
          </Pressable>
          <Pressable
            onPress={() => editor.toggleItalic()}
            className={cn(
              "items-center justify-center w-8 h-8 rounded-md",
              editorState.isItalicActive ? "bg-blue-500" : "bg-transparent",
            )}
            hitSlop={4}
          >
            <Italic
              size={18}
              color={editorState.isItalicActive ? colors.white : colors.status.info}
              strokeWidth={2}
            />
          </Pressable>
          <Pressable
            onPress={() => editor.toggleUnderline()}
            className={cn(
              "items-center justify-center w-8 h-8 rounded-md",
              editorState.isUnderlineActive ? "bg-blue-500" : "bg-transparent",
            )}
            hitSlop={4}
          >
            <Underline
              size={18}
              color={editorState.isUnderlineActive ? colors.white : colors.status.info}
              strokeWidth={2}
            />
          </Pressable>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onImagePress}
            className="items-center justify-center w-8 h-8 rounded-md active:opacity-60"
            hitSlop={4}
          >
            <ImageIcon size={20} color={colors.status.info} strokeWidth={2} />
          </Pressable>
          <Pressable
            onPress={onMentionPress}
            className="items-center justify-center w-8 h-8 rounded-md active:opacity-60"
            hitSlop={4}
          >
            <AtSign size={20} color={colors.status.info} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
      <View style={{ minHeight }}>
        <RichText editor={editor} />
      </View>
    </View>
  );
}

export { PostEditor, type PostEditorProps };
```

**Important notes:**
- `useBridgeState` returns `isBoldActive`, `isItalicActive`, `isUnderlineActive` (verify exact property names from TenTap source — may be `isBold` instead of `isBoldActive`). Check `node_modules/@10play/tentap-editor` types after install.
- `ImageIcon` renamed from `Image` to avoid conflict with RN `Image`.
- The `onMentionPress` will insert `@` into the editor once mentions are wired (Task 4).
- Old props removed: `value`, `onChangeText`, `activeFormatting`, `onFormatPress`, `maxLength`, `textInputProps`.

**Step 2: Verify types compile**

Run:
```bash
cd /home/axel/DEV/eva-homecafe-app && pnpm type-check --filter expo
```
Expected: No type errors related to post-editor. Fix any TenTap API mismatches (property names may differ from docs).

**Step 3: Commit**

```bash
git add apps/expo/components/journal/post-editor.tsx
git commit -m "feat(expo): rewrite PostEditor with TenTap rich text editor"
```

---

### Task 3: Update create.tsx to use new PostEditor

**Files:**
- Modify: `apps/expo/app/(protected)/(tabs)/journal/create.tsx`

**Context:** The current create screen uses `postContent` (string) + `activeFormatting` (decorative state) + `handleFormatPress`. Replace with the new TenTap PostEditor that manages its own formatting and reports HTML via `onChangeHTML`.

**Changes:**
1. Remove `activeFormatting` state and `handleFormatPress` handler
2. Change `postContent` from plain text to HTML: rename to `htmlContent`
3. Replace `<PostEditor value={...} onChangeText={...} activeFormatting={...} onFormatPress={...}>` with `<PostEditor initialContent="" onChangeHTML={setHtmlContent} onImagePress={pickImages} onMentionPress={handleMentionPress} editable={!isSubmitting}>`
4. In `handlePublish`: send `htmlContent` instead of `postContent`, check with `editor.getText()` or strip HTML tags to detect empty
5. For empty check: strip HTML tags from `htmlContent` to detect if user typed anything (Tiptap generates `<p></p>` for empty content)

**Step 1: Update create.tsx**

Key diff:
```tsx
// REMOVE these:
const [postContent, setPostContent] = useState("");
const [activeFormatting, setActiveFormatting] = useState<FormattingOption[]>([]);
const handleFormatPress = ...;

// ADD these:
const [htmlContent, setHtmlContent] = useState("");

// Helper to check if content is empty (Tiptap outputs <p></p> for empty)
const isContentEmpty = (html: string) => {
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length === 0;
};

// Update handlePublish:
const handlePublish = () => {
  if (isContentEmpty(htmlContent)) return;
  createPost.mutate({
    content: htmlContent,
    isPrivate,
    images: images.length > 0 ? images : undefined,
  }, { ... });
};

// Update JSX:
<PostEditor
  onChangeHTML={setHtmlContent}
  onImagePress={pickImages}
  onMentionPress={handleMentionPress}
  editable={!isSubmitting}
  minHeight={200}
  className="flex-1"
/>

// Update publish button disabled check:
disabled={isContentEmpty(htmlContent) || isSubmitting}
```

Also remove the `FormattingOption` import since it no longer exists.

**Step 2: Run type-check**

Run: `pnpm type-check --filter expo`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/expo/app/(protected)/(tabs)/journal/create.tsx
git commit -m "feat(expo): wire create screen to TenTap HTML editor"
```

---

### Task 4: Update edit/[id].tsx to use new PostEditor

**Files:**
- Modify: `apps/expo/app/(protected)/(tabs)/journal/edit/[id].tsx`

**Context:** Same transformation as create.tsx but also loads initial content from existing post.

**Changes:**
1. Remove `activeFormatting`, `handleFormatPress`, `FormattingOption` import
2. Replace `postContent` string with `htmlContent`
3. Pass `initialContent={post.content}` to PostEditor (post content is already HTML from backend)
4. Remove the `initialized` pattern — TenTap handles initial content via prop
5. Update `handleSave` to send `htmlContent`
6. Keep `resetImages(post.images)` in useEffect for images

**Step 1: Update edit/[id].tsx**

Key diff:
```tsx
// Remove:
const [postContent, setPostContent] = useState("");
const [activeFormatting, ...] = useState(...);
// ...initialized pattern

// Add:
const [htmlContent, setHtmlContent] = useState("");
const [initialized, setInitialized] = useState(false);

// Keep useEffect for images + privacy only:
useEffect(() => {
  if (post && !initialized) {
    setHtmlContent(post.content);
    setIsPrivate(post.isPrivate);
    resetImages(post.images);
    setInitialized(true);
  }
}, [post, initialized, resetImages]);

// JSX:
<PostEditor
  initialContent={initialized ? htmlContent : ""}
  onChangeHTML={setHtmlContent}
  onImagePress={pickImages}
  onMentionPress={handleMentionPress}
  editable={!isSubmitting}
  minHeight={200}
  className="flex-1"
/>
```

**Step 2: Run type-check**

Run: `pnpm type-check --filter expo`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/expo/app/(protected)/(tabs)/journal/edit/[id].tsx
git commit -m "feat(expo): wire edit screen to TenTap HTML editor"
```

---

### Task 5: Update journal-widget.tsx to use new PostEditor

**Files:**
- Modify: `apps/expo/components/dashboard/journal-widget.tsx`

**Context:** The journal widget opens a modal with a PostEditor. Same transformation: remove plain text state, use HTML.

**Changes:**
1. Remove `content` string state → replace with `htmlContent`
2. Remove all formatting-related props from PostEditor
3. Use `onChangeHTML`
4. Update `handlePublish` to send HTML
5. `@mention` button: for now wire `onMentionPress` to insert @ (Task 6 will complete mentions)

**Step 1: Update journal-widget.tsx**

Key diff:
```tsx
const [htmlContent, setHtmlContent] = useState("");

const isContentEmpty = (html: string) => {
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length === 0;
};

const handlePublish = () => {
  if (isContentEmpty(htmlContent)) return;
  createPost.mutate(
    { content: htmlContent, isPrivate, createdAt: selectedDate },
    {
      onSuccess: () => {
        setHtmlContent("");
        setModalOpen(false);
        router.push("/(protected)/(tabs)/journal");
      },
    },
  );
};

// JSX inside ModalContent:
<PostEditor
  onChangeHTML={setHtmlContent}
  placeholder="Commence à écrire ici..."
  minHeight={200}
  editable={!createPost.isPending}
/>
```

**Step 2: Run type-check**

Run: `pnpm type-check --filter expo`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/expo/components/dashboard/journal-widget.tsx
git commit -m "feat(expo): wire journal widget modal to TenTap editor"
```

---

### Task 6: Add @mention support with MentionList component

**Files:**
- Create: `apps/expo/components/journal/mention-list.tsx`
- Modify: `apps/expo/components/journal/post-editor.tsx` (add mention integration)

**Context:** TenTap wraps Tiptap, so we need to configure the Mention extension. TenTap may or may not expose a direct MentionBridge — check `node_modules/@10play/tentap-editor` for available bridge extensions after install. If no built-in support, implement a workaround:

**Approach A (if TenTap has MentionBridge):**
- Configure mention extension in `useEditorBridge`
- Use TenTap's suggestion rendering callback to show a RN FlatList

**Approach B (workaround if no built-in mention):**
- When `@` button pressed, show a bottom sheet with friend search
- On friend select, insert HTML mention text via `editor.setContent` or `editor.insertContent`
- The inserted HTML: `<span data-type="mention" data-id="userId" class="mention">@Name</span> `

**Step 1: Create mention-list.tsx**

```tsx
import { Image, Pressable, Text, View, FlatList } from "react-native";
import { colors } from "@/src/config/colors";

export interface MentionItem {
  id: string;
  label: string;
  avatarUrl: string | null;
}

interface MentionListProps {
  items: MentionItem[];
  onSelect: (item: MentionItem) => void;
}

export function MentionList({ items, onSelect }: MentionListProps) {
  if (items.length === 0) {
    return (
      <View className="rounded-lg border border-border bg-card p-3">
        <Text className="text-xs text-muted-foreground">Aucun ami trouvé</Text>
      </View>
    );
  }

  return (
    <View className="max-h-48 rounded-lg border border-border bg-card overflow-hidden">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            className="flex-row items-center gap-2 px-3 py-2 active:bg-homecafe-pink/10"
          >
            {item.avatarUrl ? (
              <Image
                source={{ uri: item.avatarUrl }}
                className="h-6 w-6 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-6 w-6 items-center justify-center rounded-full bg-homecafe-blue">
                <Text className="text-[10px] font-bold text-white">
                  {item.label.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text className="text-sm text-foreground">{item.label}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
```

**Step 2: Wire mentions in PostEditor**

Add to `post-editor.tsx`:
- State: `showMentions`, `mentionQuery`, `filteredFriends`
- Fetch friends once from `/api/v1/friends?limit=100` via the `api` client
- On `@` button press or when detecting `@` in editor content, show the MentionList
- On friend select, insert mention HTML into editor
- Position MentionList between toolbar and editor

This step depends heavily on what TenTap exposes. The implementation details will be determined after Task 1 (install) when we can inspect the actual API.

**Step 3: Commit**

```bash
git add apps/expo/components/journal/mention-list.tsx apps/expo/components/journal/post-editor.tsx
git commit -m "feat(expo): add @mention support with friend search dropdown"
```

---

### Task 7: Run full quality checks

**Files:** None (verification only)

**Step 1: Run Biome lint/format**

Run: `pnpm fix`
Fix any issues.

**Step 2: Run type-check**

Run: `pnpm type-check --filter expo`
Expected: PASS

**Step 3: Run all checks**

Run: `pnpm check`
Expected: PASS (or only pre-existing warnings)

**Step 4: Final commit if any fixes**

```bash
git add -A
git commit -m "fix(expo): lint and format fixes for post editor"
```

---

## Risk: Expo SDK 54 Compatibility

GitHub issue #330 reports build errors with @10play/tentap-editor on Expo SDK 54 + React Native 0.81. If Task 1 fails:

**Fallback Plan:** Use `react-native-webview` directly to load a custom Tiptap editor HTML page. This gives full Tiptap feature support (same as web) but requires:
1. Bundle a minimal Tiptap HTML page as an asset
2. Communicate via `postMessage`/`onMessage` bridge
3. More setup work but guaranteed compatibility

Evaluate this only if the install/build fails.
