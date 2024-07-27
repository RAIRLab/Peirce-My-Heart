/**
 * @file Collection of methods for move, copy, and delete tools.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawAtom, drawCut, redrawTree} from "./DrawUtils";
import {Ellipse} from "../AEG/Ellipse";
import {offset} from "./DragTool";
import {Point} from "../AEG/Point";
import {TreeContext} from "../TreeContext";

const modeElm: HTMLSelectElement = <HTMLSelectElement>document.getElementById("mode");

/**
 * Checks that the incoming CutNode, when placed in the incoming AEGTree and offset by the incoming Point, is still able to be inserted.
 * Performs this check for all of the incoming CutNode's children as well.
 *
 * @param tree Incoming AEGTree.
 * @param incomingNode Incoming CutNode.
 * @param difference Incoming Point.
 * @returns True f all nodes are able to be inserted after being offset by difference.
 */
export function validateChildren(tree: AEGTree, incomingNode: CutNode, difference: Point): boolean {
    if (incomingNode.ellipse !== null) {
        const tempCut: CutNode = alterCut(incomingNode, difference);
        if (!tree.canInsert(tempCut)) {
            return false;
        }
    }

    for (let i = 0; i < incomingNode.children.length; i++) {
        if (
            incomingNode.children[i] instanceof CutNode &&
            (incomingNode.children[i] as CutNode).ellipse !== null &&
            !validateChildren(tree, incomingNode.children[i] as CutNode, difference)
        ) {
            //If any of this incomingNode's children are in an invalid location,
            //We return false for all of those invalid children.
            return false;
        } else if (incomingNode.children[i] instanceof AtomNode) {
            let tempAtom = incomingNode.children[i] as AtomNode;
            tempAtom = alterAtom(tempAtom, difference);

            if (!tree.canInsert(tempAtom)) {
                return false;
            }
        }
    }

    //All incomingNode's children and incomingNode are legal here. We return true.
    return true;
}

/**
 * Draws the incoming node as the incoming color string after being offset by the incoming Point.
 * The incoming Point determines how far the incoming node will be offset in the x and y directions.
 *
 * @param incomingNode Incoming node.
 * @param color Incoming color string.
 * @param difference Incoming Point.
 */
export function drawAltered(
    incomingNode: CutNode | AtomNode,
    color: string,
    difference: Point
): void {
    if (incomingNode instanceof CutNode && incomingNode.ellipse !== null) {
        const tempCut: CutNode = alterCut(incomingNode, difference);
        drawCut(tempCut, color);
        //If this node has any children, the children must also be drawn.
        if (incomingNode.children.length !== 0) {
            for (let i = 0; i < incomingNode.children.length; i++) {
                drawAltered(incomingNode.children[i], color, difference);
            }
        }
    } else if (incomingNode instanceof AtomNode) {
        const tempAtom: AtomNode = alterAtom(incomingNode, difference);
        drawAtom(tempAtom, color, true);
    }
}

/**
 * Inserts the incoming node into the incoming AEGTree offset by the incoming Point.
 * If the incoming node has any children, those children are also offset by the incoming Point and inserted.
 * The incoming Point determines how far the incoming node will be offset in the x and y directions.
 *
 * @param incomingNode Incoming node.
 * @param difference Incoming Point.
 * @param tree Incoming AEGTree. Defaults to global draw tree if not passed in.
 */
export function insertChildren(
    incomingNode: CutNode | AtomNode,
    difference: Point,
    tree?: AEGTree
): void {
    const insertTree = tree ? tree : TreeContext.tree;
    if (incomingNode instanceof CutNode && incomingNode.ellipse !== null) {
        const tempCut: CutNode = alterCut(incomingNode, difference);
        insertTree.insert(tempCut);
        //If this node has any children, we insert those children that are also offset by difference.
        if (incomingNode.children.length !== 0) {
            for (let i = 0; i < incomingNode.children.length; i++) {
                insertChildren(incomingNode.children[i], difference, tree);
            }
        }
    } else if (incomingNode instanceof AtomNode) {
        const tempAtom: AtomNode = alterAtom(incomingNode, difference);
        insertTree.insert(tempAtom);
    }
}

/**
 * Calculates and returns the incoming node altered by the incoming Point.
 * The incoming Point determines how far the incoming node will be offset in the x and y directions.
 *
 * @param node Incoming node.
 * @param difference Incoming Point.
 * @returns Altered version of node according to difference.
 */
export function alterNode(node: AtomNode | CutNode, difference: Point): AtomNode | CutNode {
    if (node instanceof AtomNode) {
        return alterAtom(node, difference);
    }

    return alterCut(node as CutNode, difference);
}

/**
 * Calculates and returns the incoming CutNode with its center shifted by the incoming Point.
 * The incoming Point determines how far the incoming CutNode will be offset in the x and y directions.
 *
 * @param originalCut Incoming CutNode.
 * @param difference Incoming Point.
 *
 * @returns Altered version of originalCut according to difference.
 * @throws Error If originalCut is The Sheet of Assertion.
 */
export function alterCut(originalCut: CutNode, difference: Point): CutNode {
    if (originalCut.ellipse !== null) {
        return new CutNode(
            new Ellipse(
                new Point(
                    originalCut.ellipse.center.x + difference.x - offset.x,
                    originalCut.ellipse.center.y + difference.y - offset.y
                ),
                originalCut.ellipse.radiusX,
                originalCut.ellipse.radiusY
            )
        );
    } else {
        throw new Error("Cannot alter the position of a CutNode without no Ellipse.");
    }
}

