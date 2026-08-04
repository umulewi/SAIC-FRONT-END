import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.53-1.5H16.6V4.3C16.3 4.26 15.3 4.17 14.15 4.17c-2.4 0-4.05 1.47-4.05 4.17V10.5H7.6v3h2.5V21h3.4z" />
    </svg>
  );
}

export function TwitterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 3H21.6l-5.85 6.69L22.6 21h-5.4l-4.23-5.53L8.1 21H5.4l6.26-7.16L5.4 3h5.53l3.82 5.05L18.9 3zm-.95 16.17h1.5L8.1 4.73H6.5L17.95 19.17z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x={3.5} y={3.5} width={17} height={17} rx={5} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17.2} cy={6.8} r={0.9} fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 8.6s-.2-1.55-.83-2.23c-.8-.87-1.7-.87-2.1-.92C16.2 5.2 12 5.2 12 5.2h-.01s-4.2 0-7.07.25c-.4.05-1.3.05-2.1.92C2.2 7.05 2 8.6 2 8.6S1.8 10.4 1.8 12.2v1.6c0 1.8.2 3.6.2 3.6s.2 1.55.83 2.23c.8.87 1.84.84 2.3.94 1.67.16 7.1.24 7.1.24s4.2-.01 7.07-.26c.4-.05 1.3-.05 2.1-.92.63-.68.83-2.23.83-2.23s.2-1.8.2-3.6v-1.6c0-1.8-.2-3.6-.2-3.6zM9.9 15.5v-6l5.8 3-5.8 3z" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 8.5H4.06V20h2.88V8.5zM5.5 4a1.67 1.67 0 100 3.34A1.67 1.67 0 005.5 4zM20 13.36c0-3.06-1.64-4.49-3.83-4.49-1.77 0-2.56.98-3 1.66V8.5H10.3c.04.85 0 11.5 0 11.5h2.87v-6.42c0-.34.02-.69.13-.94.28-.69.92-1.4 2-1.4 1.4 0 1.97 1.07 1.97 2.63V20H20v-6.64z" />
    </svg>
  );
}
