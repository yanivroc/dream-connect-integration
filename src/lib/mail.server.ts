// Server-only mail sender.
// The app runs in an edge runtime that cannot open SMTP connections, so sends
// are relayed to the same deployment's Node serverless function
// (api/send-mail.ts), which talks SMTP. No extra env vars: both sides derive
// the same internal token from SMTP_PASSWORD.
import { getRequestUrl } from "@tanstack/react-start/server";

export interface MailAddress {
  email: string;
  name?: string;
}

const RELAY_TOKEN_LABEL = "dreamoztech-mail-relay-v1";

export function getMailConfig() {
  return {
    fromEmail: process.env["MAIL_FROM_EMAIL"]?.trim() ?? "",
    fromName: process.env["MAIL_FROM_NAME"]?.trim() || "DreamozTech",
  };
}

async function relayToken(smtpPassword: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(smtpPassword),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(RELAY_TOKEN_LABEL));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function relayUrl(): string | null {
  try {
    const url = getRequestUrl();
    if (url?.origin && !url.origin.includes("localhost")) return `${url.origin}/api/send-mail`;
  } catch {
    // no request context (e.g. build time)
  }
  const host =
    process.env["VERCEL_PROJECT_PRODUCTION_URL"]?.trim() || process.env["VERCEL_URL"]?.trim();
  return host ? `https://${host.replace(/^https?:\/\//, "")}/api/send-mail` : null;
}

/** Best-effort mail send via the Node relay. Throws on failure. */
export async function sendMail(opts: {
  to: MailAddress[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: MailAddress;
}): Promise<void> {
  const smtpPassword = process.env["SMTP_PASSWORD"];
  if (!smtpPassword) throw new Error("Email is not configured (SMTP_PASSWORD is missing).");

  const url = relayUrl();
  if (!url) throw new Error("Email sending is only available on the deployed site.");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-mail-secret": await relayToken(smtpPassword),
    },
    body: JSON.stringify({
      to: opts.to,
      subject: opts.subject,
      htmlContent: opts.htmlContent,
      ...(opts.textContent ? { textContent: opts.textContent } : {}),
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Email send failed: ${res.status} ${await res.text()}`);
  }
}
