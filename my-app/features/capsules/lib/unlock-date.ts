import type { UnlockRule } from '../types/create-capsule';

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function createDefaultUnlockAt(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function createDefaultUnlockRule(): UnlockRule {
  return {
    visibility: 'private',
    encrypted: true,
    unlockAt: createDefaultUnlockAt().toISOString(),
    unlockConfirmed: false,
  };
}

export function parseUnlockAt(iso?: string): { date: Date; hour: number; minute: number } {
  const base = iso ? new Date(iso) : createDefaultUnlockAt();
  return {
    date: new Date(base.getFullYear(), base.getMonth(), base.getDate()),
    hour: base.getHours(),
    minute: base.getMinutes(),
  };
}

export function buildUnlockAt(date: Date, hour: number, minute: number): string {
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next.toISOString();
}

export function formatUnlockDisplay(iso?: string): string {
  if (!iso) return 'Not set';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatUnlockTime(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function isUnlockInFuture(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() > Date.now();
}

export function addDaysFromToday(days: number): Date {
  const date = startOfToday();
  date.setDate(date.getDate() + days);
  return date;
}

export function addMonthsFromToday(months: number): Date {
  const date = startOfToday();
  date.setMonth(date.getMonth() + months);
  return date;
}

export function addYearsFromToday(years: number): Date {
  const date = startOfToday();
  date.setFullYear(date.getFullYear() + years);
  return date;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function daysFromToday(date: Date): number {
  const start = startOfToday().getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.round((target - start) / (1000 * 60 * 60 * 24));
}
