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
     * Creates a deep copy of this CutNode
     * @returns A new CutNode, which is a deep copy of this node
     */
    public copy(): CutNode {
        let newEllipse: Ellipse | null;
        const newChildren: (AtomNode | CutNode)[] = [];
        if (this.ellipse !== null) {
            newEllipse = new Ellipse(
                new Point(this.ellipse.center.x, this.ellipse.center.y),
                this.ellipse.radiusX,
                this.ellipse.radiusY
            );
        } else {
            newEllipse = null;
        }

        // Copy all the nested children individually
        if (this.children.length > 0) {
            for (let i = 0; i < this.children.length; i++) {
                const newChild = this.children[i];
                if (newChild instanceof AtomNode) {
                    newChildren.push((newChild as AtomNode).copy());
                } else {
                    newChildren.push((newChild as CutNode).copy());
                }
            }
        }

        return new CutNode(newEllipse, newChildren);
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
    public set ellipse(ellipse: Ellipse | null) {
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
     * Recursive method to return the lowest level node containing the given point.
     * Returns null when this node does not contain the point.
     * @param incomingPoint The given point on the canvas.
     * @returns The lowest node containing the node on the tree.
     */
    public getLowestNode(incomingPoint: Point): CutNode | AtomNode | null {
        if (!this.containsPoint(incomingPoint)) {
            return null;
        }

        for (let i = 0; i < this.internalChildren.length; i++) {
            if (this.internalChildren[i].containsPoint(incomingPoint)) {
                //If there are no children this is the lowest node.
                if (
                    this.internalChildren[i] instanceof AtomNode ||
                    (this.internalChildren[i] instanceof CutNode &&
                        (this.internalChildren[i] as CutNode).children.length === 0)
                ) {
                    return this.internalChildren[i];
                } else {
                    return (this.internalChildren[i] as CutNode).getLowestNode(incomingPoint);
                }
            }
        }

        //None of the children contain the point, so this is the lowest node containing the point.
        return this;
    }

    /**
     * Recursive method to return the parent of the lowest node containing the given point.
     * Returns null when the parent's children do not contain the point. Throws and error if this
     * does not contain the point.
     * @param incomingPoint The given point on the canvas.
     * @returns The parent of the lowest level node.
     */
    public getLowestParent(incomingPoint: Point): CutNode | null {
        if (!this.containsPoint(incomingPoint)) {
            throw new Error("This parent " + this.toString + " does not contain the point.");
        }

        for (let i = 0; i < this.internalChildren.length; i++) {
            if (this.internalChildren[i].containsPoint(incomingPoint)) {
                //If there are no children this is the lowest node.
                if (
                    this.internalChildren[i] instanceof AtomNode ||
                    (this.internalChildren[i] instanceof CutNode &&
                        (this.internalChildren[i] as CutNode).children.length === 0)
                ) {
                    return this;
                } else {
                    //If the cut child with at least 1 child has children containing the point recurse
                    const tempCut: CutNode = this.internalChildren[i] as CutNode;
                    for (let j = 0; j < tempCut.children.length; j++) {
                        if (tempCut.children[j].containsPoint(incomingPoint)) {
                            return tempCut.getLowestParent(incomingPoint);
                        }
                    }
                    //If none of the children of the child contain the point, but the child does return the parent.
                    return this;
                }
            }
        }
        //If none of this node's children contain the point then it cannot be the parent.
        return null;
    }

    /**
     * Finds the level the given node is found at. If the node is found within a different node
     * acts recursively and increments the level by one and calls this function again.
     * @param incomingNode The node that is being searched for
     * @param currentLevel The current level of the tree the recursion is at
     * @returns The level in the tree it was found in
     */
    public getLevel(incomingNode: CutNode | AtomNode, currentLevel: number): number {
        for (let i = 0; i < this.internalChildren.length; i++) {
            //We have found the node as one of this node's children, return current level
            if (this.internalChildren[i] === incomingNode) {
                return currentLevel;
            } //If the current child is a cut that contains the node then call this function again
            else if (
                this.internalChildren[i] instanceof CutNode &&
                (this.internalChildren[i] as CutNode).containsNode(incomingNode)
            ) {
                return (this.internalChildren[i] as CutNode).getLevel(
                    incomingNode,
                    currentLevel + 1
                );
            }
        }

        return -1;
    }

    /**
     * Removes the lowest node recognized by this CutNode containing the incoming Point.
     * @param incomingPoint The incoming Point
     * @returns True, if the node was successfully removed.
     */
    public remove(incomingPoint: Point): boolean {
        if (!this.containsPoint(incomingPoint)) {
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
                    //This CutNode is now the lowest node containing the Point, and so, we must remove that child.
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
            str = "A cut node with " + this.internalEllipse.toString();
        }

        if (this.internalChildren.length > 0) {
            str += ", With nested nodes: " + this.internalChildren.toString();
        }
        return str;
    }

    public isEmptySheet(): boolean {
        return this.internalEllipse === null && this.internalChildren.length === 0;
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

    /**
     * Method that checks if a cut node is equal to another cut node
     * The are equal if they represent the same graph
     * @param otherCut The other cut node we are checking against for equality
     * @returns True, if they are equal (the same). Else, false
     */
    public isEqualTo(otherCut: CutNode): boolean {
        //For 2 cuts to be equal, they must have the same number of children
        if (this.children.length === otherCut.children.length) {
            if (this.children.length === 0) {
                //If they do not have children, they are empty cuts
                //Empty cuts are always equal
                return true;
            }
            //If they have the same number of children, they should be the same children
            //Make a deep copy and get the list of children of each cut
            const thisChildren = this.copy().children;
            const otherChildren = otherCut.copy().children;

            //Iterate through the children of a cut and see if the other cut has the same child
            //If they have the same child, remove it from the lists and continue
            //If a child is not present in both, they are not equal
            for (let i = 0; i < thisChildren.length; i++) {
                for (let j = 0; j < otherChildren.length; j++) {
                    if (
                        (thisChildren[i] instanceof AtomNode &&
                            otherChildren[j] instanceof AtomNode &&
                            (thisChildren[i] as AtomNode).isEqualTo(
                                otherChildren[j] as AtomNode
                            )) ||
                        (thisChildren[i] instanceof CutNode &&
                            otherChildren[j] instanceof CutNode &&
                            (thisChildren[i] as CutNode).isEqualTo(otherChildren[j] as CutNode))
                    ) {
                        thisChildren.splice(i, 1);
                        otherChildren.splice(j, 1);
                        i--;
                        break;
                    }

                    if (j === otherChildren.length - 1) {
                        //Checked all children but a match was not found. The nodes are not equal
                        return false;
                    }
                }
            }
            //Check if all the children have been matched and returned
            return thisChildren.length === 0 && otherChildren.length === 0;
        }

        return false;
    }
}
