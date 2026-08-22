// Vercel Node.js serverless function: SMTP relay for app emails.
// The app itself runs in an edge runtime that cannot open SMTP sockets, so
// sends are relayed here, where a real Node TCP connection is available.
import nodemailer from "nodemailer";
import { createHmac, timingSafeEqual } from "node:crypto";

export const config = { runtime: "nodejs" };

const RELAY_TOKEN_LABEL = "dreamoztech-mail-relay-v1";

type Address = { email: string; name?: string };

type Payload = {
  to: Address[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: Address;
};

const isEmail = (v: unknown) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 255;

function validate(body: unknown): Payload {
  if (!body || typeof body !== "object") throw new Error("Invalid payload");
  const b = body as Record<string, unknown>;

  const to = Array.isArray(b["to"]) ? (b["to"] as Address[]) : [];
  if (to.length === 0 || to.length > 20 || !to.every((t) => isEmail(t?.email))) {
    throw new Error("Invalid recipient list");
  }
  const subject = b["subject"];
  if (typeof subject !== "string" || !subject.trim() || subject.length > 300) {
    throw new Error("Invalid subject");
  }
  const htmlContent = b["htmlContent"];
  if (typeof htmlContent !== "string" || !htmlContent.trim()) {
    throw new Error("Invalid htmlContent");
  }
  const textContent = b["textContent"];
  if (textContent !== undefined && typeof textContent !== "string") {
    throw new Error("Invalid textContent");
  }
  const replyTo = b["replyTo"] as Address | undefined;
  if (replyTo !== undefined && !isEmail(replyTo?.email)) throw new Error("Invalid replyTo");

  return {
    to,
    subject,
    htmlContent,
    ...(typeof textContent === "string" ? { textContent } : {}),
    ...(replyTo ? { replyTo } : {}),
  };
}

const addr = (a: Address) => (a.name ? `"${a.name.replace(/"/g, "")}" <${a.email}>` : a.email);

export default async function handler(
  req: { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
  },
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Internal token derived from the SMTP password shared by app + relay.
  const smtpPassword = process.env["SMTP_PASSWORD"];
  if (!smtpPassword) {
    res.status(500).json({ error: "SMTP_PASSWORD is not configured" });
    return;
  }
  const expected = createHmac("sha256", smtpPassword).update(RELAY_TOKEN_LABEL).digest("hex");
  const provided = String(req.headers["x-mail-secret"] ?? "");
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  ) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let payload: Payload;
  try {
    const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    payload = validate(raw);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Invalid request" });
    return;
  }

  const host = process.env["SMTP_HOST"]?.trim() || "mail.privateemail.com";
  const port = Number(process.env["SMTP_PORT"] ?? 465);
  const secure = (process.env["SMTP_SECURE"] ?? "true").trim() !== "false";
  const user = process.env["SMTP_USER"]?.trim();
  if (!user) {
    res.status(500).json({ error: "SMTP_USER is not configured" });
    return;
  }

  const fromEmail = process.env["MAIL_FROM_EMAIL"]?.trim() || user;
  const fromName = process.env["MAIL_FROM_NAME"]?.trim() || "DreamozTech";

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass: smtpPassword },
    });

    const info = await transporter.sendMail({
      from: addr({ email: fromEmail, name: fromName }),
      sender: fromEmail,
      to: payload.to.map(addr).join(", "),
      ...(payload.replyTo ? { replyTo: addr(payload.replyTo) } : {}),
      subject: payload.subject,
      html: payload.htmlContent,
      ...(payload.textContent ? { text: payload.textContent } : {}),
    });

    res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("SMTP send failed:", message);
    res.status(502).json({ error: `SMTP send failed: ${message}` });
  }
}
