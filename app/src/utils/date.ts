export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatDateShort(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function getTimeRemaining(
  endDateIso: string,
  nowTimestamp?: number
): {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
  text: string;
  badgeVariant: 'urgent' | 'warning' | 'normal' | 'expired';
} {
  const target = new Date(endDateIso).getTime();
  if (isNaN(target)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isExpired: false,
      text: '—',
      badgeVariant: 'normal',
    };
  }

  if (!nowTimestamp) {
    // During SSR or before hydration, display clean date string
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isExpired: false,
      text: formatDateShort(endDateIso),
      badgeVariant: 'normal',
    };
  }

  const diff = target - nowTimestamp;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isExpired: true,
      text: 'Expired',
      badgeVariant: 'expired',
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let text = '';
  let badgeVariant: 'urgent' | 'warning' | 'normal' | 'expired' = 'normal';

  if (days > 0) {
    text = `${days}d ${hours}h left`;
    if (days <= 2) badgeVariant = 'urgent';
    else if (days <= 7) badgeVariant = 'warning';
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m left`;
    badgeVariant = 'urgent';
  } else {
    text = `${minutes}m left`;
    badgeVariant = 'urgent';
  }

  return { days, hours, minutes, isExpired: false, text, badgeVariant };
}
