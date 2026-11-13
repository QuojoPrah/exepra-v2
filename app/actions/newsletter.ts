"use server";

import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { emails } from "@/lib/email/templates";
import { getClientIp, rateLimit } from "@/lib/security";
import { siteUrl } from "@/lib/site";
import { newsletterSchema } from "@/lib/validation";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/consent";

export type NewsletterState = { status: "idle" | "success" | "error"; message: string };

export async function subscribeToNewsletter(_: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") === "on",
    source: formData.get("source") ?? "footer",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const ip = await getClientIp();
  if (!(await rateLimit("newsletter", ip, 5, 600))) {
    return { status: "error", message: "Too many attempts. Please try again in a few minutes." };
  }

  const { email, source } = parsed.data;
  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
  if (existing?.status === "CONFIRMED") {
    return { status: "success", message: "You're already subscribed — thank you!" };
  }

  const token = randomBytes(24).toString("base64url");
  await db.newsletterSubscriber.upsert({
    where: { email },
    create: { email, token, consentText: NEWSLETTER_CONSENT_TEXT, consentAt: new Date(), consentIp: ip, source },
    update: { token, status: "PENDING", consentText: NEWSLETTER_CONSENT_TEXT, consentAt: new Date(), consentIp: ip, unsubscribedAt: null },
  });

  const mail = emails.newsletterConfirm(siteUrl(`/newsletter/confirm?token=${token}`));
  const result = await sendEmail({ to: email, template: "newsletter-confirm", ...mail });
  if (result.status !== "sent") {
    return { status: "error", message: "We couldn't send the confirmation email right now. Please try again later." };
  }
  return { status: "success", message: "Almost done! Please confirm your subscription via the email we just sent you." };
}
