/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last invocation.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
    let timeoutId = null;
    let lastArgs = null;
    
    return function (...args) {
        lastArgs = args;
        
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
            if (lastArgs !== null) {
                func.apply(null, lastArgs);
                lastArgs = null;
            }
            timeoutId = null;
        }, wait);
    };
}
