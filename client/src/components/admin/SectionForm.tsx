import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { getSection, updateSection } from "../../lib/api";
import type { Sections } from "../../types";
import { Button } from "../ui/Button";

interface SectionFormProps<K extends keyof Sections> {
  sectionKey: K;
  title: string;
  description?: string;
  children: (value: Sections[K], setValue: (v: Sections[K]) => void) => ReactNode;
}

export function SectionForm<K extends keyof Sections>({
  sectionKey,
  title,
  description,
  children,
}: SectionFormProps<K>) {
  const [value, setValue] = useState<Sections[K] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSection(sectionKey).then(setValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  if (!value) return <p className="text-sm text-ink-400">Loading…</p>;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateSection(sectionKey, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-ink-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>

      <div className="grid gap-5 rounded-2xl border border-ink-100 bg-white p-6">
        {children(value, setValue)}
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
