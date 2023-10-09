import {Rectangle} from "./Rectangle";
import {CutNode} from "./CutNode";
import {Ellipse} from "./Ellipse";
import {Point} from "./Point";

/**
 * Class that defines an Atom.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 */
export class AtomNode {
    /**
     * The rectangle signifying the boundary box of this node.
     */
    rect: Rectangle;

    /**
     * The string value of the proposition represented by this node.
     */
    identifier: string;

    /**
     * The point the atom is initially placed.
     */
    origin: Point;

    /**
     * Construct an atom node with given boundary box and proposition.
     * @param rect The rectangle to be set as the boundary box of this node.
     * @param val The value of the proposition represented by this node.
     */
    public constructor(val?: string, origin?: Point, rect?: Rectangle) {
        this.rect = rect ?? new Rectangle();
        this.identifier = val ?? "";
        this.origin = origin ?? new Point();
    }

    /**
     * Method that checks whether a point is contained within this node.
     * @param otherPoint The point that might be within this node.
     * @returns True, if the point is within this node. Else, false.
     */
    public containsPoint(otherPoint: Point): boolean {
        return this.rect.containsPoint(otherPoint);
    }

    /**
     * Method that checks whether a node is contained within this node.
     * @param otherNode The node that might be within this node.
     * @returns True, if the node is within this node. Else, false.
     */
    public containsNode(otherNode: AtomNode | CutNode): boolean {
        if (otherNode instanceof AtomNode) {
            return this.rect.containsShape((otherNode as AtomNode).rect);
        } else {
            //ELLIPSE TO BE IMPLEMENTED ACCURATELY
            return this.rect.containsShape((otherNode as CutNode).ellipse as Ellipse);
        }
    }

    /**
     * Method that returns string representation of an atom node.
     * @returns The value and boundary box of an atom node.
     */
    public toString(): string {
        return (
            "An atom representing the proposition: " +
            this.identifier +
            " and " +
            "Boundary box of: " +
            this.rect.toString()
        );
    }
}
