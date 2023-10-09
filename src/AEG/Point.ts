/**
 * Class that defines a Point.
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
     * Construct a new point at the given coordinates.
     * If no coordinates specified, default them to 0.
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
     * Method that returns a string representation of the point.
     * @returns The coordinates of the point.
     */
    public toString(): string {
        return "X: " + this.x + ", Y: " + this.y;
    }
}
