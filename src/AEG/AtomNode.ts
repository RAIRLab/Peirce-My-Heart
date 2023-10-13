import {Rectangle} from "./Rectangle";
import {CutNode} from "./CutNode";
import {Ellipse} from "./Ellipse";
import {Point} from "./Point";

/**
 * Defines an Atom.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 */
export class AtomNode {
    /**
     * The rectangle signifying the boundary box of this node.
     */
    private internalRectangle: Rectangle;

    /**
     * The string value of the proposition represented by this node.
     */
    private internalIdentifier: string;

    /**
     * The point the atom is initially placed.
     */
    private internalOrigin: Point;

    /**
     * Construct an atom node with given boundary box and proposition.
     * @param rect (Required) The rectangle to be set as the boundary box of this node.
     * @param val (Required) The value of the proposition represented by this node.
     */
    public constructor(val: string, origin?: Point, rect?: Rectangle) {
        this.internalRectangle = rect ?? new Rectangle(new Point(0, 0), 0, 0);
        this.internalIdentifier = val;
        this.internalOrigin = origin ?? new Point();
    }

    /**
     * Accessor to get the bounding rectangle of the Atom Node.
     * @returns The bounding rectangle of this Atom Node
     */
    public get rectangle(): Rectangle {
        return this.internalRectangle;
    }

    /**
     * Modifier to set the bounding rectangle of the Atom Node.
     */
    public set rectangle(rect: Rectangle) {
        this.internalRectangle = rect;
    }

    /**
     * Accessor to get the identifier of the Atom Node.
     * @returns The identifier of this Atom Node
     */
    public get identifier(): string {
        return this.internalIdentifier;
    }

    /**
     * Modifier to set the identifier of the Atom Node
     */
    public set identifier(identifier: string) {
        this.internalIdentifier = identifier;
    }

    /**
     * Accessor to get the origin (top left) vertex of the bounding rectangle of the Atom Node.
     * @returns The origin of the bounding rectangle
     */
    public get origin(): Point {
        return this.internalOrigin;
    }

    /**
     * Modifier to set the origin (top left) vertex of the bounding rectangle of the Atom Node.
     */
    public set origin(point: Point) {
        this.internalOrigin = point;
    }

    /**
     * Method that checks whether a point is contained within this node.
     * @param otherPoint The point that might be within this node.
     * @returns True, if the point is within this node. Else, false.
     */
    public containsPoint(otherPoint: Point): boolean {
        return this.internalRectangle.containsPoint(otherPoint);
    }

    /**
     * Method that checks whether a node is contained within this node.
     * @param otherNode The node that might be within this node.
     * @returns True, if the node is within this node. Else, false.
     */
    public containsNode(otherNode: AtomNode | CutNode): boolean {
        if (otherNode instanceof AtomNode) {
            return this.internalRectangle.contains((otherNode as AtomNode).rectangle);
        } else {
            return this.internalRectangle.contains((otherNode as CutNode).ellipse as Ellipse);
        }
    }

    /**
     * Method that returns string representation of an atom node.
     * @returns The value and boundary box of an atom node.
     */
    public toString(): string {
        return (
            "An atom representing the proposition: " +
            this.internalIdentifier +
            " and " +
            "Boundary box of: " +
            this.internalRectangle.toString()
        );
    }
}
