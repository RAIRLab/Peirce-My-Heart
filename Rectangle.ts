import { Ellipse } from "./Ellipse";
import { Point } from "./Point";

//James - Ideally id prefer all the leters to the same size and only allow cuts to be resized

export class Rectangle {

    /**
     * The starting (top left) vertex of the rectangle.
     */
    startVertex: Point;

    //bottom left

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
    constructor(vertex?: Point, w?: number, h?: number) {
        this.startVertex = vertex ?? new Point();
        this.width = w ?? 0;
        this.height = w ?? 0;
    }

    /**
     * Returns a string representation of the rectangle
     * @returns The coordinates and lengths for the rectangle
     */
    toString(): string {
        return("A rectangle with\nTop Left Vertex at: " + this.startVertex.toString + ", \n" +
        "Width of: " + this.width + ", \n" + 
        "Height of: " + this.height);
    }

    /**
     * The bounding box of the rectangle is represented by its 4 corners.
     * @returns The boudning box of the rectangle.
     */
    public getBoundingBox() : Point[] {
        //top left vertex
        let vertices : Point[] = [this.startVertex];
        //top right vertex
        vertices.push(new Point(this.startVertex.x + this.width, this.startVertex.y));
        //bottom left vertex
        vertices.push(new Point(this.startVertex.x, this.startVertex.y + this.height));
        //bottom right vertex
        vertices.push(new Point(this.startVertex.x + this.width, this.startVertex.y + this.height))

        return vertices;
    }

    /**
     * Checks if another rectangle is within the horizontal boundaries of this rectangle.
     * @param otherRect The other rectangle to be checked.
     * @returns True, if the other rectangle is within the horizontal boundaries of this rectangle. Else, false
     */
    public overlapsHorizontal(otherRect: Rectangle) : boolean {
        /**
         * The other rectangle is overlapping the horizontal boundaries of this rectangle if:
         * The other rectangle is on the right of this rectangle AND
         * The other rectangle's left edge is on the left of rectangle's right edge
         * OR
         * This other rectangle is on the left of this rectangle AND
         * The other rectangle's right edge is on the left of rectangle's left edge
         */
        if((this.startVertex.x <= otherRect.startVertex.x) && (this.getBoundingBox()[1].x >= otherRect.getBoundingBox()[0].x)) {
            return true;

        } else if((this.getBoundingBox()[1].x >= otherRect.getBoundingBox()[1].x) && (this.startVertex.x <= otherRect.getBoundingBox()[1].x)) {
            return true;

        } else {
            return false;
        }
    }



    /**
     * Checks if another rectangle is within the vertical boundaries of this rectangle.
     * @param otherRect The other rectangle to be checked.
     * @returns True, if the other rectangle is within the vertical boundaries of this rectangle. Else, false.
     */
    public overlapsVertical(otherRect: Rectangle) : boolean {
        /**
         * The other rectangle is overlapping the vertical boundaries of this rectangle if:
         * The other rectangle is above this rectangle AND
         * The other rectangle's bottom edge is below this rectangle's top edge
         * OR
         * The other rectangle is below this rectangle AND
         * The other rectangle's top edge is above this rectangles bottom edge
         */
        if((this.getBoundingBox()[2].y >= otherRect.getBoundingBox()[2].y) && (this.getBoundingBox()[0].y <= otherRect.getBoundingBox()[2].y )){
            return true;

        } else if ((this.startVertex.y <= otherRect.startVertex.y) && (this.getBoundingBox()[2].y >= otherRect.getBoundingBox()[0].y)) {
            return true;

        } else {
            return false;
        }
    }

    /**
     * Checks whether this rectangle is colliding with another rectangle.
     * @param otherRect The other rectangle it might be colliding with.
     * @returns True, if the other rectagle is colliding with this rectangle. Else, false.
     */
    public onRectOverlap(otherRect: Rectangle) : boolean {
        return((this.overlapsHorizontal(otherRect) && this.overlapsVertical(otherRect)));
    }

    /**
     * Checks whether this rectangle is colliding with an ellipse.
     * @param otherEllipse The ellipse it might be colliding with.
     * @returns True, if the ellipse is colliding with this rectangle. Else, false.
     */
    public onEllipseOverlap(otherEllipse: Ellipse) : boolean {
        return(this.onRectOverlap(otherEllipse.boundingBox));
    }

    public rectWithinThis(otherRect: Rectangle) : boolean {
        /**
         * The other rectangle is within this rectangle if
         * It's left x coordinate is greater than this rectangle's left x coordinate AND
         * It's right x coordinate is smaller than this rectangle's right x coordinate AND
         * It's top y coordinate is greater than this rectangle's top y coordinate AND
         * It's bottom y coordinate is lesser than this rectangle's bottom y coordinate
         */
        if((otherRect.getBoundingBox()[0].x >= this.getBoundingBox()[0].x) &&
        (otherRect.getBoundingBox()[1].x <= this.getBoundingBox()[1].x) &&
        (otherRect.getBoundingBox()[0].y >= this.getBoundingBox()[0].y) &&
        (otherRect.getBoundingBox()[2].y <= this.getBoundingBox()[2].y)) {
            return true;
        }

        else {
            return false;
        }
    }

    public ellipseWithinThis(otherEllipse: Ellipse) : boolean {
        return(this.rectWithinThis(otherEllipse.boundingBox));
    }

    // /**
    //  * Accessor to get the top left vertex of the rectangle.
    //  * @returns The top left vertex of the rectangle.
    //  */
    // public getStartVertex(): Point {
    //     return this.startVertex;
    // }

    // /**
    //  * Modifier to set the top left vertex of the rectangle.
    //  * @param vertex The point to be set as the top left vertex of the rectangle.
    //  */
    // public setStartVertex(vertex: Point) {
    //     this.startVertex = vertex;
    // }

    // /**
    //  * Accessor to get the width of the rectangle.
    //  * @returns The width of the rectangle.
    //  */
    // public getWidth(): number {
    //     return this.width;
    // }

    // /**
    //  * Modifier to set the width of the rectangle.
    //  * @param length The legnth to be set as the width of the rectangle.
    //  */
    // public setWidth(length: number) {
    //     this.width = length;
    // }

    // /**
    //  * Accessor to get the height of the rectangle.
    //  * @returns The height of the rectangle.
    //  */
    // public getHeight(): number {
    //     return this.height;
    // }

    // /**
    //  * Modifier to set the height of the rectangle.
    //  * @param length The length to be set as the height of the rectangle.
    //  */
    // public setHeight(length: number) {
    //     this.height = length;
    // }

    /* public onRect(otherRect: Rectangle) : boolean {
        let thisDiag : number = Math.sqrt(Math.pow(this.height, 2) + Math.pow(this.width, 2));
        let otherDiag : number = Math.sqrt(Math.pow(otherRect.getHeight(), 2) + Math.pow(otherRect.getWidth(), 2));
    } */
}