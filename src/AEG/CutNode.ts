import {AtomNode} from "./AtomNode";
import {Ellipse} from "./Ellipse";
import {Point} from "./Point";
import {shapeContains} from "./AEGUtils";

/**
 * Defines a Cut.
 * Cuts are negations in Peirce's AEG system.
 * Cuts may be empty, and cuts may contain one or more AtomNodes and CutNodes as children.
 * Both are valid cuts.
 *
 * @author James Oswald
 * @author Ryan R
 * @author Anusha Tiwari
 */
export class CutNode {
    /**
     * Boundary of this CutNode on the HTML canvas.
     */
    private internalEllipse: Ellipse | null; //Null for sheet of assertion

    /**
     * List of child nodes contained within this CutNode.
     */
    private internalChildren: (AtomNode | CutNode)[];

    /**
     * Constructs a CutNode with the incoming Ellipse as its boundary and an incoming list of children.
     * The list of children is not required, since empty CutNodes are valid.
     * @param ellipse Incoming Ellipse. For only The Sheet of Assertion, this will be null.
     * @param childList List of nodes nested within this CutNode.
     */
    public constructor(ellipse: Ellipse | null, childList?: (AtomNode | CutNode)[]) {
        this.internalEllipse = ellipse;
        this.internalChildren = childList ?? [];
    }

    /**
     * Creates and returns a deep copy (an exact copy not at the same memory address) of this CutNode.
     * @returns Deep copy of this CutNode.
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

        //Copy all nested children individually.
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
     * Gets the bounding Ellipse of this CutNode.
     * @returns Bounding Ellipse of this CutNode. Null for The Sheet of Assertion.
     */
    public get ellipse(): Ellipse | null {
        return this.internalEllipse;
    }

    /**
     * Sets the bounding Ellipse of this CutNode to the incoming Ellipse.
     * @param ellipse Incoming Ellipse.
     */
    public set ellipse(ellipse: Ellipse | null) {
        this.internalEllipse = ellipse;
    }

    /**
     * Gets the children of this CutNode.
     * @returns Children of this CutNode.
     */
    public get children(): (AtomNode | CutNode)[] {
        return this.internalChildren;
    }

    /**
     * Sets the children of this CutNode to the incoming list of AtomNodes and CutNodes.
     * @param list Incoming list of AtomNodes and CutNodes.
     */
    public set children(list: (AtomNode | CutNode)[]) {
        this.internalChildren = list;
    }

    /**
     * Adds a child, an AtomNode or CutNode with zero or more children, to this CutNode's children.
     * @param child AtomNode or CutNode with zero or more children.
     */
    public set child(child: AtomNode | CutNode) {
        this.internalChildren.push(child);
    }

    /**
     * Completely removes all of this CutNode's children.
     */
    public clear(): void {
        this.internalChildren = [];
    }

    /**
     * Checks whether this CutNode is The Sheet of Assertion and also empty.
     * @returns True if this is an empty Sheet of Assertion.
     */
    public isEmptySheet(): boolean {
        return this.internalEllipse === null && this.internalChildren.length === 0;
    }

    /**
     * Determines and returns the deepest CutNode in which the incoming node can fit.
     * Deepest here refers to how far down the returned CutNode is in the AEGTree.
     * @param newNode Incoming node.
     * @returns Deepest CutNode in which newNode can fit.
     */
    public getCurrentCut(newNode: CutNode | AtomNode): CutNode {
        for (let i = 0; i < this.internalChildren.length; i++) {
            const child: CutNode | AtomNode = this.internalChildren[i];
            if (child instanceof CutNode && child.containsNode(newNode)) {
                //Here, newNode can be placed at least one level deeper.
                return child.getCurrentCut(newNode);
            }
        }
        return this; //Here, we are at the deepest level that newNode can fit and be placed.
    }

    /**
     * Checks whether the incoming Point is contained within this CutNode.
     * @param otherPoint Point that may be contained within this CutNode.
     * @returns True if the Point is contained within this CutNode.
     */
    public containsPoint(otherPoint: Point): boolean {
        if (this.internalEllipse === null) {
            //This CutNode is The Sheet of Assertion.
            //Every Point is contained within The Sheet of Assertion.
            return true;
        }

        return this.internalEllipse.containsPoint(otherPoint);
    }

