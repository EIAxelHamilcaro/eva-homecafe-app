# Project Plan

## Overview
Chat feature implementation for HomeCafe: refactoring existing domain (Next.js) + Expo React Native client. Realtime communication via SSE.

**Reference:** `CLAUDE.md`

---

## Task List

```json
[
  {
    "category": "domain",
    "description": "Review conversation.aggregate.ts - verify CLAUDE.md patterns conformity",
    "steps": [
      "Read apps/nextjs/src/domain/conversation/conversation.aggregate.ts",
      "Verify: static create(), static reconstitute(), addEvent() pattern",
      "Verify: Result<T> for fallible operations",
      "Verify: Option<T> for nullable values",
      "Fix if necessary"
    ],
    "passes": true
  },
  {
    "category": "domain",
    "description": "FIX: Rename message.aggregate.ts to message.entity.ts - Message is Entity NOT Aggregate",
    "steps": [
      "Rename apps/nextjs/src/domain/message/message.aggregate.ts to message.entity.ts",
      "Change class to extend Entity instead of Aggregate",
      "Ensure Message uses typed IDs: conversationId: ConversationId, senderId: UserId",
      "Verify MessageId class exists in message-id.ts",
      "Message belongs to Conversation (the real Aggregate)",
      "Keep domain events (MessageSent, etc.) - entities can still emit events",
      "Update all imports referencing the old file",
      "Verify Result/Option usage is correct"
    ],
    "passes": true
  },
  {
    "category": "domain",
    "description": "Review Value Objects - MessageContent, MediaAttachment, Reaction, Participant",
    "steps": [
      "Verify MessageContent: 1-4000 chars, Zod validation",
      "Verify MediaAttachment: url, mimeType, dimensions, size (max 50MB)",
      "Verify Reaction: type enum, userId as UserId typed",
      "Verify Participant: userId as UserId, lastReadAt as Option<Date>",
      "Ensure all references use typed IDs (UserId, ConversationId, MessageId)",
      "Fix if necessary"
    ],
    "passes": true
  },
  {
    "category": "domain",
    "description": "Review WatchedLists - AttachmentsList, ReactionsList",
    "steps": [
      "Verify AttachmentsList: max 10 items, add/remove methods",
      "Verify ReactionsList: unique per user+type, add/remove methods",
      "Verify getNewItems(), getRemovedItems() for event tracking",
      "Fix if necessary"
    ],
    "passes": true
  },
  {
    "category": "domain",
    "description": "Review Domain Events - all chat events",
    "steps": [
      "Verify ConversationCreated, ConversationRead events",
      "Verify MessageSent, ReactionAdded, ReactionRemoved events",
      "Verify payload structure (aggregateId, relevant data)",
      "Verify eventType naming convention",
      "Fix if necessary"
    ],
    "passes": true
  },
  {
    "category": "domain",
    "description": "Review Domain Errors",
    "steps": [
      "Verify conversation.errors.ts (ConversationNotFound, etc.)",
      "Verify message.errors.ts (MessageNotFound, ContentTooLong, etc.)",
      "Verify: extends DomainError, code property",
      "Add missing errors if necessary"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create IConversationRepository port",
    "steps": [
      "Create apps/nextjs/src/application/ports/conversation-repository.port.ts",
      "Define: create, findById, findByParticipants, findAllForUser",
      "Use BaseRepository pattern from CLAUDE.md",
      "Export interface"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create IMessageRepository port",
    "steps": [
      "Create apps/nextjs/src/application/ports/message-repository.port.ts",
      "Define: create, findById, findByConversation (paginated), update",
      "Use BaseRepository pattern",
      "Export interface"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create GetConversations use case",
    "steps": [
      "Create apps/nextjs/src/application/use-cases/chat/get-conversations.use-case.ts",
      "Input: userId",
      "Output: conversations with lastMessage, unreadCount",
      "Create corresponding DTOs"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create CreateConversation use case",
    "steps": [
      "Create create-conversation.use-case.ts",
      "Input: userId, recipientId",
      "Logic: find existing or create new",
      "Output: conversationId",
      "Dispatch ConversationCreated event if new"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create GetMessages use case",
    "steps": [
      "Create get-messages.use-case.ts",
      "Input: conversationId, userId, pagination (cursor)",
      "Output: messages with reactions, attachments",
      "Verify user is participant"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create SendMessage use case",
    "steps": [
      "Create send-message.use-case.ts",
      "Input: conversationId, senderId, content?, attachmentIds?",
      "Validation: content or attachments required",
      "Dispatch MessageSent event",
      "Update conversation lastMessage"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create AddReaction use case",
    "steps": [
      "Create add-reaction.use-case.ts",
      "Input: messageId, userId, reactionType",
      "Toggle logic: add if not exists, remove if exists",
      "Dispatch ReactionAdded or ReactionRemoved event"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create MarkConversationRead use case",
    "steps": [
      "Create mark-conversation-read.use-case.ts",
      "Input: conversationId, userId",
      "Update participant.lastReadAt",
      "Dispatch ConversationRead event"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Create UploadMedia use case",
    "steps": [
      "Create upload-media.use-case.ts",
      "Input: file (Buffer), mimeType, userId",
      "Validation: image types only, max 50MB",
      "Store file (S3/R2 or local)",
      "Output: MediaAttachment data"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Create Drizzle schema for conversations",
    "steps": [
      "Add table conversations in packages/drizzle/src/schema",
      "Columns: id, createdAt, updatedAt",
      "Add table conversation_participants (userId, conversationId, lastReadAt)",
      "Run pnpm db:generate"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Create Drizzle schema for messages",
    "steps": [
      "Add table messages",
      "Columns: id, conversationId, senderId, content, createdAt, editedAt, deletedAt",
      "Add table message_attachments",
      "Add table message_reactions",
      "Run pnpm db:generate"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Implement DrizzleConversationRepository",
    "steps": [
      "Create apps/nextjs/src/adapters/repositories/drizzle-conversation.repository.ts",
      "Implement IConversationRepository",
      "Create ConversationMapper (domain <-> db)"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Implement DrizzleMessageRepository",
    "steps": [
      "Create drizzle-message.repository.ts",
      "Implement IMessageRepository",
      "Create MessageMapper with attachments and reactions"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Create Chat controllers",
    "steps": [
      "Create apps/nextjs/src/adapters/controllers/chat/",
      "conversations.controller.ts (GET list, POST create)",
      "messages.controller.ts (GET list, POST send)",
      "reactions.controller.ts (POST add, DELETE remove)",
      "Use requireAuth guard"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Create SSE controller for realtime",
    "steps": [
      "Create sse.controller.ts",
      "Endpoint GET /api/chat/sse",
      "Subscribe to domain events",
      "Stream events to connected clients"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Register DI bindings for chat module",
    "steps": [
      "Create apps/nextjs/src/common/di/modules/chat.module.ts",
      "Bind repositories and use cases",
      "Export and import in container"
    ],
    "passes": false
  },
  {
    "category": "api",
    "description": "Create /api/chat/conversations routes",
    "steps": [
      "Create app/api/chat/conversations/route.ts",
      "GET: list conversations for user",
      "POST: create/get conversation with recipient"
    ],
    "passes": false
  },
  {
    "category": "api",
    "description": "Create /api/chat/conversations/[id]/messages routes",
    "steps": [
      "Create app/api/chat/conversations/[id]/messages/route.ts",
      "GET: list messages (paginated)",
      "POST: send message"
    ],
    "passes": false
  },
  {
    "category": "api",
    "description": "Create /api/chat/messages/[id]/reactions routes",
    "steps": [
      "Create app/api/chat/messages/[id]/reactions/route.ts",
      "POST: add reaction",
      "DELETE: remove reaction"
    ],
    "passes": false
  },
  {
    "category": "api",
    "description": "Create /api/chat/upload route",
    "steps": [
      "Create app/api/chat/upload/route.ts",
      "POST: upload image file",
      "Return attachment metadata"
    ],
    "passes": false
  },
  {
    "category": "api",
    "description": "Create /api/chat/sse route",
    "steps": [
      "Create app/api/chat/sse/route.ts",
      "GET: SSE stream endpoint",
      "Handle connection, events, disconnection"
    ],
    "passes": false
  },
  {
    "category": "api",
    "description": "Create /api/chat/recipients route",
    "steps": [
      "Create app/api/chat/recipients/route.ts",
      "GET: search users (for new conversation)",
      "Query param: search"
    ],
    "passes": false
  },
  {
    "category": "expo",
    "description": "Create constants/chat.ts with types",
    "steps": [
      "Create apps/expo/constants/chat.ts",
      "Define all types (Conversation, Message, etc.)",
      "Define REACTION_TYPES constant",
      "Define API response types"
    ],
    "passes": false
  },
  {
    "category": "expo",
    "description": "Create lib/sse/sse-client.ts",
    "steps": [
      "Install react-native-sse",
      "Create SSE client with reconnection logic",
      "Handle events: message:new, reaction:added, etc."
    ],
    "passes": false
  },
  {
    "category": "expo",
    "description": "Create React Query hooks - conversations",
    "steps": [
      "Create lib/api/hooks/use-conversations.ts",
      "useConversations(): list",
      "useCreateConversation(): mutation"
    ],
    "passes": false
  },
  {
    "category": "expo",
    "description": "Create React Query hooks - messages",
    "steps": [
      "Create lib/api/hooks/use-messages.ts",
      "useMessages(conversationId): infinite query",
      "useSendMessage(): mutation with optimistic update"
    ],
    "passes": false
  },
  {
    "category": "expo",
    "description": "Create React Query hooks - reactions and upload",
    "steps": [
      "Create use-reactions.ts (toggle mutation)",
      "Create use-media-upload.ts (upload with progress)",
      "Create use-recipients.ts (search query)"
    ],
    "passes": false
  },
  {
    "category": "screens",
    "description": "Create messages list screen",
    "steps": [
      "Create app/(protected)/messages/_layout.tsx (Stack)",
      "Create app/(protected)/messages/index.tsx",
      "ConversationList component with FlatList",
      "ConversationItem, UnreadBadge components",
      "FAB for new message"
    ],
    "passes": false
  },
  {
    "category": "screens",
    "description": "Create new message screen",
    "steps": [
      "Create app/(protected)/messages/new.tsx",
      "RecipientSelector with search input",
      "RecipientItem component",
      "Navigation to conversation on select"
    ],
    "passes": false
  },
  {
    "category": "screens",
    "description": "Create conversation screen - base",
    "steps": [
      "Create app/(protected)/messages/[conversationId].tsx",
      "MessageList (inverted FlatList)",
      "MessageBubble (sent/received)",
      "MessageInput (text only)",
      "DateSeparator component"
    ],
    "passes": false
  },
  {
    "category": "screens",
    "description": "Add reactions to conversation",
    "steps": [
      "Create ReactionBar component",
      "Create ReactionPicker modal",
      "Integrate in MessageBubble",
      "Long press -> picker"
    ],
    "passes": false
  },
  {
    "category": "screens",
    "description": "Add media to conversation",
    "steps": [
      "Create MediaPicker (expo-image-picker)",
      "Create MediaPreview (before send)",
      "Create MessageMedia (grid in bubble)",
      "Integrate in MessageInput",
      "Fullscreen image viewer"
    ],
    "passes": false
  },
  {
    "category": "screens",
    "description": "Integrate SSE for realtime",
    "steps": [
      "Create useSSE hook",
      "Connect on conversation mount",
      "Update QueryClient on events",
      "Handle reconnection"
    ],
    "passes": false
  },
  {
    "category": "polish",
    "description": "Add loading and empty states",
    "steps": [
      "Skeleton loaders for lists",
      "Empty state: no conversations",
      "Empty state: no messages",
      "Error boundaries"
    ],
    "passes": false
  },
  {
    "category": "polish",
    "description": "Add error handling and retry",
    "steps": [
      "Error states with retry button",
      "Toast notifications for errors",
      "Offline handling"
    ],
    "passes": false
  },
  {
    "category": "polish",
    "description": "Timestamp formatting and preview",
    "steps": [
      "Relative timestamps (50 min, 2 days)",
      "Date separators formatting",
      "Message preview: photo icon if image only"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Run pnpm check:all on backend",
    "steps": [
      "pnpm type-check",
      "pnpm check (Biome)",
      "pnpm test",
      "Fix any errors"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Test all 3 screens on iOS Simulator",
    "steps": [
      "Test conversations list (scroll, refresh, badges)",
      "Test new message (search, select)",
      "Test conversation (send, reactions, images)"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Test all 3 screens on Android Emulator",
    "steps": [
      "Same tests as iOS",
      "Check keyboard handling",
      "Check image picker"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Test SSE realtime",
    "steps": [
      "Open 2 sessions (different users)",
      "Send message, verify appears in other session",
      "Add reaction, verify updates",
      "Test reconnection after disconnect"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Final code review",
    "steps": [
      "No any types",
      "No console.log",
      "No commented code",
      "Consistent naming"
    ],
    "passes": false
  }
]
```

---

## Agent Instructions

1. Read `activity.md` first to understand current state
2. Find next task with `"passes": false`
3. Complete all steps for that task
4. Verify in browser
5. Update task to `"passes": true`
6. Log completion in `activity.md`
7. Repeat until all tasks pass

**Important:** Only modify the `passes` field. Do not remove or rewrite tasks.

---

## Completion Criteria
All tasks marked with `"passes": true`
