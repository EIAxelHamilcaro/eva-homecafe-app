export const conversationKeys = {
  all: ["conversations"] as const,
  list: ["conversations", "list"] as const,
};

export const messageKeys = {
  all: ["messages"] as const,
  list: (conversationId: string) =>
    ["messages", "list", conversationId] as const,
};

export const recipientKeys = {
  all: ["recipients"] as const,
  search: (query: string) => ["recipients", "search", query] as const,
};

export const profileKeys = {
  all: ["profiles"] as const,
  batch: (ids: string[]) => ["profiles", "batch", ...ids.sort()] as const,
};

export const postKeys = {
  all: ["posts"] as const,
  list: (page: number) => ["posts", "list", page] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
  reactions: (id: string) => ["posts", "reactions", id] as const,
  comments: (id: string) => ["posts", "comments", id] as const,
};

export const journalKeys = {
  all: ["journal"] as const,
  entries: (page: number) => ["journal", "entries", page] as const,
  streak: ["journal", "streak"] as const,
};
