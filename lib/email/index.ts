import "server-only";
import { Resend } from "resend";
import { db } from "@/lib/db";

export type SendResult =
  | { status: "sent"; id: string }
  | { status: "failed"; error: string }
  | { status: "skipped"; error: string };

let client: Resend | null = null;

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Sends a transactional email through Resend and records the outcome in EmailLog.
 * Returns "sent" only when Resend confirms acceptance with a message id.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  template: string;
  orderId?: string;
}): Promise<SendResult> {
  let result: SendResult;

  if (!isEmailConfigured()) {
    result = { status: "skipped", error: "RESEND_API_KEY / EMAIL_FROM not configured" };
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[email:${input.template}] (not sent — email provider not configured)\nTo: ${input.to}\nSubject: ${input.subject}\n${input.text}\n`);
    }
  } else {
    try {
      client ??= new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await client.emails.send({
        from: process.env.EMAIL_FROM!,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: process.env.EMAIL_REPLY_TO || undefined,
      });
      result = data?.id
        ? { status: "sent", id: data.id }
        : { status: "failed", error: error?.message ?? "Unknown provider error" };
    } catch (err) {
      result = { status: "failed", error: err instanceof Error ? err.message : String(err) };
    }
  }

  try {
    await db.emailLog.create({
      data: {
        to: input.to,
        subject: input.subject,
        template: input.template,
        status: result.status,
        providerId: result.status === "sent" ? result.id : null,
        error: result.status === "sent" ? null : result.error,
        orderId: input.orderId,
      },
    });
  } catch (err) {
    console.error("[email] failed to write EmailLog", err);
  }

  if (result.status === "failed") console.error(`[email:${input.template}] ${result.error}`);
  return result;
}
