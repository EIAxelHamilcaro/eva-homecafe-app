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
