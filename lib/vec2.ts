import { clamp, lerp, unlerp } from "./mathExtensions";

/**\
 * A simple 2d vector object which supports vector math.
 */
export default class Vec2 {
    public x: number;
    public y: number;

    constructor(v: {x?: number, y?: number});
    constructor(x?: number, y?: number);
    constructor(x?: number | {x?: number, y?: number}, y?: number) {
        if (typeof x === 'object') {
            this.x = x.x ?? 0;
            this.y = x.y ?? 0;
        }
        else {
            this.x = x ?? 0;
            this.y = y ?? 0;
        }
    }

    add(other: Vec2): Vec2;
    add(scalar: number): Vec2;
    add(other: Vec2 | number): Vec2 {
        other = this.handleScalar(other);
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vec2): Vec2;
    subtract(scalar: number): Vec2;
    subtract(other: Vec2 | number): Vec2 {
        other = this.handleScalar(other);
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    multiply(other: Vec2): Vec2;
    multiply(scalar: number): Vec2;
    multiply(other: Vec2 | number): Vec2 {
        other = this.handleScalar(other);
        return new Vec2(this.x * other.x, this.y * other.y);
    }

    divide(other: Vec2): Vec2;
    divide(scalar: number): Vec2;
    divide(other: Vec2 | number): Vec2 {
        other = this.handleScalar(other);
        return new Vec2(this.x / other.x, this.y / other.y);
    }

    abs(): Vec2 {
        return new Vec2(Math.abs(this.x), Math.abs(this.y));
    }

    public negate(): Vec2 {
        return new Vec2(-this.x, -this.y);
    }

    private handleScalar(s: Vec2 | number): Vec2 {
        
        if (typeof s === 'number') {
            return new Vec2(s, s);
        }

        return s;
    }

    /**
     * clamp this Vec2 within the rectangle given by min and max
     * @param min minimum bounds
     * @param max maximum bounds
     * @returns a new Vec2 from this Vec2 with each coord clamped within min and max
     */
    public clamp(min: Vec2, max: Vec2): Vec2 {
        return new Vec2(clamp(this.x, min.x, max.x), clamp(this.y, min.y, max.y));
    }

    /**
     * use this Vec2 as an interpolation value between a given minimum and maximum
     * @param a minimum bounds
     * @param b maximum bounds
     * @param [c=false] f true, clamp this Vec2 between 0,0 and 1,1
     * @returns a new Vec2 interpolated between a and b based on this Vec2
     */
    public lerp(a: Vec2, b: Vec2, c: boolean = false): Vec2 {
        return new Vec2(lerp(a.x, b.x, this.x, c), lerp(a.y, b.y, this.y, c));
    }

    /**
     * determine the distance of this Vec2 between a given minimum and maximum
     * @param a minimum bounds
     * @param b maximum bounds
     * @param [c=false] if true, clamp the return Vec2 between 0,0 and 1,1
     * @returns a new Vec2 based on this Vec2's position between a and b
     */
    public unlerp(a: Vec2, b: Vec2, c: boolean = false): Vec2 {
        return new Vec2(unlerp(a.x, b.x, this.x, c), unlerp(a.y, b.y, this.y, c));
    }

    /**
     * (0, 0)
     */
    static Zero = new Vec2(0, 0);

    /**
     * (0.5, 0.5)
     */
    static Half = new Vec2(0.5, 0.5);

    /**
     * (1, 1)
     */
    static One = new Vec2(1, 1);

    /**
     * (num, num2 ?? num)
     */
    static From = (num: number, num2?: number) => new Vec2(num, num2 ?? num);
}