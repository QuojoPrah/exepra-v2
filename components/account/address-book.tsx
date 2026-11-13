"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteAddress, saveAddress, type FormState } from "@/app/(store)/account/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type Address = { id: string; firstName: string; lastName: string; company: string | null; street: string; houseNumber: string; addressLine2: string | null; postalCode: string; city: string; country: string; phone: string | null; isDefault: boolean };

function AddressForm({ address, countries, onDone }: { address: Address | null; countries: { code: string; name: string }[]; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveAddress, { status: "idle", message: "" });
  useEffect(() => {
    if (state.status === "success") onDone();
  }, [state, onDone]);
  const e = state.errors ?? {};
  const input = (name: keyof Address, label: string, cls: string, ac?: string, required = true) => (
    <div className={cls}>
      <label htmlFor={`a-${name}`} className="label">{label}{!required && <span className="font-normal text-muted"> (optional)</span>}</label>
      <input id={`a-${name}`} name={name} defaultValue={(address?.[name] as string) ?? ""} autoComplete={ac} required={required} className="field" aria-invalid={Boolean(e[name]) || undefined} />
      {e[name] && <p className="field-error">{e[name]}</p>}
    </div>
  );
  return (
    <form action={action} className="grid grid-cols-6 gap-4 px-5 py-6 sm:px-6">
      {address && <input type="hidden" name="id" value={address.id} />}
      {input("firstName", "First name", "col-span-6 sm:col-span-3", "given-name")}
      {input("lastName", "Last name", "col-span-6 sm:col-span-3", "family-name")}
      {input("company", "Company", "col-span-6", "organization", false)}
      {input("street", "Street", "col-span-4", "address-line1")}
      {input("houseNumber", "No.", "col-span-2")}
      {input("addressLine2", "Address line 2", "col-span-6", "address-line2", false)}
      {input("postalCode", "Postal code", "col-span-2", "postal-code")}
      {input("city", "City", "col-span-4", "address-level2")}
      <div className="col-span-6">
        <label htmlFor="a-country" className="label">Country</label>
        <select id="a-country" name="country" defaultValue={address?.country ?? "DE"} className="field">
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>
      {input("phone", "Phone", "col-span-6", "tel", false)}
      <label className="col-span-6 flex items-center gap-3 text-sm">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} className="h-4 w-4 accent-[#1f1d1b]" /> Use as default address
      </label>
      {state.status === "error" && <p className="col-span-6 text-sm text-danger" role="alert">{state.message}</p>}
      <div className="col-span-6"><Button type="submit" loading={pending}>Save address</Button></div>
    </form>
  );
}

export function AddressBook({ addresses, countries }: { addresses: Address[]; countries: { code: string; name: string }[] }) {
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const countryName = (code: string) => countries.find((c) => c.code === code)?.name ?? code;
  return (
    <>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className="flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 text-sm">
            {a.isDefault && <span className="mb-2 self-start rounded-full bg-cream px-2.5 py-1 text-xs font-medium">Default</span>}
            <p className="font-medium">{a.firstName} {a.lastName}</p>
            <p className="mt-1 leading-relaxed text-muted">
              {a.company && <>{a.company}<br /></>}
              {a.street} {a.houseNumber}<br />
              {a.addressLine2 && <>{a.addressLine2}<br /></>}
              {a.postalCode} {a.city}<br />
              {countryName(a.country)}
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(a)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
              <form action={deleteAddress}>
                <input type="hidden" name="id" value={a.id} />
                <Button variant="ghost" size="sm" type="submit" aria-label={`Delete address ${a.street} ${a.houseNumber}`}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
              </form>
            </div>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setEditing("new")} className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-line text-sm text-muted hover:border-ink/40 hover:text-ink">
            <Plus className="h-5 w-5" /> Add address
          </button>
        </li>
      </ul>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New address" : "Edit address"} className="max-w-xl">
        {editing !== null && <AddressForm address={editing === "new" ? null : editing} countries={countries} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  );
}
