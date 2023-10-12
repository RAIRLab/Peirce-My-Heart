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
    private rect: Rectangle;

    /**
     * The string value of the proposition represented by this node.
     */
    private identifier: string;

    /**
     * The point the atom is initially placed.
     */
    private origin: Point;

    /**
     * Construct an atom node with given boundary box and proposition.
     * @param rect (Required) The rectangle to be set as the boundary box of this node.
     * @param val (Required) The value of the proposition represented by this node.
     */
    public constructor(val: string, origin?: Point, rect?: Rectangle) {
        this.rect = rect ?? new Rectangle();
        this.identifier = val;
        this.origin = origin ?? new Point();
    }

    /**
     * Accessor to get the bounding rectangle of the Atom Node.
     * @returns The bounding rectangle of this Atom Node
     */
    public get Rectangle(): Rectangle {
        return this.rect;
    }

    /**
     * Modifier to set the bounding rectangle of the Atom Node.
     */
    public set Rectangle(rect: Rectangle) {
        this.rect = rect;
    }

    /**
     * Accessor to get the identifier of the Atom Node.
     * @returns The identifier of this Atom Node
     */
    public get Identifier(): string {
        return this.identifier;
    }

    /**
     * Modifier to set the identifier of the Atom Node
     */
    public set Identifier(identifier: string) {
        this.identifier = identifier;
    }

    /**
     * Accessor to get the origin (top left) vertex of the bounding rectangle of the Atom Node.
     * @returns The origin of the bounding rectangle
     */
    public get Origin(): Point {
        return this.origin;
    }

    /**
     * Modifier to set the origin (top left) vertex of the bounding rectangle of the Atom Node.
     */
    public set Origin(point: Point) {
        this.origin = point;
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
            return this.rect.contains((otherNode as AtomNode).Rectangle);
        } else {
            return this.rect.contains((otherNode as CutNode).Ellipse as Ellipse);
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
