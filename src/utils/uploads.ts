const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export function uploadUrl(filename: string | null | undefined): string {
  if (!filename) return '';
  return `${API_BASE}/uploads/${filename}`;
}
