import { useRef, useState } from "react";
import { Loader2, Video, X } from "lucide-react";
import { uploadImage } from "../../lib/api";
import { Field, TextInput } from "./Field";

export function VideoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Field
      label={label}
      hint="Upload a video (MP4/WebM, up to 80MB) or paste a URL. Shown as a 'Watch our story' play button over the hero image — leave empty to hide it."
    >
      <div className="flex flex-col gap-3">
        {value && (
          <div className="relative w-full max-w-xs overflow-hidden rounded-xl bg-ink-950">
            <video src={value} className="h-40 w-full object-cover" muted loop autoPlay playsInline />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remove video"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <TextInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/…"
            className="flex-1"
          />
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-ink-50 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-100 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : "Upload video"}
          </button>
        </div>
      </div>
    </Field>
  );
}
