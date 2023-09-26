import {AtomNode} from "./AtomNode";
import {CutNode} from "./CutNode";
import {Point} from "./Point";

export class AEGTree {
    sheet: CutNode;

    public constructor(sheet?: CutNode) {
        this.sheet = sheet ?? new CutNode();
        this.sheet.ellipse = null;
    }

    /**
     * Method that recursively ensures the bounding box structure of this AEG is consistent with
     * the hierarchy. It is consistent if bounding boxes of children nodes are within the bounding
     * box of the parent node.
     * @returns True, if the structure is consistent. Else, false.
     */
    public verifyAEG(): boolean {
        return this.sheet.verifyCut();
    }

    /**
     * Method that checks whether the given node can be inserted into this tree
     * at a given point without overlapping any bounding boxes.
     * @param incomingNode The node to be inserted.
     * @param insertionPoint The point at which the node must be inserted
     * @returns True, if the node can be inserted. Else, false
     */
    public canInsertAEG(incomingNode: AtomNode | CutNode, insertionPoint: Point): boolean {
        return this.sheet.canInsert(incomingNode, insertionPoint);
    }

    /**
     * Method that inserts a given node into this tree at a given point.
     * @param incomingNode The node to be inserted
     * @param insertionPoint The point at which the node should be inserted
     */
    public insertAEG(incomingNode: AtomNode | CutNode, insertionPoint: Point): void {
        if (this.canInsertAEG(incomingNode, insertionPoint)) {
            this.sheet.insert(incomingNode, insertionPoint);
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
}
