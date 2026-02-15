import { NextResponse } from "next/server";
import { auth } from "@/common/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "Invalid month parameter" },
      { status: 400 },
    );
  }

  try {
    const tokenResult = await auth.api.getAccessToken({
      body: { providerId: "google" },
      headers: request.headers,
    });

    if (!tokenResult?.accessToken) {
      return NextResponse.json({ events: [], connected: false });
    }

    const parts = month.split("-").map(Number);
    const year = parts[0] ?? 2026;
    const m = parts[1] ?? 1;
    const timeMin = new Date(year, m - 1, 1).toISOString();
    const timeMax = new Date(year, m, 0, 23, 59, 59).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${tokenResult.accessToken}` } },
    );

    if (!response.ok) {
      return NextResponse.json({
        events: [],
        connected: true,
        error: "Failed to fetch Google events",
      });
    }

    const data = await response.json();
    const events = (data.items ?? []).map((item: Record<string, unknown>) => {
      const start = item.start as Record<string, string> | undefined;
      return {
        id: item.id as string,
        title: (item.summary as string) ?? "(Sans titre)",
        date: start?.date ?? (start?.dateTime as string)?.split("T")[0] ?? "",
        color: "blue",
        source: "google" as const,
      };
    });

    return NextResponse.json({ events, connected: true });
  } catch {
    return NextResponse.json({ events: [], connected: false });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tokenResult = await auth.api.getAccessToken({
      body: { providerId: "google" },
      headers: request.headers,
    });

    if (!tokenResult?.accessToken) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { title, date } = body as { title: string; date: string };

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: title,
          start: { date },
          end: { date },
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create Google event" },
        { status: 500 },
      );
    }

    const created = await response.json();
    return NextResponse.json(
      { id: created.id, title: created.summary, date },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create Google event" },
      { status: 500 },
    );
  }
}
