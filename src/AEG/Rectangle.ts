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
     * Checks whether there is an overlap between this rectangle and another shape.
     * @param otherShape The other shape that might be overlapping this rectangle.
     * @returns True, if there is an overlap. Else, false.
     * @todo This method is wrong, the ellipse overlap portion functions as a contains or overlaps
     *       it should be replaced to just handle overlaps and not return true on contains. -James
     * @todo this is basically the exact same method that needs to be implemented for
     *       Ellipse.overlaps, the implementations should be merged into a single helper function,
     *       which is called by both methods. -James
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        if (otherShape instanceof Rectangle) {
            return this.edgesOverlap(otherShape);
        } else if (otherShape instanceof Ellipse) {
            for (let i = 0; i < 4; i++) {
                if (otherShape.containsPoint(this.getCorners()[i])) {
                    return true;
                }
            }
            return false;
        } else {
            throw Error("Invalid Shape passed to overlaps, must be a Rectangle | Ellipse");
        }
    }

    /**
     * Method that checks if any edges of this rectangle overlap with the other rectangle.
     * @param otherRect The other rectangle to be checked.
     * @returns True, if edges overlap. Else, false.
     * @todo This algo can and should be simplified to be less than 10 lines of code. -James-Oswald
     */
    private edgesOverlap(otherRect: Rectangle): boolean {
        const thisCorners = this.getCorners();
        const otherCorners = otherRect.getCorners();

        if (thisCorners[0].y <= otherCorners[0].y && thisCorners[2].y >= otherCorners[0].y) {
            //The top edge of the other rectangle is within the horizontal boundaries
            //of this rectangle
            if (thisCorners[0].x <= otherCorners[0].x && thisCorners[1].x >= otherCorners[0].x) {
                //The left edge of the other rectangle is within the vertical boundaries
                //of this rectangle
                return true;
            } else if (
                //The left edge of this rectangle is within the vertical boundaries
                //of the other rectangle
                otherCorners[0].x <= thisCorners[0].x &&
                otherCorners[1].x >= thisCorners[0].x
            ) {
                return true;
            } else if (
                //The right edge of the other rectangle is within the vertical boundaries
                //of this rectangle
                thisCorners[0].x <= otherCorners[1].x &&
                thisCorners[1].x >= otherCorners[1].x
            ) {
                return true;
            } else if (
                //The right edge of this rectangle is within the vertical boundaries
                //of the other rectangle
                otherCorners[0].x <= thisCorners[1].x &&
                otherCorners[1].x >= thisCorners[1].x
            ) {
                return true;
            }

            return false;
        } else if (otherCorners[0].y <= thisCorners[0].y && otherCorners[2].y >= thisCorners[0].y) {
            //The top edge of this rectangle is within the horizontal boundaries
            //of the other rectangle
            if (thisCorners[0].x <= otherCorners[0].x && thisCorners[1].x >= otherCorners[0].x) {
                //The left edge of the other rectangle is within the vertical boundaries
                //of this rectangle
                return true;
            } else if (
                //The left edge of this rectangle is within the vertical boundaries
                //of the other rectangle
                otherCorners[0].x <= thisCorners[0].x &&
                otherCorners[1].x >= thisCorners[0].x
            ) {
                return true;
            } else if (
                //The right edge of the other rectangle is within the vertical boundaries
                //of this rectangle
                thisCorners[0].x <= otherCorners[1].x &&
                thisCorners[1].x >= otherCorners[1].x
            ) {
                return true;
            } else if (
                //The right edge of this rectangle is within the vertical boundaries
                //of the other rectangle
                otherCorners[0].x <= thisCorners[1].x &&
                otherCorners[1].x >= thisCorners[1].x
            ) {
                return true;
            }

            return false;
        } else if (thisCorners[0].y <= otherCorners[2].y && thisCorners[2].y >= otherCorners[2].y) {
            //The bottom edge of the other rectangle is within the horizontal boundaries
            //of this rectangle
            if (thisCorners[0].x <= otherCorners[0].x && thisCorners[1].x >= otherCorners[0].x) {
                //The left edge of the other rectangle is within the vertical boundaries
                //of this rectangle
                return true;
            } else if (
                //The left edge of this rectangle is within the vertical boundaries
                //of the other rectangle
                otherCorners[0].x <= thisCorners[0].x &&
                otherCorners[1].x >= thisCorners[0].x
            ) {
                return true;
            } else if (
                //The right edge of the other rectangle is within the vertical boundaries
                //of this rectangle
                thisCorners[0].x <= otherCorners[1].x &&
                thisCorners[1].x >= otherCorners[1].x
            ) {
                return true;
            } else if (
                //The right edge of this rectangle is within the vertical boundaries
                //of the other rectangle
                otherCorners[0].x <= thisCorners[1].x &&
                otherCorners[1].x >= thisCorners[1].x
            ) {
                return true;
            }

            return false;
        } else if (otherCorners[0].y <= thisCorners[2].y && otherCorners[2].y >= thisCorners[2].y) {
            //The bottom edge of this rectangle is within the horizontal boundaries
            //of the other rectangle
            if (thisCorners[0].x <= otherCorners[0].x && thisCorners[1].x >= otherCorners[0].x) {
                //The left edge of the other rectangle is within the vertical boundaries
                //of this rectangle
                return true;
            } else if (
                //The left edge of this rectangle is within the vertical boundaries
                //of the other rectangle
                otherCorners[0].x <= thisCorners[0].x &&
                otherCorners[1].x >= thisCorners[0].x
            ) {
                return true;
            } else if (
                //The right edge of the other rectangle is within the vertical boundaries
                //of this rectangle
                thisCorners[0].x <= otherCorners[1].x &&
                thisCorners[1].x >= otherCorners[1].x
            ) {
                return true;
            } else if (
                //The right edge of this rectangle is within the vertical boundaries
                //of the other rectangle
                otherCorners[0].x <= thisCorners[1].x &&
                otherCorners[1].x >= thisCorners[1].x
            ) {
                return true;
            }

            return false;
        }

        return false;
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
