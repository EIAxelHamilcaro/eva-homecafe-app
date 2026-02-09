import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Link from "next/link";

type WidgetType =
  | "mood"
  | "posts"
  | "tasks"
  | "gallery"
  | "messages"
  | "calendar"
  | "journal"
  | "moodboard";

const EMPTY_STATE_CONFIG: Record<
  WidgetType,
  {
    title: string;
    heading: string;
    message: string;
    href?: string;
    cta?: string;
  }
> = {
  mood: {
    title: "Mood Summary",
    heading: "No mood data yet",
    message: "Track your first mood to see your weekly summary.",
    href: "/mood",
    cta: "Record Mood",
  },
  posts: {
    title: "Recent Posts",
    heading: "No posts yet",
    message: "Write your first post to see it here.",
    href: "/posts/new",
    cta: "Write Post",
  },
  tasks: {
    title: "Tasks",
    heading: "No tasks yet",
    message: "Create your first to-do list to get organized.",
    href: "/organization",
    cta: "Create Task",
  },
  gallery: {
    title: "Gallery",
    heading: "No photos yet",
    message: "Upload your first photo to start your gallery.",
    href: "/gallery",
    cta: "Upload Photo",
  },
  messages: {
    title: "Messages",
    heading: "No messages yet",
    message: "Start a conversation with a friend.",
    href: "/messages",
    cta: "Send Message",
  },
  calendar: {
    title: "Calendar",
    heading: "No events yet",
    message: "Add a task with a due date to see it on the calendar.",
    href: "/organization",
    cta: "Add Task",
  },
  journal: {
    title: "Quick Journal",
    heading: "Start journaling",
    message: "Write your first journal entry below.",
  },
  moodboard: {
    title: "Moodboard",
    heading: "No moodboards yet",
    message: "Create a visual moodboard to express yourself.",
    href: "/moodboard",
    cta: "Create Moodboard",
  },
};

interface WidgetEmptyStateProps {
  type: WidgetType;
}

export function WidgetEmptyState({ type }: WidgetEmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="font-medium text-muted-foreground">{config.heading}</p>
          <p className="mt-1 text-sm text-muted-foreground">{config.message}</p>
          {config.href && config.cta && (
            <Link
              href={config.href}
              className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {config.cta}
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
