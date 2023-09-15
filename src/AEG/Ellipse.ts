import { Point } from "./Point";
import { Rectangle } from "./Rectangle";

/**
 * Class that defines an Ellipse
 */
export class Ellipse {
    
    /**
     * The center of the ellipse.
     */
    center: Point;

    /**
     * The horizontal radius of the ellipse.
     */
    radiusX: number;

    /**
     * The vertical radius of the ellipse.
     */
    radiusY: number;

    /**
     * The bounding box of the ellipse
     */
    boundingBox: Rectangle;

    /**
     * Construct an ellipse using the given points and radii.
     * If no values specified, default them to 0.
     * @param center The center point of the ellipse.
     * @param radX The horizontal radius of the ellipse.
     * @param radY The vertical radius of the ellipse.
     */
    public constructor(center?: Point, radX?: number, radY?: number) {
        this.center = center ?? new Point();
        this.radiusX = radX ?? 0;
        this.radiusY = radY ?? 0;

        let boundingVertex : Point = new Point((this.center.x - this.radiusX), (this.center.y - this.radiusY));
        this.boundingBox = new Rectangle(boundingVertex, (this.radiusX*2), (this.radiusY*2));
    }

    /**
     * Method that returns the string representation of an ellipse
     * @returns The coordinates and radii for the ellipse
     */
    public toString(): string {
        return("An ellipse with\nCenter at: " + this.center.toString + ", \n" +
        "Horizontal Radius of: " + this.radiusX +", \n" +
        "Vertical Radius of: " + this.radiusY);
    }

    /**
     * Method that checks whether this ellipse is colliding with a rectangle.
     * @param otherRect The rectangle it might be colliding with.
     * @returns True, if the rectagle is colliding with this ellipse. Else, false.
     */
    public onRectOverlap(otherRect: Rectangle) : boolean {
        return this.boundingBox.onRectOverlap(otherRect);
    }

    /**
     * Method that checks whether this ellipse is colliding with another ellipse.
     * @param otherEllipse The ellipse it might be colliding with.
     * @returns True, if the other ellipse is colliding with this ellipse. Else, false.
     */
    public onEllipseOverlap(otherEllipse: Ellipse) : boolean {
        return this.boundingBox.onEllipseOverlap(otherEllipse);
    }
    
}