import { useState } from "react";
import { ImageOff } from "lucide-react";

interface MediaProps {
  src?: string | null;
  alt: string;
  className?: string;
  gradient?: "brand" | "earth" | "ink";
}

const gradients: Record<string, string> = {
  brand: "from-brand-600 via-brand-500 to-earth-400",
  earth: "from-earth-500 via-earth-400 to-brand-500",
  ink: "from-ink-800 via-brand-700 to-brand-500",
};

export function Media({ src, alt, className = "", gradient = "brand" }: MediaProps) {
  const isPlaceholder = !src;
  const [errored, setErrored] = useState(false);

  if (isPlaceholder || errored) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradients[gradient]} ${className}`}
      >
        <div className="absolute inset-0 opacity-20 mix-blend-overlay [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <ImageOff className="relative h-8 w-8 text-white/70" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
