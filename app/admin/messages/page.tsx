import { ActionForm, Card, PageHeader } from "@/components/admin/ui";
import { Empty } from "@/components/admin/table-tools";
import { markMessageHandled } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function AdminMessages() {
  const messages = await db.contactMessage.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }], take: 100 });
  return (
    <div>
      <PageHeader title="Messages" description="Enquiries submitted through the contact form." />
      {messages.length === 0 ? <Empty>No messages yet.</Empty> : (
        <div className="space-y-4">
          {messages.map((m) => (
            <Card key={m.id} className={m.handled ? "opacity-60" : ""}>
              <div className="flex flex-wrap justify-between gap-3">
                <p className="font-medium">{m.subject}</p>
                <p className="text-xs text-muted">{formatDate(m.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <p className="text-sm text-muted">{m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`} className="underline">{m.email}</a></p>
              <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
              <div className="mt-4">
                <ActionForm action={markMessageHandled} submitLabel={m.handled ? "Mark as open" : "Mark as handled"} variant="outline" className="space-y-0">
                  <input type="hidden" name="id" value={m.id} /><input type="hidden" name="handled" value={String(!m.handled)} />
                </ActionForm>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
