/**
 * File containing insertion node movement event handlers.
 * @author Anusha Tiwari
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "../DrawModes/DragTool";
import {redrawProof} from "../DrawModes/DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {
    validateChildren,
    drawAltered,
    insertChildren,
    alterAtom,
    alterCut,
} from "../DrawModes/EditModeUtils";
import {AEGTree} from "../AEG/AEGTree";
import {ProofNode} from "../AEG/ProofNode";

//The selected subgraph that we will be placing
let currentGraphs: (CutNode | AtomNode)[];

//The parent identified the position where we are trying to insert the incoming node
let currentParent: CutNode | AtomNode | null;

//The tree that we are trying to insert the graph into
let currentTree: AEGTree;

//Whether or not the node is allowed to be inserted in that place.
let legalPlace: boolean;

//Whether or not the node being placed is a legal node
let legalNode: boolean;

export function insertionMouseDown(event: MouseEvent) {
    //Create a deep copy of the tree we are trying to insert the incoming node into so that we can
    //modify it as needed without affecting the actual structure
    currentTree = new AEGTree(treeContext.getLastProofStep().tree.sheet);
    currentGraphs = treeContext.selectForProof.sheet.children;
    const startingPoint = new Point(event.x - offset.x, event.y - offset.y);

    //we can insert only a single subgraph at a time
    if (treeContext.proofHistory.length > 0 && currentGraphs.length === 1) {
        //As long as there are graphs to be placed, they are legal nodes
        legalNode = true;

        //The change in the original position of the node vs the new position we are placing it on
        const newPoint = calculatePoint(event, currentGraphs[0]);

        //Get node we have clicked to insert within. If the node is an atom node, get its parent cut
        currentParent =
            currentTree.getLowestNode(startingPoint) instanceof AtomNode
                ? currentTree.getLowestParent(startingPoint)
                : currentTree.getLowestNode(startingPoint);

        if (newPoint) {
            //Create a temporary node with the altered values of the location we are placing it on
            const newNode =
                currentGraphs[0] instanceof AtomNode
                    ? alterAtom(currentGraphs[0], newPoint)
                    : alterCut(currentGraphs[0], newPoint);

            //If the node being placed is not contained within the parent node at the given position,
            //get the parent of that node. Repeat this until we find the actual parent that contains
            //the new node
            while (currentParent !== null && !(currentParent as CutNode).containsNode(newNode)) {
                currentParent = currentTree.getParent(currentParent);
            }
            //According to rule of insertion, we can insert 1 graph at a time only on odd levels ->
            //check to ensure that the new point where we are pasting is on an odd level.
            //For the placement to be an odd level, its parent must be on an even level
            if (
                currentParent !== null &&
                currentParent instanceof CutNode &&
                currentParent.ellipse !== null &&
                currentTree.getLevel(currentParent) % 2 === 0
            ) {
                //Check if the node can be placed at that position, and draw it accordingly
                let color = "";
                if (currentGraphs[0] instanceof CutNode) {
                    color = validateChildren(currentTree, currentGraphs[0], newPoint)
                        ? legalColor()
                        : illegalColor();
                } else if (currentGraphs[0] instanceof AtomNode) {
                    const tempAtom: AtomNode = alterAtom(currentGraphs[0], newPoint);
                    color = currentTree.canInsert(tempAtom) ? legalColor() : illegalColor();
                }
                legalPlace = color === legalColor() ? true : false;
                drawAltered(currentGraphs[0], color, newPoint);
            } else {
                legalPlace = false;
                drawAltered(currentGraphs[0], illegalColor(), newPoint);
            }
        }
    } else {
        legalPlace = false;
        legalNode = false;
    }
}

export function insertionMouseMove(event: MouseEvent) {
    if (legalNode) {
        const movePoint: Point = new Point(event.x - offset.x, event.y - offset.y);

        redrawProof();

        if (treeContext.proofHistory.length > 0 && currentGraphs.length === 1) {
            const newPoint = calculatePoint(event, currentGraphs[0]);
            currentParent =
                currentTree.getLowestNode(movePoint) instanceof AtomNode
                    ? currentTree.getLowestParent(movePoint)
                    : currentTree.getLowestNode(movePoint);

            if (newPoint) {
                const newNode =
                    currentGraphs[0] instanceof AtomNode
                        ? alterAtom(currentGraphs[0], newPoint)
                        : alterCut(currentGraphs[0], newPoint);

                while (
                    currentParent !== null &&
                    !(currentParent as CutNode).containsNode(newNode)
                ) {
                    currentParent = currentTree.getParent(currentParent);
                }

                if (
                    currentParent !== null &&
                    currentParent instanceof CutNode &&
                    currentParent.ellipse !== null &&
                    currentTree.getLevel(currentParent) % 2 === 0
                ) {
                    let color = "";
                    if (currentGraphs[0] instanceof CutNode) {
                        color = validateChildren(currentTree, currentGraphs[0], newPoint)
                            ? legalColor()
                            : illegalColor();
                    } else if (currentGraphs[0] instanceof AtomNode) {
                        const tempAtom: AtomNode = alterAtom(currentGraphs[0], newPoint);
                        color = currentTree.canInsert(tempAtom) ? legalColor() : illegalColor();
                    }

                    legalPlace = color === legalColor() ? true : false;
                    drawAltered(currentGraphs[0], color, newPoint);
                } else {
                    legalPlace = false;
                    drawAltered(currentGraphs[0], illegalColor(), newPoint);
                }
            }
        } else {
            legalPlace = false;
        }
    }
}

export function insertionMouseUp(event: MouseEvent) {
    //If it is a legal node and is being placed at a legal position, insert it into the tree
    if (legalNode && legalPlace) {
        if (treeContext.proofHistory.length > 0 && currentGraphs.length === 1) {
            //Calculate the point where the node has to be placed
            const newPoint = calculatePoint(event, currentGraphs[0]);

            //Insert the node, and its children if it has any
            if (newPoint) {
                if (currentGraphs[0] instanceof CutNode) {
                    insertChildren(currentGraphs[0], newPoint, currentTree);
                } else if (currentGraphs[0] instanceof AtomNode) {
                    const tempAtom: AtomNode = alterAtom(currentGraphs[0], newPoint);
                    currentTree.insert(tempAtom);
                }
                //Insertion is a new step -> push a new node in the proof, signifying it as such
                treeContext.proofHistory.push(new ProofNode(currentTree, "Insertion"));
            }
        }
    }
    redrawProof();
    legalNode = false;
}

export function insertionMouseOut() {
    legalNode = false;
    redrawProof();
}

/**
 * Calculates the difference between the original position of the node in the draw canvas and the
 * new position we are placing it on the proof canvas
 * @param event The mouse event that identifies our new position
 * @param graph The node we are trying to place
 * @returns The difference between the original position and the new position
 */
function calculatePoint(event: MouseEvent, node: CutNode | AtomNode): Point | undefined {
    if (node instanceof CutNode && node.ellipse !== null) {
        return new Point(
            event.x - node.ellipse.center.x - offset.x,
            event.y - node.ellipse.center.y - offset.y
        );
    } else if (node instanceof AtomNode) {
        return new Point(event.x - node.origin.x - offset.x, event.y - node.origin.y - offset.y);
    }

    return undefined;
}
