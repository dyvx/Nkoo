import { APP_CONFIG } from './config';
export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
export function formatCount(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(n);
}
export function timeAgo(date: string) {
  const days = Math.max(
    0,
    Math.floor((new Date(APP_CONFIG.demoDate).getTime() - new Date(date).getTime()) / 86400000),
  );
  return days === 0
    ? 'Today'
    : days === 1
      ? '1 day ago'
      : days < 30
        ? `${days} days ago`
        : `${Math.floor(days / 30)} month${days >= 60 ? 's' : ''} ago`;
}
export function fullDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(
    new Date(date),
  );
}
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}
