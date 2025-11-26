/**
 * Formats a timestamp (milliseconds since epoch) to a readable date string
 * @param timestamp - Timestamp in milliseconds (number or string)
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number | string): string {
  // Convert to number if it's a string
  const numTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  
  // Check if timestamp is valid
  if (isNaN(numTimestamp) || numTimestamp <= 0) {
    return 'Invalid Date';
  }

  // Create date from milliseconds timestamp
  const date = new Date(numTimestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  // Format with locale string
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

