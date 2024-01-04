/**
 * @file Contains methods for the insertion inference rule.
 * Nodes are considered legal if they are graphs and able to be placed.
 * @author Anusha Tiwari
 */

import * as EditModeUtils from "../SharedToolUtils/EditModeUtils";
import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {
    changeCursorStyle,
    determineAndChangeCursorStyle,
    redrawProof,
} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {getCurrentProofTree} from "./ProofToolUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofNode} from "../Proof/ProofNode";
import {TreeContext} from "../TreeContext";

//Node in question.
let currentNode: CutNode | AtomNode;

//Parent of currentNode.
let currentParent: CutNode | AtomNode | null;

//AEGTree we want to insert currentNode into.
let currentTree: AEGTree;

//True if a placement is legal.
let legalPlace: boolean;

//True if a node is legal.
let legalNode: boolean;

/**
 * Stores the coordinates given by the incoming MouseEvent.
 * Then determines if it is possible to insert currentNode at these coordinates.
 * If so, sets legality to true and highlights accordingly.
 *
 * It is possible to insert currentNode at these coordinates if
 * the cut level is odd, and
 * currentNode and none of its children overlap nodes in the existing proof tree.
 *
 * @param event Incoming MouseEvent.
 */
export function insertionMouseDown(event: MouseEvent): void {
    currentTree = getCurrentProofTree();
    const selectedNodes = TreeContext.selectForProof.sheet.children;
    const startingPoint = new Point(event.x - offset.x, event.y - offset.y);

    if (TreeContext.proof.length > 0 && selectedNodes.length === 1) {
        legalNode = true;
        currentNode = selectedNodes[0];
        const newPoint = calculatePoint(event, currentNode);

        const tempNode = currentTree.getLowestNode(startingPoint);
        const tempParent = currentTree.getLowestParent(startingPoint);
        currentParent = tempNode instanceof AtomNode ? tempParent : tempNode;

        if (newPoint) {
            const newNode = EditModeUtils.alterNode(currentNode, newPoint);

            //Insertion does not allow for node adoption (i.e changing parents).
            //Adopted nodes result in an invalid insertion.
            if (currentParent !== null && !(currentParent as CutNode).containsNode(newNode)) {
                changeCursorStyle("cursor: no-drop");
                legalPlace = false;
                EditModeUtils.drawAltered(currentNode, illegalColor(), newPoint);
            } else {
                //By insertion, we can insert 1 graph at a time only on odd levels.
                //This means that currentParent must be on an even level.
                if (
                    currentParent !== null &&
                    currentParent instanceof CutNode &&
                    currentParent.ellipse !== null &&
                    currentTree.getLevel(currentParent) % 2 === 0
                ) {
                    //Insertion also does not allow for node adoption in any children.
                    if (newNode instanceof CutNode) {
                        legalPlace = true;
                        for (let i = 0; i < currentParent.children.length; i++) {
                            //newNode adopted a child of the parent.
                            if (newNode.containsNode(currentParent.children[i])) {
                                legalPlace = false;
                                break;
                            }
                        }
                    } else {
                        //AtomNodes cannot contain children.
                        legalPlace = true;
                    }

                    if (legalPlace) {
                        //currentNode can be placed here, but we must check for collisions.
                        let color = "";
                        if (currentNode instanceof CutNode) {
                            const legalChildren = EditModeUtils.validateChildren(
                                currentTree,
                                currentNode,
                                newPoint
                            );
                            color = legalChildren ? legalColor() : illegalColor();
                        } else if (currentNode instanceof AtomNode) {
                            const tempAtom: AtomNode = EditModeUtils.alterNode(
                                currentNode,
                                newPoint
                            ) as AtomNode;
                            const canInsert = currentTree.canInsert(tempAtom);
                            color = canInsert ? legalColor() : illegalColor();
                        }
                        legalPlace = color === legalColor() ? true : false;
                        EditModeUtils.drawAltered(currentNode, color, newPoint);
                        determineAndChangeCursorStyle(color, "cursor: copy", "cursor: no-drop");
                    } else {
                        changeCursorStyle("cursor: no-drop");
                        EditModeUtils.drawAltered(currentNode, illegalColor(), newPoint);
                    }
                } else {
                    changeCursorStyle("cursor: no-drop");
                    legalPlace = false;
                    EditModeUtils.drawAltered(currentNode, illegalColor(), newPoint);
                }
            }
        }
    } else {
        legalPlace = false;
        legalNode = false;
        EditModeUtils.drawAltered(currentNode, illegalColor(), startingPoint);
    }
}

/**
 * If node legality is true,
 *      Redraws the proof,
 *      Then follows the same control flow as insertionMouseDown.
 *
 * @see insertionMouseDown
 * @param event Incoming MouseEvent (used in drawing an altered currentNode).
 */
