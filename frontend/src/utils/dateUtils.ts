import { format, formatDistanceToNow } from 'date-fns';

export function safeFormat(dateVal: any, formatStr: string, fallback = 'N/A'): string {
  if (!dateVal) return fallback;
  try {
    let d: Date;
    if (typeof dateVal === 'string') {
      // Handle potential trailing microsecond precision or ISO strings
      const cleaned = dateVal.length > 23 && dateVal.includes('T') ? dateVal.substring(0, 23) : dateVal;
      d = new Date(cleaned);
    } else if (typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else if (dateVal instanceof Date) {
      d = dateVal;
    } else {
      return fallback;
    }
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
}

export function safeFormatDistanceToNow(dateVal: any, options?: any, fallback = 'Recently'): string {
  if (!dateVal) return fallback;
  try {
    let d: Date;
    if (typeof dateVal === 'string') {
      const cleaned = dateVal.length > 23 && dateVal.includes('T') ? dateVal.substring(0, 23) : dateVal;
      d = new Date(cleaned);
    } else if (typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else if (dateVal instanceof Date) {
      d = dateVal;
    } else {
      return fallback;
    }
    if (isNaN(d.getTime())) return fallback;
    return formatDistanceToNow(d, options);
  } catch {
    return fallback;
  }
}
