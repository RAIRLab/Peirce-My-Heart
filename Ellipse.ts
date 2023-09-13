import { Point } from "./Point";
import { Rectangle } from "./Rectangle";

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
    constructor(center?: Point, radX?: number, radY?: number) {
        this.center = center ?? new Point();
        this.radiusX = radX ?? 0;
        this.radiusY = radY ?? 0;

        let boundingVertex : Point = new Point((this.center.x - this.radiusX), (this.center.y - this.radiusY));
        this.boundingBox = new Rectangle(boundingVertex, (this.radiusX*2), (this.radiusY*2));
    }

    /**
     * Returns the string representation of an ellipse
     * @returns The coordinates and radii for the ellipse
     */
    toString(): string {
        return("An ellipse with\nCenter at: " + this.center.toString + ", \n" +
        "Horizontal Radius of: " + this.radiusX +", \n" +
        "Vertical Radius of: " + this.radiusY);
    }

    /**
     * Checks whether this ellipse is colliding with a rectangle.
     * @param otherRect The rectangle it might be colliding with.
     * @returns True, if the rectagle is colliding with this ellipse. Else, false.
     */
    public onRectOverlap(otherRect: Rectangle) : boolean {
        return this.boundingBox.onRectOverlap(otherRect);
    }

    /**
     * Checks whether this ellipse is colliding with another ellipse.
     * @param otherEllipse The ellipse it might be colliding with.
     * @returns True, if the other ellipse is colliding with this ellipse. Else, false.
     */
    public onEllipseOverlap(otherEllipse: Ellipse) : boolean {
        return this.boundingBox.onEllipseOverlap(otherEllipse);
    }
    
    
    // public getBoundingBox() : Point[] { 
    //     let points : Point[] = [this.center];
    //     //leftmost on x axis
    //     points.push(new Point(this.center.x - this.radiusX, this.center.y));
    //     //rightmost on x axis
    //     points.push(new Point(this.center.x + this.radiusX, this.center.y));
    //     //top on y axis
    //     points.push(new Point(this.center.x, this.center.y - this.radiusY));
    //     //bottom on y axis
    //     points.push(new Point(this.center.x, this.center.y + this.radiusY));
    //     return points;
    // }



    // public onEllipse(otherEllipse: Ellipse) : boolean {
    //     if(this.center.x <= otherEllipse.center.x){
    //         //The other ellipse is on the right of this ellipse
    //         if(otherEllipse.getBoundingBox()[1].x <= this.getBoundingBox()[2].x) {
    //             //The other ellipse might be within the right half of this ellipse
    //             if(this.center.y > otherEllipse.center.y) {
    //                 //The other ellipse is above this ellipse
    //                 if(otherEllipse.getBoundingBox()[4].y > this.getBoundingBox()[3].y){
    //                     //other ellipse is within the the top right quadrant of this ellipse
    //                     return true;
    //                 }
    //             } else {
    //                 //The other ellipse is below this ellipse
    //             }
    //         } else {
    //             //The center of the other ellipse might be within the left half of this ellipse
    //         }
    //     } else {
    //         //The other ellipse is on the left of this ellipse
    //     }
    // }

    // /**
    //  * Accessor to get the center point of this ellipse.
    //  * @returns The center point of this ellipse.
    //  */
    // public getCenter() : Point {
    //     return this.center;
    // }

    // /**
    //  * Modifier to set the center point of this ellipse.
    //  * @param newCenter The point to be set as the new center of this ellipse.
    //  */
    // public setCenter(newCenter: Point) : void {
    //     this.center = newCenter
    // }

    // /**
    //  * Accessor to get the horizontal radius of this ellipse.
    //  * @returns The horizontal radius of this ellipse.
    //  */
    // public getHorizontalRadius() : number {
    //     return this.radiusX;
    // }

    // /**
    //  * Modifier to set the horizontal radius of this ellipse.
    //  * @param newRadX The length to be set as the new horizontal radius of this ellipse.
    //  */
    // public setHorizontalRadius(newRadX: number) : void {
    //     this.radiusX = newRadX;
    // }

    // /**
    //  * Accessor to get the vertical radius of this ellipse.
    //  * @returns The vertical radius of this ellipse.
    //  */
    // public getVerticalRadius() : number {
    //     return this.radiusY;
    // }

    // /**
    //  * Modifier to set the vertical radius of this ellipse.
    //  * @param newRadY The length to be set as the new vertical radius of this ellipse.
    //  */
    // public setVerticalRadius(newRadY: number) : void {
    //     this.radiusY = newRadY
    // }
}