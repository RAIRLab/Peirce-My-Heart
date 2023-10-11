import {Point} from "./Point";
import {Rectangle} from "./Rectangle";
import {shapesOverlap, shapeContains, pointInEllipse} from "./AEGUtils";

/**
 * Class that defines an Ellipse.
 * @author Anusha Tiwari
 * @author Ryan Reilly
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

        const boundingVertex: Point = new Point(
            this.center.x - this.radiusX,
            this.center.y - this.radiusY
        );
        this.boundingBox = new Rectangle(boundingVertex, this.radiusX * 2, this.radiusY * 2);
    }

    /**
     * Method that returns the string representation of an ellipse.
     * @returns The coordinates and radii for the ellipse.
     */
    public toString(): string {
        return (
            "An ellipse with Center at: " +
            this.center.toString() +
            ", \n" +
            "Horizontal Radius of: " +
            this.radiusX +
            ", \n" +
            "Vertical Radius of: " +
            this.radiusY +
            ", \n" +
            "Bounding box: " +
            this.boundingBox.toString()
        );
    }

    /**
     * Method that checks whether a point is within the given ellipse.
     * @param otherPoint The point that might be inside this ellipse.
     * @returns True, if the point is inside this ellipse. Else, false
     */
    public containsPoint(point: Point): boolean {
        return pointInEllipse(this, point);
    }

    /**
     * Method that checks whether there is an overlap between this ellipse and another shape.
     * @param otherShape The other shape that might be overlapping this ellipse.
     * @returns True, if there is an overlap. Else, false.
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        return shapesOverlap(this, otherShape);
    }

    /**
     * Method that checks whether another shape is within this ellipse.
     * @param otherShape The shape that might be within this ellipse.
     * @returns True, if the shape is within this ellipse. Else, false.
     */
    public contains(otherShape: Rectangle | Ellipse): boolean {
        return shapeContains(this, otherShape);
    }
}
