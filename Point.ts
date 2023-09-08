/**
 * Class for a Point
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
    constructor (coordX?: number, coordY?: number) {
        this.x = coordX ?? 0;
        this.y = coordY ?? 0;
    }

    /**
     * Accessor to get the x coordinate of this point.
     * @returns  The x coordinate of this point.
     */
    public getX() : number {
        return this.x;
    }

    /**
     * Modifier to set the x coordinate of this point.
     * @param newX The value to be set as the x coordinate of this point.
     */
    public setX(newX : number) : void {
        this.x = newX;
    }

    /**
     * Accessor to get the y coordinate of this point.
     * @returns  The y coordinate of this point.
     */
    public getY() : number {
        return this.y;
    }

    /**
     * Modifier to set the y coordinate of this point.
     * @param newY The value to be set as the y coordinate of this point.
     */
    public setY(newY : number) : void {
        this.y = newY;
    }

    /**
     * Returns a string representation of the point
     * @returns The coordinates of the point
     */
    toString(): string {
        return("X: " + this.x + ", Y: " + this.y);
    }
    
}