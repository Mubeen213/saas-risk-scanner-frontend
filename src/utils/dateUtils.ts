import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a date string or Date object into a standard, unambiguous format.
 * Format: "MMM d, yyyy" (e.g., "Nov 29, 2025")
 * This format avoids confusion between MM/DD and DD/MM.
 * 
 * @param date - The date to format (ISO string or Date object)
 * @returns Formatted date string or "-" if invalid
 */
export const formatDisplayDate = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
      // Fallback for non-ISO strings that might be valid dates but failed parseISO
      const fallbackDate = new Date(date);
      if (isValid(fallbackDate)) {
          return format(fallbackDate, 'MMM d, yyyy');
      }
      return "-";
  }
  
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Formats a date with time.
 * Format: "MMM d, yyyy • h:mm a" (e.g., "Nov 29, 2025 • 2:30 PM")
 */
export const formatDisplayDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return "-";
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
         const fallbackDate = new Date(date);
        if (isValid(fallbackDate)) {
            return format(fallbackDate, 'MMM d, yyyy • h:mm a');
        }
        return "-";
    }
    
    return format(dateObj, 'MMM d, yyyy • h:mm a');
};
