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
import {validateChildren, drawAltered, insertChildren, alterNode} from "../DrawModes/EditModeUtils";
import {AEGTree} from "../AEG/AEGTree";
import {ProofNode} from "../AEG/ProofNode";

//The selected subgraph that we will be placing
let currentNode: CutNode | AtomNode;

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
    currentTree = new AEGTree();
    if (treeContext.currentProofStep) {
        currentTree.sheet = treeContext.currentProofStep.tree.sheet.copy();
    }
    const selectedNodes = treeContext.selectForProof.sheet.children;
    const startingPoint = new Point(event.x - offset.x, event.y - offset.y);

    //we can insert only a single subgraph at a time
    if (treeContext.proof.length > 0 && selectedNodes.length === 1) {
        //As long as there are graphs to be placed, they are legal nodes
        legalNode = true;
        currentNode = selectedNodes[0];

        //The change in the original position of the node vs the new position we are placing it on
        const newPoint = calculatePoint(event, currentNode);

        //Get node we have clicked to insert within. If the node is an atom node, get its parent cut
        const tempNode = currentTree.getLowestNode(startingPoint);
        const tempParent = currentTree.getLowestParent(startingPoint);
        currentParent = tempNode instanceof AtomNode ? tempParent : tempNode;

        if (newPoint) {
            //Create a temporary node with the altered values of the new node at the location we
            //are placing it on
            const newNode = alterNode(currentNode, newPoint);

            //If the node being placed is not contained within the parent node at the given position,
            //it is being placed in a position which will result in adoption of nodes. This is
            //considered illegal -> mark it as such
            if (currentParent !== null && !(currentParent as CutNode).containsNode(newNode)) {
                legalPlace = false;
                drawAltered(currentNode, illegalColor(), newPoint);
            } else {
                //According to rule of insertion, we can insert 1 graph at a time only on odd levels.
                //Check to ensure that the new point where we are pasting is on an odd level (for
                //the placement to be an odd level, its parent must be on an even level).
                if (
                    currentParent !== null &&
                    currentParent instanceof CutNode &&
                    currentParent.ellipse !== null &&
                    currentTree.getLevel(currentParent) % 2 === 0
                ) {
                    //Insertion also does not allow for adoption of nodes, so check to make sure we are
                    //not adopting any children of the node we are being placed in
                    if (newNode instanceof CutNode) {
                        legalPlace = true;
                        for (let i = 0; i < currentParent.children.length; i++) {
                            //The new node contains a child of the node it is being placed in - this
                            //is an illegal placement, as it would result in adoption
                            if (newNode.containsNode(currentParent.children[i])) {
                                legalPlace = false;
                                break;
                            }
                        }
                    } else {
                        //An atom node cannot contain any other nodes. This node is being placed
                        //at the right level
                        legalPlace = true;
                    }

                    if (legalPlace) {
                        //We have confirmed that the node can be placed at this level without
                        //adopting any existing nodes. However, we still need to check for any
                        //collisions within this level
                        let color = "";
                        if (currentNode instanceof CutNode) {
                            const legalChildren = validateChildren(
                                currentTree,
                                currentNode,
                                newPoint
                            );
                            color = legalChildren ? legalColor() : illegalColor();
                        } else if (currentNode instanceof AtomNode) {
                            const tempAtom: AtomNode = alterNode(currentNode, newPoint) as AtomNode;
                            const canInsert = currentTree.canInsert(tempAtom);
                            color = canInsert ? legalColor() : illegalColor();
                        }
                        legalPlace = color === legalColor() ? true : false;
                        drawAltered(currentNode, color, newPoint);
                    } else {
                        drawAltered(currentNode, illegalColor(), newPoint);
                    }
                } else {
                    legalPlace = false;
                    drawAltered(currentNode, illegalColor(), newPoint);
                }
            }
        }
    } else {
        legalPlace = false;
        legalNode = false;
        drawAltered(currentNode, illegalColor(), startingPoint);
    }
}

