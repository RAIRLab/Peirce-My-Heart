import {AtomNode} from "./AtomNode";
import {CutNode} from "./CutNode";
import {Point} from "./Point";
import {Ellipse} from "./Ellipse";
import {Rectangle} from "./Rectangle";
import {shapesOverlap, shapesIntersect} from "./AEGUtils";

/**
 * Represents the background AEG tree structure.
 * @author Ryan Reilly
 * @author Anusha Tiwari
 */
export class AEGTree {
    /**
     * The sheet of the AEG Tree
     */
    private internalSheet: CutNode;

    /**
     * Constructs the sheet of assertion of the AEG tree
     * @param sheet (OPTIONAL) An existing cut node which is to be used to construct the sheet of
     * assertion of this AEG Tree. If given, creates a new tree with a deep copy of this node.
     */
    public constructor(sheet?: CutNode) {
        if (sheet !== undefined) {
            //If an existing cut node is passed, make a deep copy of it to copy over any children
            this.internalSheet = sheet.copy();
            //Ellipse of the sheet of assertion should be null
            this.internalSheet.ellipse = null;
        } else {
            this.internalSheet = new CutNode(null);
        }
    }

    public get sheet(): CutNode {
        return this.internalSheet;
    }

    /**
     * Modifier to set the sheet of the AEG Tree
     */
    public set sheet(sheet: CutNode) {
        this.internalSheet = sheet;
    }

    /**
     * Calls verifyAEG() with the sheet of assertion as its argument.
     * @returns the result of verifyAEG() called with the sheet of assertion
     */
    public verify(): boolean {
        return this.verifyAEG(this.internalSheet);
    }

