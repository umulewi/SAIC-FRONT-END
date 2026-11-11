interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center items-center mx-auto" : "text-left items-start";
  const titleWidth = align === "center" ? "mx-auto max-w-xl text-lg sm:text-xl lg:text-2xl" : "max-w-2xl";
  const subtitleWidth = align === "center" ? "mx-auto max-w-5xl text-sm sm:text-base lg:text-lg" : "max-w-2xl";

  return (
    <div className={`flex flex-col gap-4 ${align === "center" ? "max-w-5xl" : "max-w-2xl"} ${alignment}`}>
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
            light ? "bg-white/10 text-brand-200" : "bg-brand-50 text-brand-700"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${light ? "bg-brand-300" : "bg-brand-500"}`} />
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-balance ${titleWidth} font-bold leading-[1.2] ${light ? "text-white" : ""}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-balance ${subtitleWidth} leading-relaxed ${light ? "text-white/80" : "text-ink-500"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
