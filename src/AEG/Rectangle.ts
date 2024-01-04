/**
 * Defines a Rectangle.
 *
 * @author Ryan R
 * @author Anusha Tiwari
 */

import {Ellipse} from "./Ellipse";
import {Point} from "./Point";
import {pointInRect, shapeContains, shapesOverlap} from "./AEGUtils";

export class Rectangle {
    /**
     * Starting (top left) vertex of this Rectangle.
     */
    startVertex: Point;

    /**
     * Width of this Rectangle.
     */
    width: number;

    /**
     * Height of this Rectangle.
     */
    height: number;

    /**
     * Creates a Rectangle using the incoming Points and lengths.
     * @param vertex Incoming starting Point of this Rectangle.
     * @param w Incoming width of the rectangle.
     * @param h Incoming height of the rectangle.
     */
    public constructor(vertex: Point, w: number, h: number) {
        if (!Number.isFinite(w) || !Number.isFinite(h)) {
            throw new Error(
                "Infinity/NaN passed in for width/height while constructing a Rectangle."
            );
        } else if (w !== undefined && w < 0) {
            throw new Error("Negative value passed for width while constructing a Rectangle.");
        } else if (h !== undefined && h < 0) {
            throw new Error("Negative value passed for height while constructing a Rectangle.");
        }
        this.startVertex = vertex;
        this.width = w;
        this.height = h;
    }

    /**
     * Creates a Point array of
     * the corners of this Rectangle in clockwise order, starting from the top left.
     * vertices[0] = Top left vertex.
     * vertices[1] = Top right vertex.
     * vertices[2] = Bottom right vertex.
     * vertices[3] = Bottom left vertex.
     * @returns Bounding box of this Rectangle in Point array form.
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
     * Checks whether there is an overlap between this Rectangle and some other shape.
     * @param otherShape Other shape that this Rectangle may overlap.
     * @returns True if there is an overlap.
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        return shapesOverlap(this, otherShape);
    }

    /**
     * Checks whether another shape is contained within this Rectangle.
     * @param otherShape Shape that may be contained within this Rectangle.
     * @returns True if the shape is contained within this Rectangle.
     */
    public contains(otherShape: Rectangle | Ellipse): boolean {
        return shapeContains(this, otherShape);
    }

    /**
     * Creates and returns a string representation of this Rectangle.
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
