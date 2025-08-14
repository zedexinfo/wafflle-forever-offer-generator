// Time utility functions using UTC for global compatibility

/**
 * Get current UTC time
 */
export function getCurrentUTC(): Date {
  return new Date();
}

/**
 * Get the same time tomorrow in UTC
 * For example: if it's 1:05 PM today, returns 1:05 PM tomorrow (UTC)
 */
export function getSameTimeTomorrowUTC(fromTime?: Date): Date {
  const baseTime = fromTime ? new Date(fromTime) : getCurrentUTC();
  const tomorrow = new Date(baseTime);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow;
}

/**
 * Calculate remaining time until a specific time in milliseconds
 */
export function getRemainingTimeUntil(targetTime: Date): number {
  const now = getCurrentUTC();
  return Math.max(0, targetTime.getTime() - now.getTime());
}

/**
 * Format remaining time as a human-readable string
 */
export function formatRemainingTime(remainingMs: number): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  display: string;
} {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let display = '';
  if (hours > 0) {
    display = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    display = `${minutes}m ${seconds}s`;
  } else {
    display = `${seconds}s`;
  }

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    display
  };
}

/**
 * Check if a cooldown period is still active
 */
export function isCooldownActive(generatedAt: Date): boolean {
  const nextAvailableTime = getSameTimeTomorrowUTC(generatedAt);
  const remaining = getRemainingTimeUntil(nextAvailableTime);
  return remaining > 0;
}

/**
 * Format time using user's local timezone (for client-side use)
 */
export function formatLocalTime(date: Date): string {
  return date.toLocaleString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}