    /**
     * Checks for consistency in the tree's structure.
     * Structural consistency is achieved when:
     * All bounding boxes of currentCut's child nodes are within the bounding box of currentCut,
     * The same is true for each CutNode within currentCut,
     * And the children of each cut level do not overlap with each other.
     * @param currentCut: The cut for which we are checking consistency.
     * @returns True, if the structure is structurally consistent. Else, false.
     */
    private verifyAEG(currentCut: CutNode): boolean {
        for (let i = 0; i < currentCut.children.length; i++) {
            //Check that all children, in this level, are in currentCut
            if (!currentCut.containsNode(currentCut.children[i])) {
                return false;
            }

            //Check for overlaps on the same level
            for (let j = i + 1; j < currentCut.children.length; j++) {
                if (this.overlaps(currentCut.children[i], currentCut.children[j])) {
                    return false;
                }
            }
        }
        for (let i = 0; i < currentCut.children.length; i++) {
            //Check one level deeper if the child is a CutNode. Recursive case
            if (
                currentCut.children[i] instanceof CutNode &&
                !this.verifyAEG(currentCut.children[i] as CutNode)
            ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks whether the given node can be inserted into this tree
     * at a given point without overlapping any bounding boxes.
     * @param incomingNode The node to be inserted.
     * @returns True, if the node can be inserted. Else, false
     */
    public canInsert(incomingNode: AtomNode | CutNode): boolean {
        const currentCut: CutNode = this.internalSheet.getCurrentCut(incomingNode);
        for (let i = 0; i < currentCut.children.length; i++) {
            if (this.intersects(incomingNode, currentCut.children[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Inserts a given node into this tree, if possible.
     * Throws an error otherwise.
     * @param incomingNode The node to be inserted
     */
    public insert(incomingNode: AtomNode | CutNode): boolean {
        if (!this.canInsert(incomingNode)) {
            throw new Error("Insertion failed. " + incomingNode + " had a collision.");
        }

        const currentCut: CutNode = this.internalSheet.getCurrentCut(incomingNode);
        const originalChildren: (AtomNode | CutNode)[] = [...currentCut.children];
        currentCut.child = incomingNode;

        if (incomingNode instanceof CutNode) {
            for (let i = originalChildren.length - 1; i >= 0; i--) {
                if (incomingNode.containsNode(originalChildren[i])) {
                    incomingNode.child = originalChildren[i];
                    currentCut.children.splice(i, 1);
                }
            }
        }

        return true;
    }

    /**
     * Finds the lowest node that contains the point in the AEG.
     * @param incomingPoint The point on the canvas
     * @return The lowest node containing the point
     */
    public getLowestNode(incomingPoint: Point): CutNode | AtomNode | null {
        return this.internalSheet.getLowestNode(incomingPoint);
    }

    /**
     * Finds the parent of the lowest node that contains the point in the AEG.
     * @param incomingPoint The point on the canvas
     * @return The parent of the lowest node containing the point
     */
    public getLowestParent(incomingPoint: Point): CutNode | null {
        return this.internalSheet.getLowestParent(incomingPoint);
    }

    /**
     * Finds the depth of the node within the tree.
     * @param incomingNode The node to be searched for
     * @returns The level of the searched for node
     */
    public getLevel(incomingNode: CutNode | AtomNode): number {
        return this.internalSheet.getLevel(incomingNode, 0);
    }

    /**
     * Removes the node containing this coordinate
     * @param incomingPoint The point indicating the node that must be removed
     * @returns True, if the node was successfully removed. Else, false
     */
    public remove(incomingPoint: Point): boolean {
        return this.internalSheet.remove(incomingPoint);
    }

    /**
     * Removes all of the sheet's children.
     */
    public clear() {
        this.internalSheet.clear();
    }

    /**
     * Determines if the incoming node's boundaries intersect the other node's boundaries.
     * @param incomingNode the incoming node
     * @param otherNode the other node
     * @returns the result of each shape's respective intersect() methods.
     */
    private intersects(incomingNode: AtomNode | CutNode, otherNode: AtomNode | CutNode) {
        const incomingShape: Rectangle | Ellipse =
            incomingNode instanceof AtomNode ? incomingNode.calcRect() : incomingNode.ellipse!;
        const otherShape: Rectangle | Ellipse =
            otherNode instanceof AtomNode ? otherNode.calcRect() : otherNode.ellipse!;

        return shapesIntersect(incomingShape, otherShape);
    }

    /**
     * Determines if the incoming node's boundaries overlap the other node's boundaries.
     * @param incomingNode the incoming node
     * @param otherNode the other node
     * @returns the result of each shape's respective overlaps() methods.
     */
    private overlaps(incomingNode: AtomNode | CutNode, otherNode: AtomNode | CutNode): boolean {
        let ellipse1: Ellipse;
        let ellipse2: Ellipse;

        if (incomingNode instanceof AtomNode) {
            if (otherNode instanceof AtomNode) {
                return shapesOverlap(
                    (incomingNode as AtomNode).calcRect(),
                    (otherNode as AtomNode).calcRect()
                );
            } else {
                //the case where otherNode is the sheet is handled in canInsert()
                //and all child.ellipse[i] will never be null. this is the reason for ! below

                ellipse1 = (otherNode as CutNode).ellipse!;
                return shapesOverlap((incomingNode as AtomNode).calcRect(), ellipse1);
            }
        } else {
            if (otherNode instanceof AtomNode) {
                ellipse1 = (incomingNode as CutNode).ellipse!;
                return shapesOverlap(ellipse1, (otherNode as AtomNode).calcRect());
            } else {
                ellipse1 = (incomingNode as CutNode).ellipse!;
                ellipse2 = (otherNode as CutNode).ellipse!;
                return shapesOverlap(ellipse1, ellipse2);
            }
        }
    }

    /**
     * Method that checks if an AEG Tree is equal to another AEG Tree. Trees are equal if they have
     * the same children, irrespective of the ordering of nodes within a level
     * @param otherTree The tree we want to check for equality with
     * @returns True, if the trees are equal. Else, false
     */
    public isEqualTo(otherTree: AEGTree): boolean {
        //For 2 trees to be equal, they must have the same number of children
        if (this.sheet.children.length === otherTree.sheet.children.length) {
            if (this.sheet.children.length === 0) {
                //Both trees are empty trees => they are equal
                return true;
            }
            return this.sheet.isEqualTo(otherTree.sheet);
        }
        return false;
    }

    /**
     * Method that returns a string representation of the AEG Tree
     * @returns The structure formed by the cuts and atoms in this AEG Tree
     */
    public toString(): string {
        return this.internalSheet.toFormulaString();
    }
}
