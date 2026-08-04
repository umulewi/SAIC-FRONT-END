import { Plus, Trash2 } from "lucide-react";
import { TextInput, Field } from "./Field";

interface Pair {
  [key: string]: string;
}

export function ListField<T extends Pair>({
  label,
  items,
  onChange,
  keys,
  emptyItem,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  keys: { key: keyof T; placeholder: string }[];
  emptyItem: T;
}) {
  const update = (index: number, key: keyof T, value: string) => {
    const next = items.slice();
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const add = () => onChange([...items, { ...emptyItem }]);

  return (
    <Field label={label}>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {keys.map(({ key, placeholder }) => (
              <TextInput
                key={String(key)}
                value={String(item[key] ?? "")}
                placeholder={placeholder}
                onChange={(e) => update(index, key, e.target.value)}
                className="flex-1"
              />
            ))}
            <button
              type="button"
              onClick={() => remove(index)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-100"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </Field>
  );
}
