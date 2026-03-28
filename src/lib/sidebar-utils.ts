export const EMOJI_PALETTE = [
  "🧪", "💊", "🩺", "🧬", "🌿", "🔬", "💉", "🏥", "❤️", "🧠",
  "🦴", "🫀", "🫁", "👁️", "🦷", "🌡️", "⚕️", "🧫", "🔭", "📊",
  "🎯", "🚀", "🌊", "🔥", "⭐", "🎨", "📦", "🛒", "🏠", "📱",
];

export const BG_PALETTE = [
  "var(--color-avatar-0)",
  "var(--color-avatar-1)",
  "var(--color-avatar-2)",
  "var(--color-avatar-3)",
  "var(--color-avatar-4)",
  "var(--color-avatar-5)",
];

export function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getEmoji(name: string): string {
  return EMOJI_PALETTE[hashString(name) % EMOJI_PALETTE.length];
}

export function getBgColor(name: string): string {
  return BG_PALETTE[hashString(name) % BG_PALETTE.length];
}

export function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
