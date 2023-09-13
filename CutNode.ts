import { Ellipse } from "./Ellipse";
import { GenericNode } from "./GenericNode";

//Cut nodes consist of an elliptical bounding box and can contain zero or more child nodes.

export class CutNode extends GenericNode {

    /**
     * The ellipse signifying the boundary box of this node.
     */
    ellipse: Ellipse | undefined; //Undefined for Sheet

    /**
     * Member which contains the list of children nodes nested within this node.
     */
    children : GenericNode[];

    /**
     * Construct a cut node with given boundary box.
     * @param ellipse The ellipse to be set as the boundary box of this node.
     * @param childList The list of children nodes nested within this node.
     */
    constructor(ellipse?: Ellipse, childList? : GenericNode[]){
        super(new CutNode(ellipse));
        this.ellipse = ellipse ?? new Ellipse();
        this.children = childList ?? [];
    }

    /**
     * Returns a string representation of a cut node
     * @returns The children and boundary box of this node
     */
    toString(): string {
        let str : string;

        if(this.ellipse === undefined) {
            str = "Sheet of Assertion of the AEG Tree"

        } else {
            str = "A cut node with boundary box of \n" + this.ellipse.toString
        }

        if(this.children.length > 0) {
            str += ", \n" + "With nested nodes: " + this.children.toString();
        } 
        return str;
    }

}