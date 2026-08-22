import type { SiteContent } from "./content-types";

const BASE = "https://dreamoztech.com/api/public/wa";

let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedContent: { data: SiteContent; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) return cachedToken.token;

  const apiKey = process.env["DREAMOZTECH_API_KEY"];
  const apiSecret = process.env["DREAMOZTECH_API_SECRET"];
  if (!apiKey || !apiSecret) {
    throw new Error("DreamozTech API credentials are not configured.");
  }

  const res = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey, apiSecret }),
  });
  if (!res.ok) {
    throw new Error(`DreamozTech token request failed [${res.status}]: ${await res.text()}`);
  }
  const json = (await res.json()) as { token: string; expiresIn?: number };
  cachedToken = {
    token: json.token,
    expiresAt: now + (json.expiresIn ?? 3600) * 1000,
  };
  return json.token;
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const now = Date.now();
  if (cachedContent && cachedContent.expiresAt > now) return cachedContent.data;

  const token = await getToken();
  const res = await fetch(`${BASE}/webapp`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    cachedToken = null;
    throw new Error(`DreamozTech content request failed [${res.status}]: ${await res.text()}`);
  }
  const data = (await res.json()) as SiteContent;
  cachedContent = { data, expiresAt: now + 60_000 };
  return data;
}
