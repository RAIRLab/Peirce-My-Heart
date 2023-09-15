import {Point, Rectangle} from "./ShapeAndPointClasses";
import {Node} from "./GenericNode";

/**
 * @author Ryan Reilly 
 */
export class AtomNode extends Node {

    private boundBox: Rectangle;

    private identifier: string;

    constructor(bound: Rectangle, id: string) {
        super(bound);
        this.identifier = id;
    }

    public getBoundBox(): Rectangle {
        return this.boundBox;
    }

    public getID(): string {
        return this.identifier;
    }
}