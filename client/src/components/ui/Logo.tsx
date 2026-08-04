export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="SAIC — Stewardship Agribusiness Incubation Center"
      className={`w-auto object-contain ${className}`}
    />
  );
}
