import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import type { ContactMessage } from "../../types";
import { deleteMessage, getMessages, markMessageRead } from "../../lib/api";

export function Messages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setMessages(await getMessages());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpen = async (msg: ContactMessage) => {
    if (!msg.read) {
      await markMessageRead(msg.id);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    await deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-ink-950">Contact Messages</h2>
        <p className="mt-1 text-sm text-ink-500">Submissions from the website contact form.</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-ink-400">No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <details
              key={msg.id}
              onToggle={(e) => e.currentTarget.open && handleOpen(msg)}
              className="group rounded-2xl border border-ink-100 bg-white p-5 open:border-brand-200"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  {msg.read ? (
                    <MailOpen className="h-4 w-4 shrink-0 text-ink-300" />
                  ) : (
                    <Mail className="h-4 w-4 shrink-0 text-brand-600" />
                  )}
                  <div className="min-w-0">
                    <p className={`truncate ${msg.read ? "font-medium text-ink-700" : "font-bold text-ink-950"}`}>
                      {msg.subject}
                    </p>
                    <p className="truncate text-xs text-ink-400">
                      {msg.name} · {msg.email}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-ink-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(msg.id);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </summary>
              <p className="mt-4 whitespace-pre-wrap border-t border-ink-100 pt-4 text-sm leading-relaxed text-ink-600">
                {msg.message}
              </p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
