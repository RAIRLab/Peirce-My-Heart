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
import {ProofNode} from "../AEG/ProofNode";
import {TreeContext} from "../TreeContext";

/**
 * Contains methods for the insertion inference rule.
 *
 * Nodes are considered legal if they are graphs and able to be placed.
 *
 * @author Anusha Tiwari
 */

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
 * Sets currentTree to the current proof tree.
 * Then if there are existing steps in the proof and only one node (with any amount of children) was selected for insertion,
 *      Sets node legality to true,
 *      Sets currentNode to the one node selected for insertion,
 *      Sets currentParent according to the parent of the lowest node containing the coordinates given by the incoming MouseEvent, and
 *      If currentNode comes from Draw Mode canvas,
 *          If currentParent is not null and currentParent contains an altered currentNode according to the coordinates given by the incoming MouseEvent,
 *              Sets cursor style to no-drop,
 *              Sets placement legality to false, and
 *              Draws the altered currentNode as the illegal color.
 *          Otherwise,
 *              If currentParent is not null, currentParent is not the sheet and currentNode is on an even cut level,
 *                  If the altered currentNode is a CutNode,
 *                      Sets placement legality to true, and
 *                      If the altered CutNode now contains any of currentParent's children,
 *                          Sets placement legality to false.
 *                  Otherwise,
 *                      Sets placement legality to true.
 *              Then if placement legality is true,
 *                  Alters currentNode according to the coordinates given by the incoming MouseEvent,
 *                  Highlights the altered currentNode and all its children as either the legal or illegal color if they can be inserted, and
 *                  Sets cursor style to copy or no-drop depending on the determined color.
 *              Otherwise,
 *                  Sets cursor style to no-drop, and
 *                  Highlights the altered currentNode and all its children as the illegal color.
 *      Otherwise,
 *          Sets cursor style to no-drop,
 *          Sets placement legality to false, and
 *          Highlights the altered currentNode and all its children as the illegal color.
 * Otherwise,
 *      Sets placement legality to false,
 *      Sets node legality to false, and
 *      Highlights an altered currentNode and all its children as the illegal color.
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
 * Sets cursor style to default, and
 * If both currentNode and currentNode's placement are legal,
 *      If the inserted graph comes from the Draw Mode canvas,
 *          Inserts the currentNode and any of its children at the coordinates given by the incoming MouseEvent.
 *          Then adds an Insertion step to the proof history.
 *
 * Then redraws the proof.
 * Then sets node legality to false.
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
 * Sets cursor style to default.
 * Then sets node legality to false.
 * Then redraws the proof.
 */
export function insertionMouseOut(): void {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}

/**
 * Calculates and returns the difference between the position of the incoming node on the Draw Mode canvas
 *      and the coordinates given by the incoming MouseEvent.
 *
 * Returns undefined if no node comes from from Draw Mode.
 *
 * @param event Incoming MouseEvent.
 * @param node Incoming node.
 * @returns Difference between node's position and the coordinates given by event, or undefined if no node comes from Draw Mode.
 */
function calculatePoint(event: MouseEvent, node: CutNode | AtomNode): Point | undefined {
    if (node instanceof CutNode && node.ellipse !== null) {
        return new Point(event.x - node.ellipse.center.x, event.y - node.ellipse.center.y);
    } else if (node instanceof AtomNode) {
        return new Point(event.x - node.origin.x, event.y - node.origin.y);
    }

    return undefined;
}
