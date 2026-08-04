const PALETTES = [
  ["#379b3c", "#19421d"],
  ["#d0812f", "#63331d"],
  ["#277d2c", "#0a240c"],
  ["#dc9c4c", "#763c20"],
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function paletteFor(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const [a, b] = PALETTES[hash % PALETTES.length];
  return [a, b];
}

export function InitialsAvatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = getInitials(name);
  const [from, to] = paletteFor(name);
  const gradientId = `avatar-${name.replace(/\s+/g, "-")}`;

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={name}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradientId})`} />
      <circle cx="82" cy="18" r="26" fill="#ffffff" opacity="0.08" />
      <circle cx="10" cy="95" r="30" fill="#ffffff" opacity="0.06" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize="34"
        fontWeight="700"
        fontFamily="Sora, system-ui, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}
