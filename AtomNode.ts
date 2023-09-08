import { GenericNode } from "./GenericNode";
import { Rectangle } from "./Rectangle";

//Atom nodes are always leaves and consist of a character and a rectangular bounding box.

export class AtomNode extends GenericNode {

    /**
     * The rectangle signifying the boundary box of this node.
     */
    private rect: Rectangle;    

    /**
     * The string value of the proposition represented by this node.
     */
    private value: string;

    /**
     * Construct an atom node with given boundary box and proposition.
     * @param rect The rectangle to be set as the boundary box of this node.
     * @param val The value of the proposition represented by this node.
     */
    constructor(val: string, rect?: Rectangle){
        super(new AtomNode(val, rect));
        this.rect = rect ?? new Rectangle();
        this.value = val;
    }

    /**
     * A string representation of this node
     * @returns The value and boundary box of this node
     */
    toString(): string {
        return("An atom representing the propostion: " + this.value + " and \n" + 
        "Boundary box of: \n" + this.rect.toString);
    }
}