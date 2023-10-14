/**
 * Defines a Point.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 */
export class Point {
    /**
     * The x coordinate of the point.
     */
    x: number;

    /**
     * The y coordinate of the point.
     */
    y: number;

    /**
     * Constructs a new point at the given coordinates.
     * @param coordX The specified x coordinate.
     * @param coordY The specified y coordinate.
     * @throws Error on receiving NaN or Infinity values as coordinates.
     */
    public constructor(coordX: number, coordY: number) {
        this.x = coordX;
        this.y = coordY;
        if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) {
            throw new Error("NaN or Infinity value(s) were passed in constructing a Point.");
        }
    }

    /**
     * Sets this Point's coordinates according to the incoming numbers.
     * @param coordX the incoming value for x
     * @param coordY the incoming value for y
     * @throws Error on receiving NaN or Infinity values as coordinates.
     */
    public set(coordX: number, coordY: number) {
        if (!Number.isFinite(coordX) || !Number.isFinite(coordY)) {
            throw new Error(
                "NaN or Infinity value(s) were passed in setting " + this + "'s coords."
            );
        }
        this.x = coordX;
        this.y = coordY;
    }

    /**
     * Returns the distance between this Point and the other.
     * @param otherPoint the other Point
     * @returns the distance between the two
     */
    public distance(otherPoint: Point): number {
        const dx = this.x - otherPoint.x;
        const dy = this.y - otherPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Returns a string representation of the point.
     * @returns The coordinates of the point in string form.
     */
    public toString(): string {
        return "(" + this.x + ", " + this.y + ")";
    }
}
