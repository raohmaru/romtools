import { useState } from 'react'

type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Custom hook to throttle function calls
 * @param wait - number of milliseconds to wait between calls
 * @returns A function that can be used to throttle calls to another function
 */
export function useThrottle(wait: number) {
    const [previous, setPrevious] = useState<number>(0);

    const setFunction = (func: AnyFunction, args?: Array<unknown>, scope?: AnyFunction) => {
        const now = Date.now();

        const remaining = now - previous;

        if (remaining > wait) {
            setPrevious(now);
            func.apply(scope, args ?? []);
        }
    }

    return setFunction;
}