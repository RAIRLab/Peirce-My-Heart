import {AtomNode} from "./AtomNode";
import {CutNode} from "./CutNode";
import {Ellipse} from "./Ellipse";
import {Point} from "./Point";
import {Rectangle} from "./Rectangle";
import {shapesIntersect, shapesOverlap} from "./AEGUtils";

/**
 * Represents an AEG tree structure.
 * This tree is a hierarchical composition of AtomNodes and CutNodes.
 * Its height corresponds to the deepest CutNode nesting within.
 *
 * @author Ryan Reilly
 * @author Anusha Tiwari
 */
export class AEGTree {
    /**
     * The Sheet of Assertion of this AEGTree.
     */
    private internalSheet: CutNode;

    /**
     * Constructs The Sheet of Assertion of this AEGTree.
     *
     * @param sheet Existing CutNode used to construct The Sheet of Assertion for this AEGTree.
     */
    public constructor(sheet?: CutNode) {
        if (sheet !== undefined) {
            //If an existing CutNode is passed in, create a deep copy of it to copy over any children.
            this.internalSheet = sheet.copy();
            //Ellipse of The Sheet of Assertion must be null.
            this.internalSheet.ellipse = null;
        } else {
            this.internalSheet = new CutNode(null);
        }
    }

    /**
     * Gets The Sheet of Assertion of this AEGTree.
     * @returns The Sheet of Assertion of this AEGTree.
     */
    public get sheet(): CutNode {
        return this.internalSheet;
    }

    /**
     * Set The Sheet of Assertion of this AEGTree to the incoming CutNode.
     * @param sheet Incoming CutNode.
     */
    public set sheet(sheet: CutNode) {
        this.internalSheet = sheet;
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
     * Finds the lowest node that contains the point in the AEG.
     * @param incomingPoint The point on the canvas
     * @return The lowest node containing the point
     */
    public getLowestNode(incomingPoint: Point): CutNode | AtomNode | null {
        return this.internalSheet.getLowestNode(incomingPoint);
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
     * Verifies the structural consistency of this AEGTree.
     *
     * Structural consistency is achieved when:
     * All bounding boxes of The Sheet's children do not overlap,
     * The same is true for each CutNode within The Sheet and that CutNode's children,
     * And none of the children at any cut level overlap each other.
     *
     * @returns True if structural consistency is achieved.
     */
    public verify(): boolean {
        return this.verifyAEG(this.internalSheet);
    }

    /**
     * Verifies the structural consistency of this AEGTree's CutNodes and AtomNodes.
     *
     * Structural consistency is achieved when:
     * All bounding boxes of currentCut's children are within the boundary of currentCut,
     * The same is true for each CutNode within currentCut and that CutNode's children,
     * And none of the children at any cut level overlap each other.
     *
     * @param currentCut CutNode for which we are checking structural consistency.
     * @returns True if structural consistency is achieved.
     */
    private verifyAEG(currentCut: CutNode): boolean {
        for (let i = 0; i < currentCut.children.length; i++) {
            //Check that all children, in this level, are in currentCut.
            if (!currentCut.containsNode(currentCut.children[i])) {
                return false;
            }

            for (let j = i + 1; j < currentCut.children.length; j++) {
                //Check that there are no overlaps for the children on this level.
                if (this.overlaps(currentCut.children[i], currentCut.children[j])) {
                    return false;
                }
            }
        }
        for (let i = 0; i < currentCut.children.length; i++) {
            //Check one level deeper for overlaps if this child is a CutNode.
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
     * Checks whether the incoming node can be inserted into this AEGTree.
     *
     * @param incomingNode Incoming node.
     * @returns True if the incomingNode can be inserted.
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
     * Inserts the incoming node into this tree, if insertion is possible.
     *
     * @param incomingNode Incoming node.
     * @throws Error If insertion of incomingNode is not possible.
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
     * Removes the node containing the incoming Point.
     *
     * @param incomingPoint Incoming Point.
     * @returns True if the node containing incomingPoint was removed.
     */
    public remove(incomingPoint: Point): boolean {
        return this.internalSheet.remove(incomingPoint);
    }

    /**
     * Removes all of The Sheet of Assertion's children.
     */
    public clear(): void {
        this.internalSheet.clear();
    }

    /**
     * Checks if one incoming node's boundaries intersect another incoming node's boundaries.
     *
     * @param incomingNode One incoming node.
     * @param otherNode Another incoming node.
     * @returns True on intersection between incomingNode's and otherNode's shapes.
     */
    private intersects(incomingNode: AtomNode | CutNode, otherNode: AtomNode | CutNode): boolean {
        const incomingShape: Rectangle | Ellipse =
            incomingNode instanceof AtomNode ? incomingNode.calcRect() : incomingNode.ellipse!;
        const otherShape: Rectangle | Ellipse =
            otherNode instanceof AtomNode ? otherNode.calcRect() : otherNode.ellipse!;

        return shapesIntersect(incomingShape, otherShape);
    }

    /**
     * Checks if one incoming node's boundaries overlap another incoming node's boundaries.
     *
     * @param incomingNode One incoming node.
     * @param otherNode Another incoming node.
     * @returns True on overlap between incomingNode's and otherNode's shapes.
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
                //Case where otherNode is the sheet is handled in canInsert().
                //Here, all child.ellipse[i] will never be null. This is the reason for ! below.

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
     * Checks if this AEGTree is equal to the incoming AEGTree.
     * These are considered equal if they have the same children and the same number of children in the same hierarchy.
     * In a given CutNode, these children do not have to be in the same order to be considered equal.
     *
     * @param otherTree incoming AEGTree.
     * @returns True if the trees are equal by the above metric.
     */
    public isEqualTo(otherTree: AEGTree): boolean {
        //For two AEGTrees to be equal, their Sheets of Assertion must be equal.
        return this.sheet.isEqualTo(otherTree.sheet);
    }

    /**
     * Returns a string representation of this AEGTree.
     * @returns Structured ordering of all children in this AEGTree in string form.
     */
    public toString(): string {
        return this.internalSheet.toFormulaString();
    }
}
