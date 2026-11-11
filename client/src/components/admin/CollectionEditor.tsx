import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import type { BaseItem, CollectionName } from "../../types";
import { createItem, deleteItem, getCollection, updateItem } from "../../lib/api";
import { Checkbox, Field, TextInput, TextArea, Select } from "./Field";
import { ImageField } from "./ImageField";
import { Button } from "../ui/Button";
import { useConfirm } from "../../context/ConfirmContext";

export type FieldSchema =
  | { key: string; label: string; type: "text" }
  | { key: string; label: string; type: "textarea"; rows?: number }
  | { key: string; label: string; type: "image" }
  | { key: string; label: string; type: "select"; options: string[] }
  | { key: string; label: string; type: "checkbox" };

interface CollectionEditorProps<N extends CollectionName> {
  name: N;
  title: string;
  description?: string;
  fields: FieldSchema[];
  titleKey: string;
  subtitleKey?: string;
}

type Item = BaseItem & Record<string, unknown>;

function emptyItem(fields: FieldSchema[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const f of fields) {
    obj[f.key] = f.type === "select" ? f.options[0] : f.type === "checkbox" ? false : "";
  }
  return obj;
}

export function CollectionEditor<N extends CollectionName>({
  name,
  title,
  description,
  fields,
  titleKey,
  subtitleKey,
}: CollectionEditorProps<N>) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true);
    const data = await getCollection(name);
    setItems(data as unknown as Item[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setDraft({ ...item });
  };

  const startNew = () => {
    setEditingId("new");
    setDraft(emptyItem(fields));
  };

  const cancel = () => {
    setEditingId(null);
    setDraft({});
  };

  const save = async () => {
    setSaving(true);
    try {
      const { id: _id, order: _order, ...fieldsOnly } = draft as Item;
      if (editingId === "new") {
        await createItem(name, fieldsOnly as never);
      } else if (typeof editingId === "number") {
        const existing = items.find((i) => i.id === editingId);
        await updateItem(name, editingId, { ...fieldsOnly, order: existing?.order } as never);
      }
      await load();
      cancel();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number, label: string) => {
    const ok = await confirm({
      title: `Delete "${label}"?`,
      description: "This item will be permanently removed. This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    await deleteItem(name, id);
    await load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    const { id: idA, order: orderA, ...fieldsA } = a;
    const { id: idB, order: orderB, ...fieldsB } = b;
    await Promise.all([
      updateItem(name, idA, { ...fieldsA, order: orderB } as never),
      updateItem(name, idB, { ...fieldsB, order: orderA } as never),
    ]);
    await load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink-950">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
        </div>
        {editingId === null && (
          <Button size="md" onClick={startNew}>
            <Plus className="h-4 w-4" /> Add new
          </Button>
        )}
      </div>

      {editingId !== null && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => {
              const full = f.type === "textarea" || f.type === "image";
              return (
                <div key={f.key} className={full ? "sm:col-span-2" : ""}>
                  {f.type === "text" && (
                    <Field label={f.label}>
                      <TextInput
                        value={(draft[f.key] as string) ?? ""}
                        onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                      />
                    </Field>
                  )}
                  {f.type === "textarea" && (
                    <Field label={f.label}>
                      <TextArea
                        rows={f.rows ?? 3}
                        value={(draft[f.key] as string) ?? ""}
                        onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                      />
                    </Field>
                  )}
                  {f.type === "image" && (
                    <ImageField
                      label={f.label}
                      value={(draft[f.key] as string) ?? ""}
                      onChange={(url) => setDraft({ ...draft, [f.key]: url })}
                    />
                  )}
                  {f.type === "select" && (
                    <Field label={f.label}>
                      <Select
                        value={(draft[f.key] as string) ?? f.options[0]}
                        onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                      >
                        {f.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  )}
                  {f.type === "checkbox" && (
                    <Checkbox
                      label={f.label}
                      checked={Boolean(draft[f.key])}
                      onChange={(e) => setDraft({ ...draft, [f.key]: e.target.checked })}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
            <Button variant="outline" onClick={cancel}>
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.length === 0 && <p className="text-sm text-ink-400">No items yet.</p>}
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{String(item[titleKey] ?? "")}</p>
                {subtitleKey && (
                  <p className="truncate text-sm text-ink-400">{String(item[subtitleKey] ?? "")}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => startEdit(item)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-brand-600 hover:bg-brand-50"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(item.id, String(item[titleKey] ?? "this item"))}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
