// ============================================
// CampusMarket - useDebounce Hook
// ============================================
// Custom hook that debounces a value by a specified delay.
// Useful for search inputs to prevent excessive API calls.

import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of the provided value.
 * The debounced value will only update after the specified delay
 * has passed without the value changing.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if value changes before delay completes
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
