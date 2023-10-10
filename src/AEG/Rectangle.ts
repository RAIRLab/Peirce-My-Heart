import {Ellipse} from "./Ellipse";
import {Point} from "./Point";
import {shapesOverlaps, shapeContains, pointInRect} from "./AEGUtils";

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
    public constructor(vertex?: Point, w?: number, h?: number) {
        if (!Number.isFinite(w) || !Number.isFinite(h)) {
            throw new Error(
                "Infinity/NaN passed in for width/height while constructing a Rectangle."
            );
        } else if (w !== undefined && w < 0) {
            throw new Error("Negative value passed for width while constructing a Rectangle.");
        } else if (h !== undefined && h < 0) {
            throw new Error("Negative value passed for height while constructing a Rectangle.");
        }
        this.startVertex = vertex ?? new Point(0, 0);
        this.width = w ?? 0;
        this.height = h ?? 0;
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
     */
    public containsPoint(point: Point): boolean {
        return pointInRect(this, point);
    }

    /**
     * Checks whether there is an overlap between this rectangle and another shape.
     * @param otherShape The other shape that might be overlapping this rectangle.
     * @returns True, if there is an overlap. Else, false.
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        return shapesOverlaps(this, otherShape);
    }

    /**
     * Checks whether another shape is contained within this Rectangle.
     * @param otherShape The shape that may be within this Rectangle.
     * @returns True, if the shape is within this Rectangle.
     */
    public contains(otherShape: Rectangle | Ellipse): boolean {
        return shapeContains(this, otherShape);
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