    /**
     * Checks whether the incoming node is contained within this CutNode.
     * @param otherNode Node that may be contained within this CutNode.
     * @returns True if otherNode is contained within this CutNode.
     */
    public containsNode(otherNode: AtomNode | CutNode): boolean {
        if (this.internalEllipse === null) {
            //This CutNode is The Sheet of Assertion.
            //Every node is contained within The Sheet of Assertion.
            return true;
        }

        if (otherNode instanceof AtomNode) {
            return shapeContains(this.internalEllipse, otherNode.calcRect());
        } else {
            return shapeContains(this.internalEllipse, otherNode.internalEllipse!);
        }
    }

    /**
     * Determines and returns the deepest node containing the incoming Point.
     * Returns null if this node does not contain the incoming Point.
     * @param incomingPoint Incoming Point.
     * @returns Deepest node containing incomingPoint.
     */
    public getLowestNode(incomingPoint: Point): CutNode | AtomNode | null {
        if (!this.containsPoint(incomingPoint)) {
            return null;
        }

        for (let i = 0; i < this.internalChildren.length; i++) {
            if (this.internalChildren[i].containsPoint(incomingPoint)) {
                //If this child has no children itself, this is the deepest node.
                if (
                    this.internalChildren[i] instanceof AtomNode ||
                    (this.internalChildren[i] instanceof CutNode &&
                        (this.internalChildren[i] as CutNode).children.length === 0)
                ) {
                    return this.internalChildren[i];
                } else {
                    //If this child has children itself, we must look a level deeper.
                    return (this.internalChildren[i] as CutNode).getLowestNode(incomingPoint);
                }
            }
        }

        //None of the children contain incomingPoint, so this is the lowest node containing incomingPoint.
        return this;
    }

    /**
     * Determines and returns the parent CutNode of the deepest node containing the incoming Point.
     * @param incomingPoint Incoming Point.
     * @throws Error If incomingPoint is not contained in this CutNode.
     * @returns Parent CutNode of the deepest node containing incomingPoint. Null if none of the children contain incomingPoint.
     */
    public getLowestParent(incomingPoint: Point): CutNode | null {
        if (!this.containsPoint(incomingPoint)) {
            throw new Error("This parent " + this.toString + " does not contain the point.");
        }

        for (let i = 0; i < this.internalChildren.length; i++) {
            if (this.internalChildren[i].containsPoint(incomingPoint)) {
                //If this child has no children itself, this is the deepest node.
                if (
                    this.internalChildren[i] instanceof AtomNode ||
                    (this.internalChildren[i] instanceof CutNode &&
                        (this.internalChildren[i] as CutNode).children.length === 0)
                ) {
                    return this;
                } else {
                    //If a CutNode child with at least 1 child itself has children containing incomingPoint,
                    //We are not at the deepest level containing IncomingPoint and must recurse to find that deepest level.
                    const tempCut: CutNode = this.internalChildren[i] as CutNode;
                    for (let j = 0; j < tempCut.children.length; j++) {
                        if (tempCut.children[j].containsPoint(incomingPoint)) {
                            return tempCut.getLowestParent(incomingPoint);
                        }
                    }
                    //If none of the children of this child contain incomingPoint, but this child does,
                    //This child is the deepest node containing incomingPoint.
                    return this;
                }
            }
        }
        //If none of this node's children contain incomingPoint then return null.
        return null;
    }

