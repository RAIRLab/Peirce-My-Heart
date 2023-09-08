import { Ellipse } from "./Ellipse";
import { GenericNode } from "./GenericNode";

//Cut nodes consist of an elliptical bounding box and can contain zero or more child nodes.

export class CutNode extends GenericNode {

    /**
     * The ellipse signifying the boundary box of this node.
     */
    private ellipse: Ellipse;

    /**
     * Construct a cut node with given boundary box.
     * @param ellipse The ellipse to be set as the boundary box of this node.
     */
    constructor(ellipse?: Ellipse){
        super(new CutNode(ellipse));
        this.ellipse = ellipse ?? new Ellipse();
    }

    /**
     * Returns a string representation of a cut node
     * @returns The children and boundary box of this node
     */
    toString(): string {
        return("A cut node with boundary box of \n" + this.ellipse.toString);
    }

}