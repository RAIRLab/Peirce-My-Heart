/**
 * Defines a 2D Point.
 *
 * @author Ryan Reilly
 * @author Anusha Tiwari
 */
export class Point {
    /**
     * x-coordinate of this Point.
     */
    x: number;

    /**
     * y-coordinate of this Point.
     */
    y: number;

    /**
     * Creates a new point at the incoming coordinates.
     * @param xCoord Incoming x-coordinate.
     * @param yCoord Incoming y-coordinate.
     * @throws Error on receiving NaN or Infinity values as coordinates.
     */
    public constructor(xCoord: number, yCoord: number) {
        this.x = xCoord;
        this.y = yCoord;
        if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) {
            throw new Error("NaN or Infinity value(s) were passed in constructing a Point.");
        }
    }

    /**
     * Sets this Point's coordinates according to the incoming coordinates.
     * @param xCoord Incoming x-coordinate.
     * @param yCoord Incoming y-coordinate.
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
     * Calculates and returns the distance between this Point and the other incoming Point.
     * @param otherPoint Other incoming Point.
     * @returns Distance between the two Points.
     */
    public distance(otherPoint: Point): number {
        const dx = this.x - otherPoint.x;
        const dy = this.y - otherPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Creates and returns a readable string representation of this Point.
     * @returns Coordinates of this Point in string form.
     */
    public toString(): string {
        return "(" + this.x + ", " + this.y + ")";
    }
}
