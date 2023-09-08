import { Point } from "./Point";

export class Ellipse {
    
    /**
     * The center of the ellipse.
     */
    private center: Point;

    /**
     * The horizontal radius of the ellipse.
     */
    private radiusX: number;

    /**
     * The vertical radius of the ellipse.
     */
    private radiusY: number;

    /**
     * Construct an ellipse using the given points and radii.
     * If no values specified, default them to 0.
     * @param center The center point of the ellipse.
     * @param radX The horizontal radius of the ellipse.
     * @param radY The vertical radius of the ellipse.
     */
    constructor(center?: Point, radX?: number, radY?: number) {
        this.center = center ?? new Point();
        this.radiusX = radX ?? 0;
        this.radiusY = radY ?? 0;
    }

    /**
     * Accessor to get the center point of this ellipse.
     * @returns The center point of this ellipse.
     */
    public getCenter() : Point {
        return this.center;
    }

    /**
     * Modifier to set the center point of this ellipse.
     * @param newCenter The point to be set as the new center of this ellipse.
     */
    public setCenter(newCenter: Point) : void {
        this.center = newCenter
    }

    /**
     * Accessor to get the horizontal radius of this ellipse.
     * @returns The horizontal radius of this ellipse.
     */
    public getHorizontalRadius() : number {
        return this.radiusX;
    }

    /**
     * Modifier to set the horizontal radius of this ellipse.
     * @param newCenter The length to be set as the new horizontal radius of this ellipse.
     */
    public setHorizontalRadius(newRadX: number) : void {
        this.radiusX = newRadX;
    }

    /**
     * Accessor to get the vertical radius of this ellipse.
     * @returns The vertical radius of this ellipse.
     */
    public getVerticalRadius() : number {
        return this.radiusY;
    }

    /**
     * Modifier to set the vertical radius of this ellipse.
     * @param newCenter The length to be set as the new vertical radius of this ellipse.
     */
    public setVerticalRadius(newRadY: number) : void {
        this.radiusY = newRadY
    }

    /**
     * Returns the string representation of an ellipse
     * @returns The coordinates and radii for the ellipse
     */
    toString(): string {
        return("An ellipse with\nCenter at: " + this.center.toString + ", \n" +
        "Horizontal Radius of: " + this.radiusX +", \n" +
        "Vertical Radius of: " + this.radiusY);
    }
}