import net from "node:net";
import tls from "node:tls";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

function readLine(socket: net.Socket): Promise<string> {
  return new Promise((resolve, reject) => {
    let buf = "";
    const onData = (chunk: Buffer) => {
      buf += chunk.toString("utf8");
      // A complete SMTP reply ends with "NNN <text>\r\n" (no dash after code).
      const lines = buf.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1];
      if (last && /^\d{3} /.test(last)) {
        cleanup();
        resolve(buf);
      }
    };
    const onErr = (e: Error) => {
      cleanup();
      reject(e);
    };
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onErr);
    };
    socket.on("data", onData);
    socket.on("error", onErr);
  });
}

async function cmd(socket: net.Socket, line: string, expect = /^[23]\d\d/): Promise<string> {
  socket.write(line + "\r\n");
  const reply = await readLine(socket);
  const code = reply.trim().split(/\r?\n/).pop() ?? "";
  if (!expect.test(code)) throw new Error(`SMTP error for "${line.split(" ")[0]}": ${code}`);
  return reply;
}

/** Best-effort SMTP send. Throws on failure; callers should not block the order on it. */
export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  const host = process.env["SMTP_HOST"];
  const port = Number(process.env["SMTP_PORT"] ?? 465);
  const secure = String(process.env["SMTP_SECURE"] ?? "true") === "true";
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASSWORD"];
  const fromEmail = process.env["MAIL_FROM_EMAIL"];
  const fromName = process.env["MAIL_FROM_NAME"] ?? "DreamozTech";

  if (!host || !user || !pass || !fromEmail) {
    throw new Error("SMTP is not configured");
  }

  const socket: net.Socket = secure
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port });

  await new Promise<void>((resolve, reject) => {
    socket.once(secure ? "secureConnect" : "connect", () => resolve());
    socket.once("error", reject);
  });

  try {
    await readLine(socket); // greeting
    await cmd(socket, `EHLO ${host}`);
    await cmd(socket, "AUTH LOGIN", /^3\d\d/);
    await cmd(socket, Buffer.from(user).toString("base64"), /^3\d\d/);
    await cmd(socket, Buffer.from(pass).toString("base64"));
    await cmd(socket, `MAIL FROM:<${fromEmail}>`);
    await cmd(socket, `RCPT TO:<${to}>`);
    await cmd(socket, "DATA", /^3\d\d/);

    const message = [
      `From: "${fromName}" <${fromEmail}>`,
      `To: <${to}>`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/html; charset="utf-8"',
      "",
      html.replace(/^\./gm, ".."),
      ".",
    ].join("\r\n");

    socket.write(message + "\r\n");
    const reply = await readLine(socket);
    if (!/^[23]\d\d/.test(reply.trim().split(/\r?\n/).pop() ?? "")) {
      throw new Error(`SMTP rejected message: ${reply}`);
    }
    await cmd(socket, "QUIT", /^[23]\d\d/).catch(() => undefined);
  } finally {
    socket.end();
  }
}
