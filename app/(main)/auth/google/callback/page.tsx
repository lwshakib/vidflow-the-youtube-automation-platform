"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    const exchangeCode = async () => {
      if (!code) return;

      try {
        const res = await fetch("/api/oauth", {
          method: "POST",
          body: JSON.stringify({ code }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (data.access_token && data.refresh_token) {
          // Save refresh token to database via API
          const saveTokenRes = await fetch("/api/youtube/save-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              refresh_token: data.refresh_token,
            }),
          });

          const saveTokenData = await saveTokenRes.json();

          if (saveTokenData.success) {
            toast.success("YouTube account connected successfully!");
            router.push("/youtube");
          } else {
            toast.error(
              "Failed to save YouTube credentials. Please try again."
            );
            router.push("/youtube");
          }
        } else {
          toast.error("Failed to connect YouTube account. Please try again.");
          router.push("/youtube");
        }
      } catch (error) {
        console.error("Error during OAuth callback:", error);
        toast.error("An error occurred while connecting your YouTube account.");
        router.push("/youtube");
      }
    };

    exchangeCode();
  }, [code, router]);

  return <div>Connecting With Youtube...</div>;
}
