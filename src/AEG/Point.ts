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
     * If no coordinates are specified, default them to 0.
     * @param coordX The specified x coordinate.
     * @param coordY The specified y coordinate.
     */
    public constructor(coordX?: number, coordY?: number) {
        this.x = coordX ?? 0;
        this.y = coordY ?? 0;
    }

    public set(coordX: number, coordY: number) {
        this.x = coordX;
        this.y = coordY;
    }

    /**
     * Returns a string representation of the point.
     * @returns The coordinates of the point in string form.
     */
    public toString(): string {
        return "X: " + this.x + ", Y: " + this.y;
    }
}