export function insertionMouseMove(event: MouseEvent): void {
    if (legalNode) {
        const movePoint: Point = new Point(event.x - offset.x, event.y - offset.y);

        redrawProof();
        const newPoint = calculatePoint(event, currentNode);

        const tempNode = currentTree.getLowestNode(movePoint);
        const tempParent = currentTree.getLowestParent(movePoint);
        currentParent = tempNode instanceof AtomNode ? tempParent : tempNode;

        if (newPoint) {
            const newNode = EditModeUtils.alterNode(currentNode, newPoint);

            //Insertion does not allow for node adoption (i.e changing parents).
            //Adopted nodes result in an invalid insertion.
            if (currentParent !== null && !(currentParent as CutNode).containsNode(newNode)) {
                changeCursorStyle("cursor: no-drop");
                legalPlace = false;
                EditModeUtils.drawAltered(currentNode, illegalColor(), newPoint);
            } else {
                //By insertion, we can insert 1 graph at a time only on odd levels.
                //This means that currentParent must be on an even level.
                if (
                    currentParent !== null &&
                    currentParent instanceof CutNode &&
                    currentParent.ellipse !== null &&
                    currentTree.getLevel(currentParent) % 2 === 0
                ) {
                    //Insertion also does not allow for node adoption in any children.
                    if (newNode instanceof CutNode) {
                        legalPlace = true;
                        for (let i = 0; i < currentParent.children.length; i++) {
                            //newNode adopted a child of the parent.
                            if (newNode.containsNode(currentParent.children[i])) {
                                legalPlace = false;
                                break;
                            }
                        }
                    } else {
                        //AtomNodes cannot contain children.
                        legalPlace = true;
                    }

                    if (legalPlace) {
                        //currentNode can be placed here, but we must check for collisions.
                        let color = "";
                        if (currentNode instanceof CutNode) {
                            const legalChildren = EditModeUtils.validateChildren(
                                currentTree,
                                currentNode,
                                newPoint
                            );
                            color = legalChildren ? legalColor() : illegalColor();
                        } else if (currentNode instanceof AtomNode) {
                            const tempAtom: AtomNode = EditModeUtils.alterNode(
                                currentNode,
                                newPoint
                            ) as AtomNode;
                            const canInsert = currentTree.canInsert(tempAtom);
                            color = canInsert ? legalColor() : illegalColor();
                        }
                        legalPlace = color === legalColor() ? true : false;
                        EditModeUtils.drawAltered(currentNode, color, newPoint);
                        determineAndChangeCursorStyle(color, "cursor: copy", "cursor: no-drop");
                    } else {
                        changeCursorStyle("cursor: no-drop");
                        EditModeUtils.drawAltered(currentNode, illegalColor(), newPoint);
                    }
                } else {
                    changeCursorStyle("cursor: no-drop");
                    legalPlace = false;
                    EditModeUtils.drawAltered(currentNode, illegalColor(), newPoint);
                }
            }
        }
    } else {
        legalPlace = false;
    }
}

/**
 * Inserts the currentNode and any of its children at the coordinates given
 * by the incoming MouseEvent.
 * Then adds an Insertion step to the proof history.
 *
 * @param event Incoming MouseEvent.
 */
export function insertionMouseUp(event: MouseEvent): void {
    changeCursorStyle("cursor: default");
    if (legalNode && legalPlace) {
        const newPoint = calculatePoint(event, currentNode);

        if (newPoint) {
            if (currentNode instanceof CutNode) {
                EditModeUtils.insertChildren(currentNode, newPoint, currentTree);
            } else if (currentNode instanceof AtomNode) {
                const tempAtom: AtomNode = EditModeUtils.alterNode(
                    currentNode,
                    newPoint
                ) as AtomNode;
                currentTree.insert(tempAtom);
            }
            TreeContext.pushToProof(new ProofNode(currentTree, "Insertion"));
        }
    }
    redrawProof();
    legalNode = false;
}

/**
 * Sets fields back to defaults.
 */
export function insertionMouseOut(): void {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}

/**
 * Calculates and returns the difference between the position of the incoming node on
 * the Draw Mode canvas and the coordinates given by the incoming MouseEvent.
 *
 * Returns undefined if no node comes from from Draw Mode.
 *
 * @param event Incoming MouseEvent.
 * @param node Incoming node.
 * @returns Difference between node's position and the coordinates given by event,
 * or undefined if no node comes from Draw Mode.
 */
function calculatePoint(event: MouseEvent, node: CutNode | AtomNode): Point | undefined {
    if (node instanceof CutNode && node.ellipse !== null) {
        return new Point(event.x - node.ellipse.center.x, event.y - node.ellipse.center.y);
    } else if (node instanceof AtomNode) {
        return new Point(event.x - node.origin.x, event.y - node.origin.y);
    }

    return undefined;
}
