import {Ellipse} from "./Ellipse";
import {Point} from "./Point";

/**
 * Defines a rectangle.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 */
export class Rectangle {
    /**
     * The starting (top left) vertex of this Rectangle.
     */
    startVertex: Point;

    /**
     * The width of this Rectangle.
     */
    width: number;

    /**
     * The height of this Rectangle.
     */
    height: number;

    /**
     * Constructs a rectangle using the given points and lengths.
     * If no Point specified, default startVertex to (0, 0).
     * @param vertex The starting point of the rectangle.
     * @param w The width of the rectangle.
     * @param h The height of the rectangle.
     */
    public constructor(vertex: Point | null, w: number, h: number) {
        if (!Number.isFinite(w) || !Number.isFinite(h)) {
            throw new Error(
                "Infinity/NaN passed in for width/height while constructing a Rectangle."
            );
        } else if (w <= 0) {
            throw new Error("Nonpositive value passed for width while constructing a Rectangle.");
        } else if (h <= 0) {
            throw new Error("Nonpositive value passed for height while constructing a Rectangle.");
        }
        this.startVertex = vertex ?? new Point(0, 0);
        this.width = w;
        this.height = h;
    }

    /**
     * Creates a Point array of
     * the corners of the rectangle in clockwise order, starting from the top left.
     * vertices[0] = Top left vertex.
     * vertices[1] = Top Right vertex.
     * vertices[2] = Bottom Right vertex.
     * vertices[3] = Bottom Left vertex.
     * @returns The bounding box of the rectangle in Point array form.
     */
    public getCorners(): Point[] {
        const vertices: Point[] = [this.startVertex];
        vertices.push(new Point(this.startVertex.x + this.width, this.startVertex.y));
        vertices.push(new Point(this.startVertex.x + this.width, this.startVertex.y + this.height));
        vertices.push(new Point(this.startVertex.x, this.startVertex.y + this.height));

        return vertices;
    }

    /**
     * Checks whether the incoming Point is inside this Rectangle.
     * @param otherPoint Point that may be inside this Rectangle.
     * @returns True, if the Point is contained within this Rectangle.
     */
    public containsPoint(otherPoint: Point): boolean {
        const thisCorners = this.getCorners();

        return (
            thisCorners[0].x <= otherPoint.x &&
            thisCorners[1].x >= otherPoint.x &&
            thisCorners[1].y <= otherPoint.y &&
            thisCorners[2].y >= otherPoint.y
        );
    }

    /**
     * Checks whether there is an overlap between this Rectangle and another shape.
     * @param otherShape The other shape that may overlap this Rectangle.
     * @returns True, if there is an overlap.
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        if (otherShape instanceof Rectangle) {
            const thisCorners = this.getCorners();
            const otherCorners = otherShape.getCorners();

            //Overlap occurs if either of the corners of either shape are within the other
            for (let i = 0; i < 4; i++) {
                if (
                    this.containsPoint(otherCorners[i]) ||
                    otherShape.containsPoint(thisCorners[i])
                ) {
                    return true;
                }
            }
            return false;
        } else {
            //const ellipseBoundary = (otherShape as Ellipse).boundingBox;
            //return this.overlaps(ellipseBoundary);
            for (let i = 0; i < 4; i++) {
                if ((otherShape as Ellipse).containsPoint(this.getCorners()[i])) {
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * Checks whether another shape is contained within this Rectangle.
     * @param otherShape The shape that may be within this Rectangle.
     * @returns True, if the shape is within this Rectangle.
     */
    public containsShape(otherShape: Rectangle | Ellipse): boolean {
        if (otherShape instanceof Rectangle) {
            const otherCorners = otherShape.getCorners();

            //Other rectangle is within this rectangle if its opposite corners are within
            return this.containsPoint(otherCorners[0]) && this.containsPoint(otherCorners[2]);
        } else {
            //Check if the coordinates of the ellipse along the axes are within the rectangle.
            //If they are within, it means that all other points along the curve of the ellipse
            //are also within the rectangle.
            for (let i = 0; i < 4; i++) {
                if (!this.containsPoint((otherShape as Ellipse).getWidestCoordinates()[i])) {
                    return false;
                }
            }
            return true;
        }
    }

    /**
     * Returns a string representation of this Rectangle.
     * @returns This Rectangle in string form.
     */
    public toString(): string {
        return (
            "Rectangle with top left vertex at: " +
            this.startVertex.toString() +
            ", w: " +
            this.width +
            ", h: " +
            this.height
        );
    }
}
