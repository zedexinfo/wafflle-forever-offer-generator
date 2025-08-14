// Time utility functions for IST (Indian Standard Time) operations

export const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30

/**
 * Get current time in IST
 */
export function getCurrentIST(): Date {
  const utc = new Date();
  const ist = new Date(utc.getTime() + IST_OFFSET);
  return ist;
}

/**
 * Convert any date to IST
 */
export function toIST(date: Date): Date {
  const utc = new Date(date.getTime());
  return new Date(utc.getTime() + IST_OFFSET);
}

/**
 * Get the same time tomorrow in IST
 * For example: if it's 1:05 PM today, returns 1:05 PM tomorrow
 */
export function getSameTimeTomorrowIST(fromTime?: Date): Date {
  const baseTime = fromTime ? toIST(fromTime) : getCurrentIST();
  const tomorrow = new Date(baseTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

/**
 * Calculate remaining time until a specific time in milliseconds
 */
export function getRemainingTimeUntil(targetTime: Date): number {
  const now = getCurrentIST();
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
  const nextAvailableTime = getSameTimeTomorrowIST(generatedAt);
  const remaining = getRemainingTimeUntil(nextAvailableTime);
  return remaining > 0;
}

/**
 * Format IST time in 12-hour format
 */
export function formatISTTime(date: Date): string {
  return toIST(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}