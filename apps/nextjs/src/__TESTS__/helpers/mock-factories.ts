import { vi } from "vitest";

function baseMethods() {
  return {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findMany: vi.fn(),
    findBy: vi.fn(),
    exists: vi.fn(),
    count: vi.fn(),
  };
}

export function createMockUserRepo() {
  return {
    ...baseMethods(),
    findByEmail: vi.fn(),
  };
}

export function createMockPostRepo() {
  return {
    ...baseMethods(),
    findByUserId: vi.fn(),
  };
}

export function createMockConversationRepo() {
  return {
    ...baseMethods(),
    findByParticipants: vi.fn(),
    findAllForUser: vi.fn(),
  };
}

export function createMockMessageRepo() {
  return {
    ...baseMethods(),
    findByConversation: vi.fn(),
  };
}

export function createMockNotificationRepo() {
  return {
    ...baseMethods(),
    findByUserId: vi.fn(),
    findUnreadByUserId: vi.fn(),
    markAsRead: vi.fn(),
    countUnread: vi.fn(),
  };
}

export function createMockFriendRequestRepo() {
  return {
    ...baseMethods(),
    findByUsers: vi.fn(),
    findPendingForUser: vi.fn(),
    findFriendsForUser: vi.fn(),
    existsBetweenUsers: vi.fn(),
  };
}

export function createMockProfileRepo() {
  return {
    ...baseMethods(),
    findByUserId: vi.fn(),
    existsByUserId: vi.fn(),
  };
}

export function createMockEmotionRepo() {
  return {
    ...baseMethods(),
    findByUserIdAndDate: vi.fn(),
  };
}

export function createMockEventDispatcher() {
  return {
    dispatch: vi.fn(),
    dispatchAll: vi.fn(),
  };
}

export function createMockAuthProvider() {
  return {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    verifyEmail: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
  };
}

export function createMockStorageProvider() {
  return {
    upload: vi.fn(),
    delete: vi.fn(),
    getUrl: vi.fn(),
    generatePresignedUploadUrl: vi.fn(),
  };
}

export function createMockJournalReminderQueryProvider() {
  return {
    getEligibleUsers: vi.fn(),
  };
}
