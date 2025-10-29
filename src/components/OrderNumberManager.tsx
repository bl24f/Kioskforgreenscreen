/**
 * Order Number Manager
 * Handles sequential order number generation and storage
 */

const ORDER_COUNTER_KEY = 'orderCounter';

/**
 * Gets the next sequential order number and increments the counter
 * @returns Formatted order number (e.g., "0001", "0002", etc.)
 */
export function getNextOrderNumber(): string {
  try {
    // Get current counter from localStorage
    const currentCounterStr = localStorage.getItem(ORDER_COUNTER_KEY);
    const currentCounter = currentCounterStr ? parseInt(currentCounterStr, 10) : 0;
    
    // Increment counter
    const nextCounter = currentCounter + 1;
    
    // Save incremented counter back to localStorage
    localStorage.setItem(ORDER_COUNTER_KEY, nextCounter.toString());
    
    // Format as 4-digit padded number
    return formatOrderNumber(nextCounter);
  } catch (error) {
    console.error('Failed to get next order number:', error);
    // Fallback to timestamp-based number if localStorage fails
    return formatOrderNumber(Date.now() % 10000);
  }
}

/**
 * Gets the current order counter without incrementing
 * @returns Current counter value
 */
export function getCurrentOrderCounter(): number {
  try {
    const currentCounterStr = localStorage.getItem(ORDER_COUNTER_KEY);
    return currentCounterStr ? parseInt(currentCounterStr, 10) : 0;
  } catch (error) {
    console.error('Failed to get current order counter:', error);
    return 0;
  }
}

/**
 * Formats a number as a 4-digit padded order number
 * @param num - The number to format
 * @returns Formatted string (e.g., "0001", "0042", "1234")
 */
export function formatOrderNumber(num: number): string {
  return num.toString().padStart(4, '0');
}

/**
 * Resets the order counter (admin function)
 * @param startValue - Optional starting value (defaults to 0)
 */
export function resetOrderCounter(startValue: number = 0): void {
  try {
    localStorage.setItem(ORDER_COUNTER_KEY, startValue.toString());
  } catch (error) {
    console.error('Failed to reset order counter:', error);
  }
}

/**
 * Sets the order counter to a specific value (admin function)
 * @param value - The value to set
 */
export function setOrderCounter(value: number): void {
  try {
    if (value < 0) {
      console.warn('Order counter cannot be negative, setting to 0');
      value = 0;
    }
    localStorage.setItem(ORDER_COUNTER_KEY, value.toString());
  } catch (error) {
    console.error('Failed to set order counter:', error);
  }
}