/**
 * Calculates and returns a copy of the incoming CutNode with it and all of its children's centers offset by the incoming Point.
 * The incoming Point determines how far the incoming CutNode and its children will be offset in the x and y directions.
 *
 * @param originalCut Incoming CutNode.
 * @param difference Incoming Point.
 * @returns originalCut with it and its children altered by difference.
 */
export function alterCutChildren(originalCut: CutNode, difference: Point): CutNode {
    if (originalCut.ellipse !== null) {
        const alteredChildren: (CutNode | AtomNode)[] = [];

        for (let i = 0; i < originalCut.children.length; i++) {
            if (originalCut.children[i] instanceof CutNode) {
                alteredChildren.push(
                    alterCutChildren(originalCut.children[i] as CutNode, difference)
                );
            } else if (originalCut.children[i] instanceof AtomNode) {
                alteredChildren.push(alterAtom(originalCut.children[i] as AtomNode, difference));
            }
        }

        return new CutNode(
            new Ellipse(
                new Point(
                    originalCut.ellipse.center.x + difference.x - offset.x,
                    originalCut.ellipse.center.y + difference.y - offset.y
                ),
                originalCut.ellipse.radiusX,
                originalCut.ellipse.radiusY
            ),
            alteredChildren
        );
    } else {
        throw new Error("Cannot alter the position of a CutNode without an Ellipse.");
    }
}

/**
 * Calculates and returns the incoming AtomNode with its position offset by the incoming Point.
 * The incoming Point determines how far the incoming AtomNode will be offset in the x and y directions.
 *
 * @param originalAtom Incoming AtomNode.
 * @param difference Incoming Point.
 * @returns Altered version of originalAtom according to difference.
 */
export function alterAtom(originalAtom: AtomNode, difference: Point): AtomNode {
    return new AtomNode(
        originalAtom.identifier,
        new Point(
            originalAtom.origin.x + difference.x - offset.x,
            originalAtom.origin.y + difference.y - offset.y
        ),
        originalAtom.width,
        originalAtom.height
    );
}

/**
 * Calculates and returns the incoming CutNode expanded by one incoming Point in the direction of the other incoming Point.
 *
 * @param originalCut Incoming CutNode.
 * @param difference One incoming Point.
 * @param direction Other incoming Point.
 * @returns originalCut with radii expanded by difference towards direction.
 */
export function resizeCut(originalCut: CutNode, difference: Point, direction: Point): CutNode {
    if (originalCut.ellipse !== null) {
        return new CutNode(
            new Ellipse(
                new Point(
                    originalCut.ellipse.center.x + difference.x,
                    originalCut.ellipse.center.y + difference.y
                ),
                Math.abs(originalCut.ellipse.radiusX + difference.x * direction.x),
                Math.abs(originalCut.ellipse.radiusY + difference.y * direction.y)
            )
        );
    } else {
        throw new Error("Cannot alter the position of a CutNode without an Ellipse.");
    }
}

/**
 * Inserts abandoned children from the incoming parent CutNode to the incoming AEGTree.
 *
 * In the wise words of Dawn Moore,
 * "The cut node loses custody of its children so that those can still be redrawn."
 *
 * @param tree Incoming AEGTree.
 * @param parentCut Incoming parent CutNode.
 */
export function readdChildren(tree: AEGTree, parentCut: CutNode): void {
    for (let i = 0; i < parentCut.children.length; i++) {
        if (tree.canInsert(parentCut.children[i])) {
            tree.insert(parentCut.children[i]);
        }
    }
}

/**
 * Inserts the incoming node to the incoming AEGTree and however many children the incoming node has.
 * Redraws that AEGTree afterward.
 *
 * @param tree Incoming AEGTree.
 * @param currentNode Incoming node.
 */
export function reInsertNode(tree: AEGTree, currentNode: AtomNode | CutNode): void {
    if (currentNode instanceof CutNode && currentNode.ellipse === null) {
        tree.sheet = currentNode;
    } else if (tree.canInsert(currentNode)) {
        tree.insert(currentNode);
        if (currentNode instanceof CutNode && (currentNode as CutNode).children.length !== 0) {
            readdChildren(tree, currentNode);
        }
        redrawTree(tree);
    }
}
/**
 * Calculates and returns an Ellipse based on two incoming Points.
 * The original mouse placement and the current mouse placement are these Points.
 *
 * @param original Incoming original mouse placement Point.
 * @param current Incoming current mouse placement Point.
 */
export function createEllipse(original: Point, current: Point): Ellipse {
    const center: Point = new Point(
        (current.x - original.x) / 2 + original.x,
        (current.y - original.y) / 2 + original.y
    );

    const sdx = original.x - current.x;
    const sdy = original.y - current.y;
    const dx = Math.abs(sdx);
    const dy = Math.abs(sdy);
    let rx, ry: number;

    if (modeElm.value === "circumscribed") {
        //This inscribed ellipse solution is inspired by:
        //https://stackoverflow.com/a/433426/6342516.
        const rv: number = Math.floor(center.distance(current));
        ry = Math.floor(rv * (dy / dx));
        rx = Math.floor(rv * (dx / dy));
    } else {
        rx = dx / 2;
        ry = dy / 2;
    }

    return new Ellipse(center, rx, ry);
}

/**
 * Checks if the incoming Ellipse is large enough to be considered legal.
 * CutNode legality was introduced because of exceedingly tiny,
 * Exceedingly long and exceedingly tall Ellipses appearing.
 * Also, tiny CutNodes do not serve any purpose due to their inability to contain AtomNodes and CutNodes.
 *
 * @param ellipse Incoming Ellipse.
 * @returns True if ellipse is large enough to be legal.
 */
export function ellipseLargeEnough(ellipse: Ellipse): boolean {
    if (ellipse.radiusX > 15 && ellipse.radiusY > 15) {
        return true;
    }
    return false;
}
