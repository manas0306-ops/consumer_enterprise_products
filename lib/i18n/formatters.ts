import { getLocaleConfig } from './locales.config';

export type CalendarSystem = 'gregorian' | 'indian' | 'islamic';

/**
 * Format currency according to locale conventions.
 * Internally calculations are done on canonical numbers, formatting is presentation only (PRD 6.10).
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  localeCode: string = 'en-IN'
): string {
  try {
    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if specific locale is unsupported by runtime
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Format numbers with locale-appropriate grouping (Lakh/Crore for South Asia, Millions elsewhere)
 */
export function formatNumber(
  value: number,
  localeCode: string = 'en-IN',
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(localeCode, options).format(value);
  } catch {
    return value.toLocaleString();
  }
}

/**
 * Format date with locale conventions and optional traditional calendar system
 */
export function formatDate(
  dateInput: string | Date,
  localeCode: string = 'en-IN',
  calendar?: CalendarSystem
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const cfg = getLocaleConfig(localeCode);
  const activeCalendar = calendar || cfg.calendarDefault;

  try {
    let intlCalendar = 'gregory';
    if (activeCalendar === 'indian') intlCalendar = 'indian';
    if (activeCalendar === 'islamic') intlCalendar = 'islamic-umalqura';

    const formatter = new Intl.DateTimeFormat(`${localeCode}-u-ca-${intlCalendar}`, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return formatter.format(date);
  } catch {
    return date.toLocaleDateString(localeCode, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

/**
 * Time formatting
 */
export function formatTime(
  dateInput: string | Date,
  localeCode: string = 'en-IN'
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  try {
    return new Intl.DateTimeFormat(localeCode, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

/**
 * Full relative time (e.g. "3 days ago")
 */
export function formatRelativeTime(
  dateInput: string | Date,
  localeCode: string = 'en-IN'
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  return formatDate(date, localeCode);
}
