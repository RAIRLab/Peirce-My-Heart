/**
 * File containing multi node movement event handlers.
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "../DrawModes/DragTool";
import {drawAtom, redrawTree} from "../DrawModes/DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {validateChildren, drawAltered, insertChildren, alterAtom} from "../DrawModes/EditModeUtils";
import {AEGTree} from "../AEG/AEGTree";
import {ProofNode} from "../AEG/ProofNode";

//The initial point the user pressed down.
let startingPoint: Point;

//The selected subgraph that we will be placing
let currentGraph: (CutNode | AtomNode)[] | null;

//The parent identified the position where we are trying to insert the incoming node
let currentParent: CutNode | null;

//The tree that we are trying to insert the graph into
let currentTree: AEGTree;

//Whether or not the node is allowed to be inserted (not the sheet).
let legalNode: boolean;

//Whether or not applying this rule will result in the creation of a new node for our proof
let newNode: boolean;

export function insertionMouseDown(event: MouseEvent) {
    console.log("selected: " + treeContext.selectForProof.toString());
    //Create a deep copy of the tree we are trying to insert the incoming node into so that we can
    //modify it as needed without affecting the actual structure
    currentTree = new AEGTree(treeContext.getLastProofStep().tree.sheet);
    currentGraph = treeContext.selectForProof.sheet.children;
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);

    if (currentGraph.length > 0) {
        if (treeContext.proofHistory.length > 1) {
            currentParent = currentTree.getLowestParent(startingPoint);

            //According to rule of insertion, we can only insert on odd levels -> check to
            //ensure that the new point where we are pasting is on an odd level
            if (currentParent !== null && currentTree.getLevel(currentParent) % 2 === 1) {
                legalNode = true;
                newNode = true;

                if (currentGraph instanceof CutNode) {
                    const color = validateChildren(currentTree, currentGraph, startingPoint)
                        ? legalColor()
                        : illegalColor();
                    drawAltered(currentGraph, color, startingPoint);
                } else if (currentGraph instanceof AtomNode) {
                    const tempAtom: AtomNode = alterAtom(currentGraph, startingPoint);
                    const color = treeContext.tree.canInsert(tempAtom)
                        ? legalColor()
                        : illegalColor();
                    drawAtom(tempAtom, color, true);
                }
            } else {
                //If not on odd level, it is an illegal insertion. Highlight as such to signify
                if (currentGraph instanceof CutNode) {
                    drawAltered(currentGraph, illegalColor(), startingPoint);
                } else if (currentGraph instanceof AtomNode) {
                    const tempAtom: AtomNode = alterAtom(currentGraph, startingPoint);
                    drawAtom(tempAtom, illegalColor(), true);
                }
            }
        } else {
            if (currentTree.sheet.isEmptySheet()) {
                legalNode = true;
                newNode = false;
            } else {
                legalNode = false;
            }
        }
    } else {
        legalNode = false;
    }
}

export function insertionMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawTree(currentTree);
        currentParent = currentTree.getLowestParent(moveDifference);

        if (currentParent !== null && currentTree.getLevel(currentParent) % 2 === 1) {
            if (currentGraph instanceof CutNode) {
                const color = validateChildren(currentTree, currentGraph, startingPoint)
                    ? legalColor()
                    : illegalColor();
                drawAltered(currentGraph, color, startingPoint);
            } else if (currentGraph instanceof AtomNode) {
                const tempAtom: AtomNode = alterAtom(currentGraph, startingPoint);
                const color = treeContext.tree.canInsert(tempAtom) ? legalColor() : illegalColor();
                drawAtom(tempAtom, color, true);
            }
        } else {
            if (currentGraph instanceof CutNode) {
                drawAltered(currentGraph, illegalColor(), startingPoint);
            } else if (currentGraph instanceof AtomNode) {
                const tempAtom: AtomNode = alterAtom(currentGraph, startingPoint);
                drawAtom(tempAtom, illegalColor(), true);
            }
        }
    }
}

export function insertionMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        currentParent = currentTree.getLowestParent(moveDifference);

        if (currentParent !== null && currentTree.getLevel(currentParent) % 2 === 1) {
            if (currentGraph instanceof CutNode) {
                if (validateChildren(currentTree, currentGraph, moveDifference)) {
                    insertChildren(currentGraph, moveDifference);
                }
            } else if (currentGraph instanceof AtomNode) {
                const tempAtom: AtomNode = alterAtom(currentGraph, moveDifference);

                if (currentTree.canInsert(tempAtom)) {
                    currentTree.insert(tempAtom);
                }
            }
        }

        if (newNode) {
            treeContext.proofHistory.push(new ProofNode(currentTree, "Insertion"));
        } else {
            treeContext.getLastProofStep().tree = currentTree;
            treeContext.getLastProofStep().appliedRule = "Insertion";
        }
    }
    redrawTree(currentTree);
    legalNode = false;
}

export function insertionMouseOut() {
    legalNode = false;
    newNode = false;
    redrawTree(treeContext.getLastProofStep().tree);
}
