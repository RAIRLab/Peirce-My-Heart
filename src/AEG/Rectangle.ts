import {Ellipse} from "./Ellipse";
import {Point} from "./Point";

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
    public constructor(vertex: Point, w: number, h: number) {
        this.startVertex = vertex;
        this.width = w;
        this.height = h;
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
     * Method that checks whether there is a point inside this rectangle.
     * @param otherPoint The point that might be inside this rectangle.
     * @returns True, if the point is completely inside the rectangle. Else, false.
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
     * Method that checks whether there is an overlap between this rectangle and another shape.
     * @param otherShape The other shape that might be overlapping this rectangle.
     * @returns True, if there is an overlap. Else, false.
     */
    public overlaps(otherShape: Rectangle | Ellipse): boolean {
        if (otherShape instanceof Rectangle) {
            if (
                this.checkHorizontalEdgeOverlap(otherShape) &&
                otherShape.checkVerticalEdgeOverlap(this)
            ) {
                return true;
            } else if (
                this.checkVerticalEdgeOverlap(otherShape) &&
                otherShape.checkHorizontalEdgeOverlap(this)
            ) {
                return true;
            }

            return false;
        } else {
            for (let i = 0; i < 4; i++) {
                if ((otherShape as Ellipse).containsPoint(this.getCorners()[i])) {
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * Checks if any of the horizontal edges of the other rectangle lie within the horizontal
     * boundaries of this rectangle
     * @param otherRect The other rectangle
     * @returns True, if the other edges lie within this boundary. Else, false
     */
    private checkHorizontalEdgeOverlap(otherRect: Rectangle): boolean {
        const thisCorners = this.getCorners();
        const otherCorners = otherRect.getCorners();

        if (thisCorners[0].y <= otherCorners[0].y && thisCorners[2].y >= otherCorners[0].y) {
            return true;
        } else if (thisCorners[0].y <= otherCorners[2].y && thisCorners[2].y >= otherCorners[2].y) {
            return true;
        }

        return false;
    }

    /**
     * Checks if any of the vertical edges of the other rectangle lie within the vertical
     * boundaries of this rectangle
     * @param otherRect The other rectangle
     * @returns True, if the other edges lie within this boundary. Else, false
     */
    private checkVerticalEdgeOverlap(otherRect: Rectangle): boolean {
        const thisCorners = this.getCorners();
        const otherCorners = otherRect.getCorners();

        if (thisCorners[0].x <= otherCorners[0].x && thisCorners[1].x >= otherCorners[0].x) {
            return true;
        } else if (thisCorners[0].x <= otherCorners[1].x && thisCorners[1].x >= otherCorners[1].x) {
            return true;
        }

        return false;
    }

    /**
     * Method that checks whether another shape is within this rectangle.
     * @param otherShape The shape that might be within this rectangle.
     * @returns True, if the shape is within this rectangle. Else, false.
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
