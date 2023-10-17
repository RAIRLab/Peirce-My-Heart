import {shapeContains} from "./AEGUtils";
import {AtomNode} from "./AtomNode";
import {Ellipse} from "./Ellipse";
import {Point} from "./Point";

/**
 * Class that defines a Cut in AEGTree.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 * @author James Oswald
 */
export class CutNode {
    /**
     * The boundary of this node.
     */
    private internalEllipse: Ellipse | null; //Null for sheet of assertion

    /**
     * Contains the list of child nodes nested within this node.
     */
    private internalChildren: (AtomNode | CutNode)[];

    /**
     * Constructs a CutNode with the incoming Ellipse as its boundary box.
     * @param ellipse (Required) The ellipse to be set as the boundary box of this node.
     * For Sheet of Assertion, this should be passed as null.
     * @param childList The list of children nodes nested within this node.
     * If not passed, defaults to an empty array.
     */
    public constructor(ellipse: Ellipse | null, childList?: (AtomNode | CutNode)[]) {
        this.internalEllipse = ellipse;
        this.internalChildren = childList ?? [];
    }

    /**
     * Accessor to get the bounding ellipse of the Cut Node.
     * @returns The bounding ellipse of this Cut Node
     * Returns null for Sheet of Assertion
     */
    public get ellipse(): Ellipse | null {
        return this.internalEllipse;
    }

    /**
     * Modifier to set the bounding ellipse of this Cut Node
     */
    public set ellipse(ellipse: Ellipse) {
        this.internalEllipse = ellipse;
    }

    /**
     * Accessor to get the children (array of nodes nested within) of the Cut Node.
     * @returns The children of the Cut Node
     */
    public get children(): (AtomNode | CutNode)[] {
        return this.internalChildren;
    }

    /**
     * Modifier that sets the children of the Cut Node.
     * @param list The list of nodes to be added as the children of the Cut Node
     */
    public set children(list: (AtomNode | CutNode)[]) {
        this.internalChildren = list;
    }

    /**
     * Modifier that adds a child to the Cut Node.
     * @param child The node to be added as a child of the Cut Node
     */
    public set child(child: AtomNode | CutNode) {
        this.internalChildren.push(child);
    }

    /**
     * Determines the deepest CutNode in which newNode can fit.
     * @param newNode the new node
     * @returns the deepest valid CutNode in which newNode can fit
     */
    public getCurrentCut(newNode: CutNode | AtomNode): CutNode {
        for (let i = 0; i < this.internalChildren.length; i++) {
            const child: CutNode | AtomNode = this.internalChildren[i];
            if (child instanceof CutNode && child.containsNode(newNode)) {
                //newNode can be placed at least one layer deeper
                return child.getCurrentCut(newNode);
            }
        }
        return this; //we are at the deepest valid level that newNode can be placed
    }

    /**
     * Checks whether the incoming Point is contained within this CutNode.
     * @param otherPoint The point that might be within this node.
     * @returns True, if the point is within this node. Else, false.
     */
    public containsPoint(otherPoint: Point): boolean {
        if (this.internalEllipse === null) {
            //This CutNode represents the sheet.
            //Everything is within the sheet.
            return true;
        }

        return this.internalEllipse.containsPoint(otherPoint);
    }

    /**
     * Checks whether another node is within this CutNode.
     * @param otherNode The node that might be within this CutNode.
     * @returns True, otherNode it is within this CutNode. Else, false.
     */
    public containsNode(otherNode: AtomNode | CutNode): boolean {
        if (this.internalEllipse === null) {
            //This CutNode represents the sheet.
            //Everything is within the sheet.
            return true;
        }

        if (otherNode instanceof AtomNode) {
            return shapeContains(this.internalEllipse, otherNode.calcRect());
        } else {
            return shapeContains(this.internalEllipse, otherNode.internalEllipse!);
        }
    }

    /**
     * Removes the lowest node recognized by this CutNode containing the incoming Point.
     * @param incomingPoint The incoming Point
     * @returns True, if the node was successfully removed.
     */
    public remove(incomingPoint: Point): boolean {
        if (!this.containsPoint(incomingPoint) || this.ellipse === null) {
            return false;
        }

        //We do contain the Point at this stage.
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].containsPoint(incomingPoint)) {
                if (
                    this.children[i] instanceof AtomNode || //If the child is childless, the child must be spliced.
                    (this.children[i] instanceof CutNode &&
                        (this.children[i] as CutNode).children.length === 0)
                ) {
                    this.children.splice(i, 1);
                    return true;
                } else {
                    //We have a CutNode with more than 0 children.
                    for (let j = 0; j < (this.children[i] as CutNode).children.length; j++) {
                        if (
                            (this.children[i] as CutNode).children[j].containsPoint(incomingPoint)
                        ) {
                            //If the child has children, and one of its children contains the Point, recursion time.
                            if ((this.children[i] as CutNode).children[j] instanceof AtomNode) {
                                (this.children[i] as CutNode).children.splice(j, 1);
                            } else {
                                return (
                                    (this.children[i] as CutNode).children[j] as CutNode
                                ).remove(incomingPoint);
                            }
                        }
                    }
                    //Here, we have a CutNode with more than 0 children, none of which contained the Point.
                    //This is now the lowest node containing the Point, and so, we must remove the child.
                    this.children.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns a string representation of this CutNode.
     * @returns The children and boundary box of this CutNode.
     */
    public toString(): string {
        let str: string;

        if (this.internalEllipse === null) {
            str = "Sheet of Assertion of the AEG Tree";
        } else {
            str = "A cut node with boundary box of " + this.internalEllipse.toString();
        }

        if (this.internalChildren.length > 0) {
            str += ", With nested nodes: " + this.internalChildren.toString();
        }
        return str;
    }

    /**
     * Constructs a string representation of an AEGTree or a subtree.
     * () - cut
     * char - atom
     * (char char ()) - valid nesting of two chars and a cut inside another cut
     * @returns an accurate string representation of the AEGTree or a subtree
     * @author James Oswald
     */
    public toFormulaString(): string {
        let formulaString = "";
        for (const child of this.internalChildren) {
            if (child instanceof AtomNode) {
                formulaString += child.identifier;
            } else if (child instanceof CutNode) {
                formulaString += child.toFormulaString();
            }
            formulaString += " ";
        }
        formulaString = formulaString.slice(0, -1);
        if (this.internalEllipse === null) {
            formulaString = "[" + formulaString + "]";
        } else {
            formulaString = "(" + formulaString + ")";
        }
        return formulaString;
    }
}
