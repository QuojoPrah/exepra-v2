"use server";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { emails } from "@/lib/email/templates";
import { getClientIp, rateLimit } from "@/lib/security";
import { getStoreSettings } from "@/lib/settings";
import { contactSchema, fieldErrors } from "@/lib/validation";

export type ContactState = { status: "idle" | "success" | "error"; message: string; errors?: Record<string, string> };

export async function sendContactMessage(_: ContactState, formData: FormData): Promise<ContactState> {
  if (formData.get("website")) return { status: "success", message: "Thank you!" }; // honeypot
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error) };
  if (!(await rateLimit("contact", await getClientIp(), 5, 3600))) {
    return { status: "error", message: "You've sent several messages recently. Please try again later." };
  }
  await db.contactMessage.create({ data: parsed.data });
  const settings = await getStoreSettings();
  const to = process.env.STORE_NOTIFICATION_EMAIL || settings.contactEmail;
  if (to) {
    const mail = emails.contactNotification(parsed.data);
    await sendEmail({ to, template: "contact-notification", ...mail });
  }
  return { status: "success", message: "Thank you — we've received your message and will get back to you as soon as possible." };
}
