import {AtomNode} from "./AtomNode";
import {Ellipse} from "./Ellipse";
import {Point} from "./Point";

/**
 * Class that defines a cut on the AEGTree.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 */
export class CutNode {
    /**
     * Signifies the boundary box of this node.
     */
    ellipse: Ellipse | null; //The Sheet of Assertion will have infinite boundaries.

    /**
     * Contains the list of child nodes nested within this node.
     */
    children: (AtomNode | CutNode)[];

    /**
     * Constructs a CutNode with the incoming Ellipse as its boundary box.
     * @param ellipse The Ellipse to be set as the boundary box of this node.
     * @param childList The list of children nodes nested within this node.
     */
    public constructor(ellipse?: Ellipse, childList?: (AtomNode | CutNode)[]) {
        this.ellipse = ellipse ?? new Ellipse();
        this.children = childList ?? [];
    }

    /**
     * Returns a string representation of this CutNode.
     * @returns The children and boundary box of this node
     */
    public toString(): string {
        let str: string;

        if (this.ellipse === null) {
            str = "Sheet of Assertion of the AEG Tree";
        } else {
            str = "A cut node with boundary box of \n" + this.ellipse.toString();
        }

        if (this.children.length > 0) {
            str += ", \n" + "With nested nodes: " + this.children.toString();
        }
        return str;
    }

    /**
     * Checks whether the incoming Point is contained within this CutNode.
     * @param otherPoint The Point that might be within this node.
     * @returns True, if the Point is within this node. Else, false.
     */
    public containsPoint(otherPoint: Point): boolean {
        if (this.ellipse === null) {
            //This CutNode represents the sheet.
            //Everything is within the sheet.
            return true;
        }

        return this.ellipse.containsPoint(otherPoint);
    }

    /**
     * Checks whether the incoming node is within this CutNode.
     * @param otherNode The incoming node that might be within this CutNode.
     * @returns True, if the incoming node is within this CutNode. Else, false.
     */
    public containsNode(otherNode: AtomNode | CutNode): boolean {
        if (this.ellipse === null) {
            //This CutNode represents the sheet.
            //Everything is within the sheet.
            return true;
        }

        if (otherNode instanceof AtomNode) {
            return this.ellipse.containsShape((otherNode as AtomNode).rect);
        } else {
            //ELLIPSE TO BE IMPLEMENTED ACCURATELY
            return this.ellipse.containsShape((otherNode as CutNode).ellipse as Ellipse);
        }
    }

    /**
     * Recursively verifies whether all the child nodes of this CutNode are contained within.
     * @returns True, if all the child nodes are contained within. Else, false
     */
    public verifyCut(): boolean {
        let isValid = true;

        for (let i = 0; i < this.children.length; i++) {
            if (!isValid) {
                return false;
            }

            if (this.ellipse === null) {
                //This CutNode represents the sheet.
                //Everything is within the sheet.
                //Check the children of the sheet
                if (this.children[i] instanceof CutNode) {
                    isValid = (this.children[i] as CutNode).verifyCut();
                }
            }

            isValid = this.containsNode(this.children[i]);

            //If the node is a cut node, check it's children
            if (isValid && this.children[i] instanceof CutNode) {
                isValid = (this.children[i] as CutNode).verifyCut();
            }
        }

        return isValid;
    }

    /**
     * Checks whether the incoming node can be inserted into this CutNode
     * at a given point without overlapping any boundaries.
     * @param incomingNode The node to be inserted.
     * @returns True, if the node can be inserted. Else, false
     */
    public canInsert(incomingNode: AtomNode | CutNode): boolean {
        let isValid = true;
        let childRect = null;
        let childEllipse = null;
        let childEllipse2 = null; //for incomingNode as a CutNode and a CutNode child

        if (incomingNode instanceof AtomNode && this.ellipse !== null) {
            //INCOMING Atom on THIS Cut collision checking
            isValid = (incomingNode as AtomNode).rect.overlaps(this.ellipse);
            for (let i = 0; isValid && i < this.children.length; i++) {
                //INCOMING Atom on (THIS Cut's CHILDREN) collision checking
                if (this.children[i] instanceof AtomNode) {
                    childRect = (this.children[i] as AtomNode).rect;
                    isValid = (incomingNode as AtomNode).rect.overlaps(childRect);
                } else if ((childEllipse = (this.children[i] as CutNode).ellipse) !== null) {
                    isValid = (incomingNode as AtomNode).rect.overlaps(childEllipse);
                }
            }
        } else if (
            (childEllipse = (incomingNode as CutNode).ellipse) !== null &&
            this.ellipse !== null
        ) {
            //INCOMING Cut on THIS Cut collision checking
            isValid = childEllipse.overlaps(this.ellipse);
            for (let i = 0; isValid && i < this.children.length; i++) {
                //INCOMING Cut on (THIS Cut's CHILDREN) collision checking
                if (this.children[i] instanceof AtomNode) {
                    childRect = (this.children[i] as AtomNode).rect;
                    isValid = childEllipse.overlaps(childRect);
                } else if ((childEllipse2 = (this.children[i] as CutNode).ellipse) !== null) {
                    isValid = childEllipse.overlaps(childEllipse2);
                }
            }
        }
        //Note that both clauses require this.ellipse to be not null.
        //It is assumed that something can be placed anywhere on the Sheet of Assertion,
        //Which is the only valid CutNode that has this.ellipse = null.
        return isValid;
    }

    /**
     * Inserts a given node into this CutNode at the incoming Point, if canInsert() is true.
     * @param incomingNode The incoming node to be inserted
     */
    public insert(incomingNode: AtomNode | CutNode): void {
        if (!this.canInsert(incomingNode)) {
            throw new Error("Insertion failed. " + incomingNode + " collided with " + this + ".");
        }
        this.children.push(incomingNode);
    }

    /**
     * Removes the node lowest on the tree containing the incoming Point.
     * @param incomingPoint The incoming point
     * @returns True, if the node was successfully removed. Else, false
     */
    public remove(incomingPoint: Point): boolean {
        if (this.containsPoint(incomingPoint)) {
            let isSmallest = true;

            for (let i = 0; i < this.children.length; i++) {
                //Check if the point is within a child
                if (this.children[i].containsPoint(incomingPoint)) {
                    isSmallest = false;

                    if (this.children[i] instanceof CutNode) {
                        //If the point is within a cut node, check its children
                        return (this.children[i] as CutNode).remove(incomingPoint);
                    } else {
                        //If the point is within an atom node, remove it
                        this.children = this.children.splice(i, 1);
                        return true;
                    }
                }
            }
            //if the point is not contained within any children nodes, delete this node
            if (isSmallest) {
                //What to do to remove this node?
                return true;
            }
        }

        return false;
    }
}
