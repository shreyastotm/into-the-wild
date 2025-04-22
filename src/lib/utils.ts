import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Returns the count of unique user IDs in an array of registration objects, excluding duplicates.
 * @param registrations Array of registration objects, each with a user_id field
 * @returns Number of unique user IDs
 */
export function getUniqueParticipantCount(registrations: { user_id: string }[]): number {
  if (!registrations) return 0;
  const uniqueUserIds = Array.from(new Set(registrations.map(r => r.user_id)));
  return uniqueUserIds.length;
}
