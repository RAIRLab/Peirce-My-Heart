import {Ellipse} from "./Ellipse";
import {Point} from "./Point";
import {shapesOverlaps, shapeContains, pointInRect} from "./AEGUtils";

/**
 * Class that defines a Rectangle.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 */
export class Rectangle {
    /**
     * The starting (top left) vertex of the rectangle.
     */
    startVertex: Point;

    /**
     * The width of the rectangle.
     */
    width: number;

    /**
     * The height of the rectangle.
     */
    height: number;

    /**
     * Construct a rectangle using the given points and lengths.
     * If no values specified, default them to 0.
     * @param vertex The starting point of the rectangle.
     * @param w The width of the rectangle.
     * @param h The height of the rectangle.
     */
    public constructor(vertex?: Point, w?: number, h?: number) {
        this.startVertex = vertex ?? new Point();
        this.width = w ?? 0;
        this.height = h ?? 0;
    }

    /**
     * The corners of the rectangle in clockwise order, starting from the top left.
     * 0 = Top left vertex.
     * 1 = Top Right vertex.
     * 2 = Bottom Right vertex.
     * 3 = Bottom Left vertex.
     * @returns The bounding box of the rectangle.
     */
    public getCorners(): Point[] {
        //0 = top left vertex
        const vertices: Point[] = [this.startVertex];
        //1 = top right vertex
        vertices.push(new Point(this.startVertex.x + this.width, this.startVertex.y));
        //2 = bottom right vertex
        vertices.push(new Point(this.startVertex.x + this.width, this.startVertex.y + this.height));
        //3 = bottom left vertex
        vertices.push(new Point(this.startVertex.x, this.startVertex.y + this.height));

        return vertices;
    }

    /**
     * Method that checks whether there is a point inside the given rectangle.
     * @param otherPoint The point that might be inside this rectangle.
     * @returns True, if the point is completely inside the rectangle. Else, false.
     */
    public containsPoint(point: Point): boolean {
        return pointInRect(this, point);
    }

    /**
     * Method that checks whether there is an overlap between this rectangle and another shape.
     * @param otherShape The other shape that might be overlapping this rectangle.
     * @returns True, if there is an overlap. Else, false.
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        return shapesOverlaps(this, otherShape);
    }

    /**
     * Method that checks whether another shape is within this rectangle.
     * @param otherShape The shape that might be within this rectangle.
     * @returns True, if the shape is within this rectangle. Else, false.
     */
    public contains(otherShape: Rectangle | Ellipse): boolean {
        return shapeContains(this, otherShape);
    }

    /**
     * Method that returns a string representation of the rectangle.
     * @returns The coordinates and lengths for the rectangle.
     */
    public toString(): string {
        return (
            "A rectangle with\nTop Left Vertex at: " +
            this.startVertex.toString() +
            ", " +
            "Width: " +
            this.width +
            ", " +
            "Height: " +
            this.height
        );
    }
}