    /**
     * Determines and returns the deepest level the incoming node is found in.
     * Here, level refers to the number of cuts in the AEGTree.
     * For instance, The Sheet of Assertion is level 0,
     * Inside a CutNode on the Sheet of Assertion would be level 1, so on and so forth.
     *
     * If the incoming node is found within a deeper node,
     * The current cut level is incremented and this function is called with that level as an argument.
     * @param incomingNode Incoming node.
     * @param currentLevel Current cut level.
     * @returns Deepest cut level incomingNode is found in.
     */
    public getLevel(incomingNode: CutNode | AtomNode, currentLevel: number): number {
        for (let i = 0; i < this.internalChildren.length; i++) {
            //We have found incomingNode as one of this node's children, so return the current level.
            if (this.internalChildren[i] === incomingNode) {
                return currentLevel;
            } else if (
                //If the current child is a CutNode that contains incomingNode,
                //then call this function again with the incremented cut level.
                this.internalChildren[i] instanceof CutNode &&
                (this.internalChildren[i] as CutNode).containsNode(incomingNode)
            ) {
                return (this.internalChildren[i] as CutNode).getLevel(
                    incomingNode,
                    currentLevel + 1
                );
            }
        }
        //If we have called getLevel on a CutNode with no children.
        return -1;
    }

    /**
     * Removes the lowest child of this CutNode that contains the incoming Point.
     * @param incomingPoint Incoming Point.
     * @returns True if the node containing incomingPoint was removed.
     * False if this CutNode nor its children contain incomingPoint.
     */
    public remove(incomingPoint: Point): boolean {
        if (!this.containsPoint(incomingPoint)) {
            return false;
        }

        //This CutNode definitely contains incomingPoint here.
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].containsPoint(incomingPoint)) {
                if (
                    this.children[i] instanceof AtomNode ||
                    (this.children[i] instanceof CutNode &&
                        (this.children[i] as CutNode).children.length === 0)
                ) {
                    //If the child is childless, the child must be spliced.
                    this.children.splice(i, 1);
                    return true;
                } else {
                    //Here, we have a CutNode with more than 0 children.
                    for (let j = 0; j < (this.children[i] as CutNode).children.length; j++) {
                        if (
                            (this.children[i] as CutNode).children[j].containsPoint(incomingPoint)
                        ) {
                            //If the child has children, and one of its children contains the Point, we recurse.
                            if ((this.children[i] as CutNode).children[j] instanceof AtomNode) {
                                (this.children[i] as CutNode).children.splice(j, 1);
                            } else {
                                return (
                                    (this.children[i] as CutNode).children[j] as CutNode
                                ).remove(incomingPoint);
                            }
                        }
                    }
                    //Here, we have a CutNode with more than 0 children, none of which contained incomingPoint.
                    //This CutNode's child, which is the aforementioned CutNode, is now the deepest node containing incomingPoint.
                    //So, we must splice that child.
                    this.children.splice(i, 1);
                    return true;
                }
            }
        }
        //We cannot remove a CutNode from itself.
        return false;
    }

    /**
     * Checks if this CutNode is equal to the incoming CutNode.
     * They are considered equal if they have the same children and the same number of children.
     * These children do not have to be in the same order in the children list to be considered equal.
     *
     * @param otherCut Incoming CutNode.
     * @returns True if this CutNode and otherCut are equal by the above metric.
     */
    public isEqualTo(otherCut: CutNode): boolean {
        //For two CutNodes to be equal, they must have the same number of children.
        if (this.children.length === otherCut.children.length) {
            if (this.children.length === 0) {
                //If they do not have children, they are empty cuts. Empty cuts are always equal.
                return true;
            }
            //If both have the same number of children, we must check if they are the same children.
            const thisChildren = this.copy().children;
            const otherChildren = otherCut.copy().children;

            //If both CutNodes have the same child, remove that child from both lists and continue.
            //If the same child is not present in both, the CutNodes are not equal.
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
                        //Checked all children, but a match was not found. These nodes are not equal.
                        return false;
                    }
                }
            }
            //Return if all the children have been matched and removed in both lists.
            return thisChildren.length === 0 && otherChildren.length === 0;
        }

        return false;
    }

    /**
     * Creates and returns a string representation of this CutNode and all its children.
     * This CutNode may be The Sheet of Assertion or the root of any subtree.
     *
     * () - CutNode.
     * char - AtomNode.
     * (char char ()) - Valid nesting of two AtomNodes and a CutNode inside another CutNode.
     *
     * @returns String form of this CutNode and all its children according to the above format.
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
     * Creates and returns a string representation of this CutNode.
     * @returns Children and boundary of this CutNode in string form.
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
}
