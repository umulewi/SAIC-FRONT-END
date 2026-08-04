import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "glass";
type Size = "md" | "lg";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit";
  withArrow?: boolean;
  className?: string;
  disabled?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-soft hover:shadow-lg hover:shadow-brand-600/25 focus-visible:outline-brand-600",
  secondary:
    "bg-earth-500 text-white hover:bg-earth-600 shadow-soft hover:shadow-lg hover:shadow-earth-500/25 focus-visible:outline-earth-500",
  outline:
    "border border-ink-200 text-ink-800 hover:border-brand-600 hover:text-brand-700 hover:shadow-soft focus-visible:outline-brand-600",
  ghost: "text-ink-700 hover:text-brand-700 focus-visible:outline-brand-600",
  glass: "border border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white",
};

const shineEligible: Record<Variant, boolean> = {
  primary: true,
  secondary: true,
  outline: false,
  ghost: false,
  glass: true,
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function Button({
  href,
  onClick,
  children,
  variant = "primary",
  size = "md",
  type = "button",
  withArrow = false,
  className = "",
  disabled = false,
}: ButtonProps) {
  const classes = `relative isolate overflow-hidden inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 outline-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`;

  const shine = shineEligible[variant] && (
    <span className="pointer-events-none absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
  );

  const content = (
    <>
      {shine}
      {children}
      {withArrow && (
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </>
  );

  if (href) {
    const isExternal = href.startsWith("http");
    const isAnchor = href.startsWith("#");
    if (isExternal || isAnchor) {
      return (
        <a href={href} className={`group ${classes}`} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
          {content}
        </a>
      );
    }
    return (
      <Link to={href} className={`group ${classes}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`group ${classes}`}>
      {content}
    </button>
  );
}
