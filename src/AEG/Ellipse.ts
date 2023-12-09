import {Point} from "./Point";
import {Rectangle} from "./Rectangle";
import {shapesOverlap, shapeContains, signedDistanceFromEllipse} from "./AEGUtils";

/**
 * Defines an Ellipse.
 *
 * @author Ryan Reilly
 * @author Anusha Tiwari
 */
export class Ellipse {
    /**
     * Center of this Ellipse.
     */
    center: Point;

    /**
     * Horizontal radius of this Ellipse.
     */
    radiusX: number;

    /**
     * Vertical radius of this Ellipse.
     */
    radiusY: number;

    /**
     * Bounding box of this Ellipse.
     */
    boundingBox: Rectangle;

    /**
     * Creates an Ellipse using the incoming Points and radii.
     * @param center Incoming center point of this Ellipse.
     * @param radX Incoming horizontal radius of this Ellipse.
     * @param radY Incoming vertical radius of this Ellipse.
     * @throws Errors on NaN, Infinity, and negative radii lengths.
     */
    public constructor(center: Point, radX: number, radY: number) {
        this.center = center;
        this.radiusX = radX;
        this.radiusY = radY;

        if (!Number.isFinite(this.radiusX) || !Number.isFinite(this.radiusY)) {
            throw new Error("A radius passed into an Ellipse construction was NaN or Infinity.");
        } else if (this.radiusX !== undefined && this.radiusX < 0) {
            throw new Error("Horizontal radius in an Ellipse construction was negative.");
        } else if (this.radiusY !== undefined && this.radiusY < 0) {
            throw new Error("Vertical radius in an Ellipse construction was negative.");
        }

        const boundingVertex: Point = new Point(
            this.center.x - this.radiusX,
            this.center.y - this.radiusY
        );
        this.boundingBox = new Rectangle(boundingVertex, this.radiusX * 2, this.radiusY * 2);
    }

    /**
     * Checks whether a Point is contained within this Ellipse.
     * @param point Point that may be contained within this Ellipse.
     * @returns True if the Point is contained within this Ellipse.
     */
    public containsPoint(point: Point): boolean {
        return signedDistanceFromEllipse(this, point) < 0;
    }

    /**
     * Checks whether this Ellipse overlaps some other shape.
     * @param otherShape Other shape that this Ellipse may overlap.
     * @returns True if there is an overlap.
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        return shapesOverlap(this, otherShape);
    }

    /**
     * Checks whether some other other shape is contained within this Ellipse.
     * @param otherShape Shape that may be contained within this Ellipse.
     * @returns True if the shape is contained within this Ellipse.
     */
    public contains(otherShape: Rectangle | Ellipse): boolean {
        return shapeContains(this, otherShape);
    }

    /**
     * Creates and returns the string representation of this Ellipse.
     * @returns Coordinates and radii for this Ellipse in string form.
     */
    public toString(): string {
        return (
            "An ellipse with Center at: " +
            this.center.toString() +
            ", Horizontal radius: " +
            this.radiusX +
            ", Vertical radius: " +
            this.radiusY +
            ", Bounding box: " +
            this.boundingBox.toString()
        );
    }
}
