import {Rectangle} from "./Rectangle";
import {Point} from "./Point";

/**
 * Defines an Atom.
 * Atoms are propositions in Peirce's AEG system.
 * Peirce My Heart only handles single character identifiers as of 1.0.0.
 *
 * @author Ryan Reilly
 * @author Anusha Tiwari
 */
export class AtomNode {
    /**
     * Proposition of this AtomNode.
     */
    private internalIdentifier: string;

    /**
     * Point at which this AtomNode is initially placed.
     */
    private internalOrigin: Point;

    /**
     * Font size width of internalIdentifier.
     */
    private internalWidth: number;

    /**
     * Font size height of internalIdentifier.
     */
    private internalHeight: number;

    /**
     * Constructs an AtomNode with the incoming proposition, origin Point, width and height.
     * @param prop Incoming proposition.
     * @param origin Top left corner of this AtomNode's boundary box.
     * @param width Width of this AtomNode's boundary box.
     * @param height Height of this AtomNode's boundary box.
     */
    public constructor(prop: string, origin: Point, width: number, height: number) {
        if (prop.length !== 1) {
            throw new Error(
                "String of length " +
                    prop.length +
                    " passed in as identifier in AtomNode constructor, which is not of length 1."
            );
        }
        if (!/^[A-Za-z]$/.test(prop)) {
            throw new Error(
                prop +
                    " not contained in Latin alphabet passed in as identifier in AtomNode constructor."
            );
        }

        this.internalIdentifier = prop;
        this.internalOrigin = origin;
        this.internalWidth = width;
        this.internalHeight = height;
    }

    /**
     * Creates and returns a deep copy (an exact copy not at the same memory address) of this AtomNode.
     * @returns Deep copy of this AtomNode.
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
     * Gets the width of this AtomNode.
     * @returns Width of this AtomNode.
     */
    public get width(): number {
        return this.internalWidth;
    }

    /**
     * Sets the width of this AtomNode to the incoming width.
     * @param width Incoming width.
     */
    public set width(width: number) {
        this.internalWidth = width;
    }

    /**
     * Gets the height of this AtomNode.
     * @returns Height of this AtomNode.
     */
    public get height(): number {
        return this.internalHeight;
    }

    /**
     * Set the height of this AtomNode to the incoming height.
     * @param height Incoming height.
     */
    public set height(height: number) {
        this.internalHeight = height;
    }

    /**
     * Gets the identifier of this AtomNode.
     * @returns Identifier of this AtomNode.
     */
    public get identifier(): string {
        return this.internalIdentifier;
    }

    /**
     * Sets the identifier of this AtomNode to the incoming identifier.
     * @param identifier Incoming identifier.
     */
    public set identifier(identifier: string) {
        this.internalIdentifier = identifier;
    }

    /**
     * Gets the origin (top left corner) of the bounding box of this AtomNode.
     * The bounding box of every AtomNode is a Rectangle.
     * @returns Origin (top left corner) of the bounding box.
     */
    public get origin(): Point {
        return this.internalOrigin;
    }

    /**
     * Sets the origin (top left corner) of the bounding box of this AtomNode to the incoming Point.
     * The bounding box of every AtomNode is a Rectangle.
     * @param point Incoming Point.
     */
    public set origin(point: Point) {
        this.internalOrigin = point;
    }

    /**
     * Checks whether a Point is contained within this AtomNode.
     * @param otherPoint Point that may be contained within this AtomNode.
     * @returns True if the Point is contained within this AtomNode.
     */
    public containsPoint(otherPoint: Point): boolean {
        return this.calcRect().containsPoint(otherPoint);
    }

    /**
     * Creates and returns a Rectangle based off the origin, width, and height of this AtomNode.
     * internalHeight is subtracted from internalOrigin to move the origin Point from the bottom left to top right of the boundary box.
     * @returns Rectangle based off this AtomNode's measurements.
     */
    public calcRect(): Rectangle {
        return new Rectangle(
            new Point(this.internalOrigin.x, this.internalOrigin.y - this.internalHeight),
            this.internalWidth,
            this.internalHeight
        );
    }

    /**
     * Checks if this AtomNode is equal to the incoming AtomNode.
     * They are considered equal if and only if they both contain the same proposition.
     * @param otherAtom Incoming AtomNode.
     * @returns True if they contain the same proposition.
     */
    public isEqualTo(otherAtom: AtomNode): boolean {
        return this.identifier === otherAtom.identifier;
    }

    /**
     * Creates and returns the string representation of this AtomNode.
     * @returns Proposition and boundary box of this AtomNode in string form.
     */
    public toString(): string {
        return (
            "An atom representing the proposition: " +
            this.internalIdentifier +
            " and Boundary box of: " +
            this.calcRect().toString()
        );
    }
}
