import { googleAuthRedirectUri, googleClientId, googleClientSecret } from "@/lib/env/config";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code } = body;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code || "",
      client_id: googleClientId || "",
      client_secret: googleClientSecret || "",
      redirect_uri: googleAuthRedirectUri || "",
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
