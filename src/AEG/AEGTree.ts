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
    sheet: CutNode;

    public constructor(sheet?: CutNode) {
        this.sheet = sheet ?? new CutNode(null);
    }

    /**
     * Calls verifyAEG() with the sheet of assertion as its argument.
     * @returns the result of verifyAEG() called with the sheet of assertion
     */
    public verify(): boolean {
        return this.verifyAEG(this.sheet);
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
        const currentCut: CutNode = this.sheet.getCurrentCut(incomingNode);
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
    public insert(incomingNode: AtomNode | CutNode): void {
        if (!this.canInsert(incomingNode)) {
            throw new Error("Insertion failed. " + incomingNode + " had a collision.");
        }

        const currentCut: CutNode = this.sheet.getCurrentCut(incomingNode);
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
    }

    /**
     * Removes the node containing this coordinate
     * @param incomingPoint The point indicating the node that must be removed
     * @returns True, if the node was successfully removed. Else, false
     */
    public remove(incomingPoint: Point): void {
        this.sheet.remove(incomingPoint);
    }

    /**
     * Determines if the incoming node's boundaries intersect the other node's boundaries.
     * @param incomingNode the incoming node
     * @param otherNode the other node
     * @returns the result of each shape's respective intersect() methods.
     */
    private intersects(incomingNode: AtomNode | CutNode, otherNode: AtomNode | CutNode) {
        const incomingShape: Rectangle | Ellipse =
            incomingNode instanceof AtomNode ? incomingNode.rectangle : incomingNode.ellipse!;
        const otherShape: Rectangle | Ellipse =
            otherNode instanceof AtomNode ? otherNode.rectangle : otherNode.ellipse!;

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
                    (incomingNode as AtomNode).rectangle,
                    (otherNode as AtomNode).rectangle
                );
            } else {
                //the case where otherNode is the sheet is handled in canInsert()
                //and all child.ellipse[i] will never be null. this is the reason for ! below

                ellipse1 = (otherNode as CutNode).ellipse!;
                return shapesOverlap((incomingNode as AtomNode).rectangle, ellipse1);
            }
        } else {
            if (otherNode instanceof AtomNode) {
                ellipse1 = (incomingNode as CutNode).ellipse!;
                return shapesOverlap(ellipse1, (otherNode as AtomNode).rectangle);
            } else {
                ellipse1 = (incomingNode as CutNode).ellipse!;
                ellipse2 = (otherNode as CutNode).ellipse!;
                return shapesOverlap(ellipse1, ellipse2);
            }
        }
    }

    public toString(): string {
        console.log(this.sheet);
        return this.sheet.toFormulaString();
    }
}
