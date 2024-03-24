/**
 * clamp t within the bounds of v0 and v1
 * @param t value to clamp
 * @param v0 min value
 * @param v1 max value
 * @returns t, or min of v0 and v1 if less than both, or max of v0 and v1 if greater than both
 */
export function clamp(t: number, v0: number, v1: number): number {
    return Math.min(Math.max(t, v0), v1);
}

/**
 * @param x interpolation value between v0 and v1. Usually in [0, 1]
 * @param a lower end of the range
 * @param b upper end of the range
 * @param c if true, clamp value t between 0 and 1
 * @returns a value interpolated between a and b based on the value of x
 */
export function lerp(a: number, b: number, x: number, c: boolean = false): number {
    if (c) {
        x = clamp(x, 0, 1);
    }
    return (1 - x) * a + x * b;
}

/**
 * @param x value between a and b
 * @param a lower end of the range
 * @param b upper end of the range
 * @param c if true, clamp return value between 0 and 1
 * @returns a value representing the proportion of x between a and b
 */
export function unlerp(a: number, b: number, x: number, c: boolean = false): number {

    if (b === a) {
        return b;
    }

    const result = (x - a) / (b - a);
    return c ? clamp(result, 0, 1) : result;
}