export function insertionMouseMove(event: MouseEvent) {
    if (legalNode) {
        const movePoint: Point = new Point(event.x - offset.x, event.y - offset.y);

        //Reset the canvas by redrawing our current proof structure
        redrawProof();
        const newPoint = calculatePoint(event, currentNode);

        //Get node we have clicked to insert within. If the node is an atom node, get its parent
        const tempNode = currentTree.getLowestNode(movePoint);
        const tempParent = currentTree.getLowestParent(movePoint);
        currentParent = tempNode instanceof AtomNode ? tempParent : tempNode;

        if (newPoint) {
            //Create a temporary node with the altered values of the new node at the location we
            //are placing it on
            const newNode = alterNode(currentNode, newPoint);

            //If the node being placed is not contained within the parent node at the given
            //position, it is being placed in a position which will result in adoption of nodes.
            //This is considered illegal -> mark it as such
            if (currentParent !== null && !(currentParent as CutNode).containsNode(newNode)) {
                legalPlace = false;
                drawAltered(currentNode, illegalColor(), newPoint);
            } else {
                //According to rule of insertion, we can insert 1 graph at a time only on odd
                //levels. Check to ensure that the new point where we are pasting is on an odd
                //level (for the placement to be an odd level, its parent must be on an even
                //level).
                if (
                    currentParent !== null &&
                    currentParent instanceof CutNode &&
                    currentParent.ellipse !== null &&
                    currentTree.getLevel(currentParent) % 2 === 0
                ) {
                    //Insertion also does not allow for adoption of nodes, so check to make
                    //sure we are not adopting any children of the node we are being placed in
                    if (newNode instanceof CutNode) {
                        legalPlace = true;
                        for (let i = 0; i < currentParent.children.length; i++) {
                            //The new node contains a child of the node it is being placed in - this
                            //is an illegal placement, as it would result in adoption
                            if (newNode.containsNode(currentParent.children[i])) {
                                legalPlace = false;
                                break;
                            }
                        }
                    } else {
                        //An atom node cannot contain any other nodes. This node is being placed
                        //at the right level
                        legalPlace = true;
                    }

                    if (legalPlace) {
                        //We have confirmed that the node can be placed at this level without
                        //adopting any existing nodes. However, we still need to check for any
                        //collisions within this level
                        let color = "";
                        if (currentNode instanceof CutNode) {
                            const legalChildren = validateChildren(
                                currentTree,
                                currentNode,
                                newPoint
                            );
                            color = legalChildren ? legalColor() : illegalColor();
                        } else if (currentNode instanceof AtomNode) {
                            const tempAtom: AtomNode = alterNode(currentNode, newPoint) as AtomNode;
                            const canInsert = currentTree.canInsert(tempAtom);
                            color = canInsert ? legalColor() : illegalColor();
                        }
                        legalPlace = color === legalColor() ? true : false;
                        drawAltered(currentNode, color, newPoint);
                    } else {
                        drawAltered(currentNode, illegalColor(), newPoint);
                    }
                } else {
                    legalPlace = false;
                    drawAltered(currentNode, illegalColor(), newPoint);
                }
            }
        }
    } else {
        legalPlace = false;
    }
}

export function insertionMouseUp(event: MouseEvent) {
    //If it is a legal node and is being placed at a legal position, insert it into the tree
    if (legalNode && legalPlace) {
        //Calculate the point where the node has to be placed
        const newPoint = calculatePoint(event, currentNode);

        //Insert the node, and its children if it has any
        if (newPoint) {
            if (currentNode instanceof CutNode) {
                insertChildren(currentNode, newPoint, currentTree);
            } else if (currentNode instanceof AtomNode) {
                const tempAtom: AtomNode = alterNode(currentNode, newPoint) as AtomNode;
                currentTree.insert(tempAtom);
            }
            //Insertion is a new step -> push a new node in the proof, signifying it as such
            treeContext.pushToProof(new ProofNode(currentTree, "Insertion"));
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
