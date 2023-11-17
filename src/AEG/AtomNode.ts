import {Rectangle} from "./Rectangle";
import {Point} from "./Point";

/**
 * Defines an Atom.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 */
export class AtomNode {
    /**
     * The string value of the proposition represented by this node.
     */
    private internalIdentifier: string;

    /**
     * The point the atom is initially placed.
     */
    private internalOrigin: Point;

    /**
     * The font size width of the given identifier.
     */
    private internalWidth: number;

    /**
     * the font size height of the given identifier.
     */
    private internalHeight: number;

    /**
     * Construct an atom node with given boundary box and proposition.
     * @param rect The rectangle to be set as the boundary box of this node.
     * @param origin Top left corner of the passed in Rectangle
     * @param val The value of the proposition represented by this node.
     */
    public constructor(val: string, origin: Point, width: number, height: number) {
        if (val.length !== 1) {
            throw new Error(
                "String of length " +
                    val.length +
                    " passed in as identifier in AtomNode constructor, which is not of length 1."
            );
        }
        if (!/^[A-Za-z]$/.test(val)) {
            throw new Error(
                val +
                    " not contained in Latin alphabet passed in as identifier in AtomNode constructor."
            );
        }

        this.internalIdentifier = val;
        this.internalOrigin = origin;
        this.internalWidth = width;
        this.internalHeight = height;
    }

    /**
     * Creates a deep copy of this AtomNode
     * @returns A new AtomNode, which is a deep copy of this node
     */
    public copy(): AtomNode {
        return new AtomNode(
            this.internalIdentifier,
            new Point(this.internalOrigin.x, this.internalOrigin.y),
            this.internalWidth,
            this.internalHeight
        );
    }

    /**
     * Accessor to get the width of this Atom Node.
     * @returns The width of this Atom Node
     */
    public get width(): number {
        return this.internalWidth;
    }

    /**
     * Modifier to set the width of this Atom Node.
     * @param width The new Atom Node width
     */
    public set width(width: number) {
        this.internalWidth = width;
    }

    /**
     * Accessor to get the height of this Atom Node.
     * @returns the height of this Atom Node
     */
    public get height(): number {
        return this.internalHeight;
    }

    /**
     * Modifier to set the height of this Atom Node.
     * @param height THe new Atom Node height
     */
    public set height(height: number) {
        this.internalHeight = height;
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
        return this.calcRect().containsPoint(otherPoint);
    }

    /**
     * Method that returns string representation of an atom node.
     * @returns The value and boundary box of an atom node.
     */
    public toString(): string {
        return (
            "An atom representing the proposition: " +
            this.internalIdentifier +
            " and Boundary box of: " +
            this.calcRect().toString()
        );
    }

    /**
     * Creates a rectangle based off the origin, width, and height.
     * Origin is altered by the internalHeight to move the point from the bottom left to top right.
     * @returns The new rectangle based off the atom.
     */
    public calcRect(): Rectangle {
        return new Rectangle(
            new Point(this.internalOrigin.x, this.internalOrigin.y - this.internalHeight),
            this.internalWidth,
            this.internalHeight
        );
    }

    /**
     * Method that checks if an atom node is equal to another atom node
     * The are equal if they represent the same proposition
     * @param otherAtom The other atom node we are checking against for equality
     * @returns True, if they are equal (the same). Else, false
     */
    public isEqualTo(otherAtom: AtomNode): boolean {
        return this.identifier === otherAtom.identifier;
    }
}
