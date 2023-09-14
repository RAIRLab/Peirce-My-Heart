import { Ellipse } from "./Ellipse";
import { Point } from "./Point";

/**
 * Class that defines a Rectangle
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
        this.height = w ?? 0;
    }

    /**
     * Method that returns a string representation of the rectangle
     * @returns The coordinates and lengths for the rectangle
     */
    public toString(): string {
        return("A rectangle with\nTop Left Vertex at: " + this.startVertex.toString + ", \n" +
        "Width of: " + this.width + ", \n" + 
        "Height of: " + this.height);
    }

    /**
     * The bounding box of the rectangle is represented by its 4 corners.
     * @returns The boudning box of the rectangle.
     */
    public getBoundingBox() : Point[] {
        //0 = top left vertex
        let vertices : Point[] = [this.startVertex];
        //1 = top right vertex
        vertices.push(new Point(this.startVertex.x + this.width, this.startVertex.y));
        //2 = bottom left vertex
        vertices.push(new Point(this.startVertex.x, this.startVertex.y + this.height));
        //3 = bottom right vertex
        vertices.push(new Point(this.startVertex.x + this.width, this.startVertex.y + this.height))

        return vertices;
    }

    /**
     * Method that checks if another rectangle is within the horizontal boundaries of this rectangle.
     * @param otherRect The other rectangle to be checked.
     * @returns True, if the other rectangle is within the horizontal boundaries of this rectangle. Else, false
     */
    public overlapsHorizontal(otherRect: Rectangle) : boolean {
        /**
         * The other rectangle is overlapping the horizontal boundaries of this rectangle if:
         * The other rectangle is on the right of this rectangle AND
         * The other rectangle's left edge is on the left of rectangle's right edge
         */
        if((this.startVertex.x <= otherRect.startVertex.x) && (this.getBoundingBox()[1].x >= otherRect.getBoundingBox()[0].x)) {
            return true;

        } 
        
        /**
         * OR
         * This other rectangle is on the left of this rectangle AND
         * The other rectangle's right edge is on the left of rectangle's left edge
         */
        else if((this.getBoundingBox()[1].x >= otherRect.getBoundingBox()[1].x) && (this.startVertex.x <= otherRect.getBoundingBox()[1].x)) {
            return true;

        } else {
            return false;
        }
    }

    /**
     * Method that checks if another rectangle is within the vertical boundaries of this rectangle.
     * @param otherRect The other rectangle to be checked.
     * @returns True, if the other rectangle is within the vertical boundaries of this rectangle. Else, false.
     */
    public overlapsVertical(otherRect: Rectangle) : boolean {
        /**
         * The other rectangle is overlapping the vertical boundaries of this rectangle if:
         * The other rectangle is above this rectangle AND
         * The other rectangle's bottom edge is below this rectangle's top edge
         */
        if((this.getBoundingBox()[2].y >= otherRect.getBoundingBox()[2].y) && 
        (this.getBoundingBox()[0].y <= otherRect.getBoundingBox()[2].y )){
            return true;

        }

        /**
         * OR
         * The other rectangle is below this rectangle AND
         * The other rectangle's top edge is above this rectangles bottom edge
         */
        else if ((this.startVertex.y <= otherRect.startVertex.y) && 
        (this.getBoundingBox()[2].y >= otherRect.getBoundingBox()[0].y)) {
            return true;

        } else {
            return false;
        }
    }

    /**
     * Method that checks whether this rectangle is colliding with another rectangle.
     * @param otherRect The other rectangle it might be colliding with.
     * @returns True, if the other rectagle is colliding with this rectangle. Else, false.
     */
    public onRectOverlap(otherRect: Rectangle) : boolean {
        return((this.overlapsHorizontal(otherRect) && this.overlapsVertical(otherRect)));
    }

    /**
     * Method that checks whether this rectangle is colliding with an ellipse.
     * @param otherEllipse The ellipse it might be colliding with.
     * @returns True, if the ellipse is colliding with this rectangle. Else, false.
     */
    public onEllipseOverlap(otherEllipse: Ellipse) : boolean {
        return(this.onRectOverlap(otherEllipse.boundingBox));
    }

    /**
     * Method that checks whether there is a point inside this rectangle.
     * @param otherPoint The point that might be inside this rectangle.
     * @returns True, if the point is completely inside the rectangle. Else, false.
     */
    public pointWithinThis(otherPoint: Point) : boolean {
        if((this.getBoundingBox()[0].x <= otherPoint.x) && 
        (this.getBoundingBox()[1].x >= otherPoint.x) &&
        (this.getBoundingBox()[0].y <= otherPoint.y &&
        (this.getBoundingBox()[2].y >= otherPoint.y))) {
            return true;
        }

        return false;
    }

    /**
     * Method that checks whether there is a rectangle inside this rectangle.
     * @param otherRect The other rectanlge that might be inside this rectangle.
     * @returns True, if the other rectangle is completely inside this rectangle. Else, false.
     */
    public rectWithinThis(otherRect: Rectangle) : boolean {
        //Check if all the vertices of the other rectangle are within this rectangle
        (otherRect.getBoundingBox()).forEach(vertex => {
            if(!(this.pointWithinThis(vertex))) {
                return false
            }
        });

        return true;
    }

    /**
     * Method that checks whether there is an ellipse inside this rectangle.
     * @param otherEllipse The ellipse that might be inside this rectangle.
     * @returns True, if the ellipse is completely inside this rectangle. Else, false.
     */
    public ellipseWithinThis(otherEllipse: Ellipse) : boolean {
        return(this.rectWithinThis(otherEllipse.boundingBox));
    }
}