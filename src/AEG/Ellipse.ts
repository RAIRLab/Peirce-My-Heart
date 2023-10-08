import {Point} from "./Point";
import {Rectangle} from "./Rectangle";
//import {Polynomial, polynomialRoots} from "nomial";

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
     * Method that checks whether a point is within this ellipse.
     * @param otherPoint The point that might be inside this ellipse.
     * @returns True, if the point is inside this ellipse. Else, false
     */
    public containsPoint(otherPoint: Point): boolean {
        //(x-h)^2/rx^2 + (y-k)^2/ry^2 <= 1
        //(x, y) = new point
        //(h, k) = center

        const p: number = Math.round(
            Math.pow(otherPoint.x - this.center.x, 2) / Math.pow(this.radiusX, 2) +
                Math.pow(otherPoint.y - this.center.y, 2) / Math.pow(this.radiusY, 2)
        );

        return p <= 1;

        //Method 2: scaling eclipse to check for containment
        /* const scale_y = this.radiusX / this.radiusY;
        const dx = otherPoint.x - this.center.x;
        const dy = (otherPoint.y - this.center.y) * scale_y;

        return Math.pow(dx, 2) + Math.pow(dy, 2) <= Math.pow(this.radiusX, 2); */
    }

    /**
     * Method that checks whether there is an overlap between this ellipse and another shape.
     * @param otherShape The other shape that might be overlapping this ellipse.
     * @returns True, if there is an overlap. Else, false.
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        //return this.boundingBox.overlaps(otherShape);
        if (otherShape instanceof Rectangle) {
            for (let i = 0; i < 4; i++) {
                if (this.containsPoint(otherShape.getCorners()[i])) {
                    return true;
                }
            }

            return false;
        } else {
            //check if the rectangular bounding boxes of the ellipse overlap
            if (this.boundingBox.overlaps((otherShape as Ellipse).boundingBox)) {
                console.log("ellipse boxes overlap");
                return true;
                //if there is an overlap, check if points along the ellipse curve overlap
                //this can be done by checking if points along the curve of the other ellipse
                //are within this ellipse
                //return this.checkQuadrantOverlap(otherShape);
            }
            return false;
        }
    }

    /**
     * Method that checks whether another shape is within this ellipse.
     * @param otherShape The shape that might be within this ellipse.
     * @returns True, if the shape is within this ellipse. Else, false.
     */
    public containsShape(otherShape: Rectangle | Ellipse): boolean {
        if (otherShape instanceof Rectangle) {
            for (let i = 0; i < 4; i++) {
                if (!this.containsPoint(otherShape.getCorners()[i])) {
                    return false;
                }
            }
            return true;
        } else if (otherShape instanceof Ellipse) {
            //If all the widest coordinates of the other ellipse are within this ellipse,
            //This ellipse contains the other ellipse
            const points = otherShape.getWidestCoordinates();
            for (let j = 0; j < 4; j++) {
                if (!this.containsPoint(points[j])) {
                    return false;
                }
            }
            return true;
        }
        throw Error("Invalid Shape passed to containsShape, must be a Rectangle | Ellipse");
    }

    /**
     * Method that checks if any quadrant of another ellipse overlaps with this ellipse.
     * This can be done by checking if a point on the curve of the ellipse is within this ellipse.
     * @param otherEllipse The other ellipse that might be overlapping with this ellipse
     * @returns True, if there is an overlap. Else, false
     */
    private checkQuadrantOverlap(otherEllipse: Ellipse): boolean {
        //Get the quadrant which might be overlapping with this ellipse.
        //To do so, check which corner of the rectangular bounding box of the other ellipse
        //is within this ellipse.
        for (let i = 0; i < 4; i++) {
            if (this.containsPoint(otherEllipse.boundingBox.getCorners()[i])) {
                //Get the points on the curve of the ellipse in that quadrant
                const points: Point[] = otherEllipse.getQuadrantPoints(i);

                console.log("has corner " + i);
                //If any points along the curve are within this ellipse, the other ellipse overlaps
                //with this ellipse. Return true.
                for (let j = 0; j < 6; j++) {
                    if (this.containsPoint(points[j])) {
                        console.log("Has overlap");
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * An array containing the widest coordinates of the ellipse, i.e. the coordinates along the
     * x-axis and y-axis of the ellipse.
     * The coordinates are in clockwise order such that:
     * 0 - Top most coordinate (Top along y-axis).
     * 1 - Right most coordinate (Right along x-axis).
     * 2 - Bottom most coordinate (Bottom along y-axis).
     * 3 - Left most coordinate (Left along x-axis).
     * @returns
     */
    public getWidestCoordinates(): Point[] {
        return [
            new Point(this.center.x, this.center.y - this.radiusY),
            new Point(this.center.x + this.radiusX, this.center.y),
            new Point(this.center.x, this.center.y + this.radiusY),
            new Point(this.center.x - this.radiusX, this.center.y),
        ];
    }

    /**
     * Method that returns the points on the curve of the ellipse in a specific quadrant
     * @param quadrant The quadrant which we want the points in
     * @returns An array of points along the curve of the ellipse
     */
    private getQuadrantPoints(quadrant: number): Point[] {
        //==========DEBUGGG=========
        console.log("Getting points for: " + this + "\n" + "In quad: " + quadrant);

        const points: Point[] = [];
        const quadDistance = this.radiusX;
        let curve = 1;

        if (quadrant === 0) {
            //top left quadrant
            points[0] = this.getWidestCoordinates()[3];
            points[1] = this.getWidestCoordinates()[0];
        } else if (quadrant === 1) {
            //top right quadrant
            points[0] = this.getWidestCoordinates()[0];
            points[1] = this.getWidestCoordinates()[1];
        } else if (quadrant === 2) {
            //bottom right quadrant
            points[0] = this.getWidestCoordinates()[1];
            points[1] = this.getWidestCoordinates()[2];

            curve = -1;
        } else if (quadrant === 3) {
            //bottom left quadrant
            points[0] = this.getWidestCoordinates()[2];
            points[1] = this.getWidestCoordinates()[3];

            curve = -1;
        }

        for (let i = 2; i < 6; i++) {
            let x = points[0].x;
            if (curve === 1) {
                x = x + (i - 1) * (quadDistance / 5);
            } else {
                x = x - (i - 1) * (quadDistance / 5);
            }
            const y = this.getCurvePoint(x, curve);
            points[i] = new Point(x, y);
        }

        //========DEBUGGGG========
        console.log(points);
        return points;
    }

    /**
     * Method that returns a point on the curve of the ellipse for a given x coordinate
     * @param x The x coordinate of the point
     * @param curveHalf Flag signifying the curve of the ellipse.
     * 1 for top curve, -1 for bottom curve
     * @returns A point along the curve
     */
    private getCurvePoint(x: number, curveHalf: number): number {
        return (
            curveHalf *
                this.radiusY *
                Math.sqrt(1 - Math.pow((x - this.center.x) / this.radiusX, 2)) +
            this.center.y
        );
    }
}
