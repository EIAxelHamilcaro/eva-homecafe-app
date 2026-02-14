"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function InviteTokenAccepter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteToken = searchParams.get("invite_token");
  const acceptedRef = useRef(false);

  useEffect(() => {
    if (!inviteToken || acceptedRef.current) return;
    acceptedRef.current = true;

    fetch("/api/v1/friends/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: inviteToken }),
    }).finally(() => {
      router.replace("/dashboard");
    });
  }, [inviteToken, router]);

  return null;
}
