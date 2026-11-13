"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { addressSchema, fieldErrors, passwordSchema, phoneSchema } from "@/lib/validation";

export type FormState = { status: "idle" | "success" | "error"; message: string; errors?: Record<string, string> };

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  phone: phoneSchema,
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser("/account/profile");
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error) };
  await db.user.update({
    where: { id: session.user.id },
    data: { name: `${parsed.data.firstName} ${parsed.data.lastName}`, phone: parsed.data.phone || null },
  });
  revalidatePath("/account", "layout");
  return { status: "success", message: "Your profile has been updated." };
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  await requireUser("/account/profile");
  const current = String(formData.get("currentPassword") ?? "");
  const next = passwordSchema.safeParse(formData.get("newPassword"));
  if (!next.success) return { status: "error", message: next.error.issues[0].message, errors: { newPassword: next.error.issues[0].message } };
  try {
    await auth.api.changePassword({
      body: { currentPassword: current, newPassword: next.data, revokeOtherSessions: true },
      headers: await headers(),
    });
    return { status: "success", message: "Password changed. Other devices have been signed out." };
  } catch {
    return { status: "error", message: "Your current password is incorrect.", errors: { currentPassword: "Incorrect password." } };
  }
}

export async function deleteAccount(_: FormState, formData: FormData): Promise<FormState> {
  await requireUser("/account/profile");
  if (formData.get("confirm") !== "DELETE") return { status: "error", message: 'Please type "DELETE" to confirm.' };
  try {
    await auth.api.deleteUser({ body: { password: String(formData.get("password") ?? "") }, headers: await headers() });
  } catch {
    return { status: "error", message: "Your password is incorrect." };
  }
  redirect("/?account-deleted=1");
}

function addressFromForm(formData: FormData) {
  return addressSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company") ?? "",
    street: formData.get("street"),
    houseNumber: formData.get("houseNumber"),
    addressLine2: formData.get("addressLine2") ?? "",
    postalCode: formData.get("postalCode"),
    city: formData.get("city"),
    country: formData.get("country"),
    phone: formData.get("phone") ?? "",
  });
}

export async function saveAddress(_: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser("/account/addresses");
  const parsed = addressFromForm(formData);
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error) };
  const id = String(formData.get("id") ?? "");
  const isDefault = formData.get("isDefault") === "on";
  const data = {
    ...parsed.data,
    company: parsed.data.company || null,
    addressLine2: parsed.data.addressLine2 || null,
    phone: parsed.data.phone || null,
    isDefault,
  };
  await db.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
    if (id) {
      // updateMany scoped by userId prevents editing someone else's address
      const r = await tx.address.updateMany({ where: { id, userId: session.user.id }, data });
      if (r.count !== 1) throw new Error("Address not found");
    } else {
      const count = await tx.address.count({ where: { userId: session.user.id } });
      if (count >= 20) throw new Error("Too many addresses");
      await tx.address.create({ data: { ...data, isDefault: isDefault || count === 0, userId: session.user.id } });
    }
  });
  revalidatePath("/account/addresses");
  return { status: "success", message: "Address saved." };
}

export async function deleteAddress(formData: FormData) {
  const session = await requireUser("/account/addresses");
  await db.address.deleteMany({ where: { id: String(formData.get("id")), userId: session.user.id } });
  revalidatePath("/account/addresses");
}
