"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    const exchangeCode = async () => {
      if (!code) return;
      const res = await fetch("/api/oauth", {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem(
          "google_token_for_youtube_access",
          data.access_token
        );
        router.push("/dashboard");
      }
    };
    exchangeCode();
  }, [code, router]);

  return <div>Connecting With Youtube...</div>;
}
