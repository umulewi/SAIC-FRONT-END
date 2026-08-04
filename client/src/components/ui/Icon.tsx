import {
  Clock,
  Sparkles,
  Target,
  Leaf,
  Users,
  TrendingUp,
  ShieldCheck,
  Handshake,
  Sprout,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Clock,
  Sparkles,
  Target,
  Leaf,
  Users,
  TrendingUp,
  ShieldCheck,
  Handshake,
  Sprout,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = icons[name] ?? Sparkles;
  return <Cmp className={className} strokeWidth={1.75} />;
}
