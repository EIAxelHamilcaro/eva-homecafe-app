"use client";

import { Button } from "@packages/ui/components/ui/button";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import ReactDOM from "react-dom/client";

export interface MentionItem {
  id: string;
  label: string;
  avatarUrl: string | null;
}

interface MentionListProps {
  items: MentionItem[];
  command: (item: MentionItem) => void;
}

interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // biome-ignore lint/correctness/useExhaustiveDependencies: reset on items change
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          const item = items[selectedIndex];
          if (item) command(item);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="rounded-lg border bg-white p-2 shadow-lg">
          <p className="text-xs text-muted-foreground">Aucun ami trouve</p>
        </div>
      );
    }

    return (
      <div className="max-h-48 overflow-y-auto rounded-lg border bg-white shadow-lg">
        {items.map((item, index) => (
          <Button
            variant="ghost"
            key={item.id}
            onClick={() => command(item)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
              index === selectedIndex ? "bg-homecafe-pink/10" : "hover:bg-muted"
            }`}
          >
            {item.avatarUrl ? (
              <div
                className="h-6 w-6 shrink-0 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${item.avatarUrl})` }}
              />
            ) : (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-homecafe-blue text-[10px] font-bold text-white">
                {item.label.charAt(0).toUpperCase()}
              </div>
            )}
            <span>{item.label}</span>
          </Button>
        ))}
      </div>
    );
  },
);

MentionList.displayName = "MentionList";

type SuggestionPropsWithRect = SuggestionProps<MentionItem> & {
  clientRect?: () => DOMRect | null;
};

export function createMentionSuggestion(
  fetchFriends: () => Promise<MentionItem[]>,
): Omit<SuggestionOptions<MentionItem>, "editor"> {
  let cachedFriends: MentionItem[] | null = null;

  return {
    items: async ({ query }) => {
      if (!cachedFriends) {
        cachedFriends = await fetchFriends();
      }
      const q = query.toLowerCase();
      return cachedFriends
        .filter((f) => f.label.toLowerCase().includes(q))
        .slice(0, 8);
    },
    render: () => {
      let component: ReactDOM.Root | null = null;
      let container: HTMLDivElement | null = null;
      let listRef: MentionListRef | null = null;

      function positionContainer(
        el: HTMLDivElement,
        props: SuggestionPropsWithRect,
      ) {
        const rect = props.clientRect?.();
        if (rect) {
          el.style.top = `${rect.bottom + window.scrollY + 4}px`;
          el.style.left = `${rect.left + window.scrollX}px`;
        }
      }

      return {
        onStart: (props: SuggestionProps<MentionItem>) => {
          container = document.createElement("div");
          container.style.position = "absolute";
          container.style.zIndex = "50";

          positionContainer(container, props as SuggestionPropsWithRect);

          document.body.appendChild(container);
          component = ReactDOM.createRoot(container);
          component.render(
            <MentionList
              ref={(r) => {
                listRef = r;
              }}
              items={props.items}
              command={props.command}
            />,
          );
        },
        onUpdate: (props: SuggestionProps<MentionItem>) => {
          if (!component || !container) return;

          positionContainer(container, props as SuggestionPropsWithRect);

          component.render(
            <MentionList
              ref={(r) => {
                listRef = r;
              }}
              items={props.items}
              command={props.command}
            />,
          );
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") {
            if (container) {
              container.remove();
              container = null;
            }
            component = null;
            return true;
          }
          return listRef?.onKeyDown(props) ?? false;
        },
        onExit: () => {
          if (container) {
            component?.unmount();
            container.remove();
            container = null;
          }
          component = null;
        },
      };
    },
  };
}
