import { GenericNode } from "./GenericNode";
import { Rectangle } from "./Rectangle";

/**
 * Class that defines an Atom
 */
export class AtomNode extends GenericNode {

    /**
     * The rectangle signifying the boundary box of this node.
     */
    rect: Rectangle;    

    /**
     * The string value of the proposition represented by this node.
     */
    value: string;

    /**
     * Construct an atom node with given boundary box and proposition.
     * @param rect The rectangle to be set as the boundary box of this node.
     * @param val The value of the proposition represented by this node.
     */
    public constructor(val: string, rect?: Rectangle){
        super(new AtomNode(val, rect));
        this.rect = rect ?? new Rectangle();
        this.value = val;
    }

    /**
     * Method that returns string representation of an atom node
     * @returns The value and boundary box of an atom node
     */
    public toString(): string {
        return("An atom representing the propostion: " + this.value + " and \n" + 
        "Boundary box of: \n" + this.rect.toString);
    }
}