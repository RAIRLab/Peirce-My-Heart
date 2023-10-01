import {Point} from "./Point";
import {Rectangle} from "./Rectangle";
import {Polynomial, polynomialRoots} from "nomial";

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
            "An ellipse with\nCenter at: " +
            this.center.toString() +
            ", \n" +
            "Horizontal Radius of: " +
            this.radiusX +
            ", \n" +
            "Vertical Radius of: " +
            this.radiusY
        );
    }

    /**
     * Method that checks whether a point is within this ellipse.
     * @param otherPoint The point that might be inside this ellipse.
     * @returns True, if the point is inside this ellipse. Else, false
     */
    public containsPoint(otherPoint: Point): boolean {
        //ELLIPSE TO BE IMPLEMENTED ACCURATELY
        //return this.boundingBox.containsPoint(otherPoint);
        return false;
    }

    /**
     * Method that checks whether there is an overlap between this ellipse and another shape.
     * @param otherShape The other shape that might be overlapping this ellipse.
     * @returns True, if there is an overlap. Else, false.
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        //ELLIPSE TO BE IMPLEMENTED ACCURATELY
        //return this.boundingBox.overlaps(otherShape);

        if (otherShape instanceof Ellipse) {
            return this.overlapsEllipse(otherShape as Ellipse);
        } else {
            return false;
        }
    }

    /**
     * Method that checks whether another shape is within this ellipse.
     * @param otherShape The shape that might be within this ellipse.
     * @returns True, if the shape is within this ellipse. Else, false.
     */
    public containsShape(otherShape: Rectangle | Ellipse): boolean {
        //ELLIPSE TO BE IMPLEMENTED ACCURATELY
        //this.boundingBox.containsShape(otherShape);
        return false;
    }

    public overlapsEllipse(otherEllipse: Ellipse): boolean {
        const roots: number[] = this.getQuarticEquation(otherEllipse);

        //Overlap happens if roots are real
        if (roots.length > 0) {
            //real roots exist - there is overlap
            return true;
        }

        return false;
    }

    private getQuarticEquation(otherEllipse: Ellipse): number[] {
        const a1: number =
            (1 / Math.pow(this.radiusX, 2)) *
                (Math.pow(this.radiusY, 2) / Math.pow(otherEllipse.radiusY, 2)) -
            1 / Math.pow(otherEllipse.radiusX, 2);

        const b1: number =
            -((2 * this.center.x) / Math.pow(this.radiusX, 2)) *
                (Math.pow(this.radiusY, 2) / Math.pow(otherEllipse.radiusY, 2)) +
            (2 * otherEllipse.center.x) / Math.pow(otherEllipse.radiusX, 2);

        const c1: number =
            -(Math.pow(this.radiusY, 2) / Math.pow(otherEllipse.radiusY, 2)) +
            (1 / Math.pow(this.radiusX, 2)) *
                (Math.pow(this.radiusY, 2) / Math.pow(otherEllipse.radiusY, 2)) *
                Math.pow(this.center.x, 2) -
            Math.pow(this.center.y - otherEllipse.center.y, 2) / Math.pow(otherEllipse.radiusY, 2) -
            Math.pow(otherEllipse.center.x, 2) / Math.pow(otherEllipse.radiusX, 2) +
            1;

        const c2: number =
            (4 * Math.pow(this.radiusY, 2) * Math.pow(this.center.y - otherEllipse.center.y, 2)) /
            Math.pow(otherEllipse.radiusY, 4);

        const a3: number = -(c2 / Math.pow(this.radiusX, 2));

        const b3: number = (2 * c2 * this.center.x) / Math.pow(this.radiusX, 2);

        const c3: number = -((c2 / Math.pow(this.radiusX, 2)) * Math.pow(this.center.x, 2)) + c2;

        const x4 = Math.pow(a1, 2);

        const x3 = 2 * b1 * a1;

        const x2 = 2 * a1 * c1 + Math.pow(b1, 2) - a3;

        const x = 2 * b1 * c1 - b3;

        const x0 = Math.pow(c1, 2) - c3;

        const f = new Polynomial([x0, x, x2, x3, x4]);

        //Find the real roots of the polynomial f
        //This polynomial shows the intersection of this ellipse with the other ellipse
        //Therefore, the start of the interval this root could be in is the leftmost x coordinate
        //of this ellipse. Similarly, the end of the interval is the rightmost x coordinate.
        return polynomialRoots(f, this.center.x - this.radiusX, this.center.x + this.radiusX);
    }
}
