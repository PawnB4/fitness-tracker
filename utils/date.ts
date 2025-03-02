/**
 * Safely parses a date from various formats, handling both string dates from SQLite 
 * and invalid JavaScript Date objects
 */
export function parseDate(dateInput: Date | string | number | null | undefined): Date {
  if (!dateInput) {
    return new Date();
  }
  
  // Handle case when it's a Date object but invalid (Date { NaN })
  if (dateInput instanceof Date) {
    return !isNaN(dateInput.getTime()) ? dateInput : new Date();
  }
  
  // Try to parse string or number
  try {
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date : new Date();
  } catch (e) {
    return new Date();
  }
}

/**
 * Format a date as a readable string
 */
export function formatDate(date: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const parsedDate = parseDate(date);
  return parsedDate.toLocaleDateString(undefined, options);
}

/**
 * Format time as a readable string
 */
export function formatTime(date: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const parsedDate = parseDate(date);
  return parsedDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  });
}

/**
 * Format date and time as a readable string
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  const parsedDate = parseDate(date);
  return `${formatDate(parsedDate)} ${formatTime(parsedDate)}`;
} 