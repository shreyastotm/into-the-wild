import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TrekEventStatus } from '@/types/trek'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number = 150): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatDateLong(date: string | Date): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateWithTime(date: string | Date): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
export function getUniqueParticipantCount(participants: Array<{ user_id?: string; id?: string }>): number {
  if (!participants || !Array.isArray(participants)) return 0;
  const uniqueIds = new Set(participants.map(p => p.user_id || p.id));
  return uniqueIds.size;
}

interface BadgeProps {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
}

export const getTrekStatusBadgeProps = (status: TrekEventStatus | string | null): BadgeProps => {
  switch (status) {
    case TrekEventStatus.OPEN_FOR_REGISTRATION:
      return { variant: 'default' as const, className: '' };
    case TrekEventStatus.REGISTRATION_CLOSED:
      return { variant: 'secondary' as const, className: '' };
    case TrekEventStatus.ONGOING:
      return { variant: 'default' as const, className: '' };
    case TrekEventStatus.COMPLETED:
      return { variant: 'secondary' as const, className: '' };
    case TrekEventStatus.CANCELLED:
      return { variant: 'destructive' as const, className: '' };
    case TrekEventStatus.UPCOMING:
      return { variant: 'outline' as const, className: '' };
    case TrekEventStatus.DRAFT:
      return { variant: 'outline' as const, className: '' };
    default:
      // For any unknown status or if status is null/empty string
      return { variant: 'outline' as const, className: '' };
  }
};
