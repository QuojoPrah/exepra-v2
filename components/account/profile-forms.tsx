"use client";

import { useActionState } from "react";
import { changePassword, deleteAccount, updateProfile, type FormState } from "@/app/(store)/account/actions";
import { Button } from "@/components/ui/button";

const initial: FormState = { status: "idle", message: "" };

function Message({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <p className={`text-sm ${state.status === "success" ? "text-success" : "text-danger"}`} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}

export function ProfileForm({ firstName, lastName, phone, email }: { firstName: string; lastName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, initial);
  return (
    <form action={action} className="grid grid-cols-2 gap-4">
      <div className="col-span-2 sm:col-span-1">
        <label htmlFor="firstName" className="label">First name</label>
        <input id="firstName" name="firstName" defaultValue={firstName} className="field" autoComplete="given-name" aria-invalid={Boolean(state.errors?.firstName) || undefined} />
        {state.errors?.firstName && <p className="field-error">{state.errors.firstName}</p>}
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label htmlFor="lastName" className="label">Last name</label>
        <input id="lastName" name="lastName" defaultValue={lastName} className="field" autoComplete="family-name" aria-invalid={Boolean(state.errors?.lastName) || undefined} />
        {state.errors?.lastName && <p className="field-error">{state.errors.lastName}</p>}
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label htmlFor="email" className="label">Email</label>
        <input id="email" value={email} className="field bg-cream" disabled readOnly />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label htmlFor="phone" className="label">Phone <span className="font-normal text-muted">(optional)</span></label>
        <input id="phone" name="phone" type="tel" defaultValue={phone} className="field" autoComplete="tel" />
        {state.errors?.phone && <p className="field-error">{state.errors.phone}</p>}
      </div>
      <div className="col-span-2 flex items-center gap-4">
        <Button type="submit" loading={pending}>Save changes</Button>
        <Message state={state} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);
  return (
    <form action={action} className="grid gap-4 sm:max-w-md">
      <div>
        <label htmlFor="currentPassword" className="label">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className="field" aria-invalid={Boolean(state.errors?.currentPassword) || undefined} />
      </div>
      <div>
        <label htmlFor="newPassword" className="label">New password</label>
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required className="field" aria-invalid={Boolean(state.errors?.newPassword) || undefined} />
        <p className="mt-1.5 text-xs text-muted">At least 10 characters, including a letter and a number.</p>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" variant="outline" loading={pending}>Change password</Button>
        <Message state={state} />
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, initial);
  return (
    <form action={action} className="grid gap-4 sm:max-w-md">
      <div>
        <label htmlFor="del-password" className="label">Password</label>
        <input id="del-password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      <div>
        <label htmlFor="confirm" className="label">Type DELETE to confirm</label>
        <input id="confirm" name="confirm" required className="field" autoComplete="off" />
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" variant="danger" loading={pending}>Delete my account</Button>
        <Message state={state} />
      </div>
    </form>
  );
}
