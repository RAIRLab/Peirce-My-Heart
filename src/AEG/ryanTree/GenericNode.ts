import {Point, Rectangle} from "./ShapeAndPointClasses";

/**
 * @author Ryan Reilly
 */
export class Node {
    private boundingBox: Rectangle;

    constructor(bound: Rectangle) {
        this.boundingBox = bound;
    }

    public getBoundBox(): Rectangle {
        return this.boundingBox;
    }
}