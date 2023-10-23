/**
 * File containing helper functions for move, copy, and delete modes.
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {tree} from "./index";
import {offset} from "./DragMode";
import {Ellipse} from "./AEG/Ellipse";
import {drawCut} from "./CutMode";
import {drawAtom} from "./AtomMode";

/**
 * Checks the validity of the incoming node and all of its children. If the child is a cut node uses
 * recursion to check the validity, if it is an atom it does not need recursion. If even one node
 * fails, every current position will return as invalid.
 * @param incomingNode The current node that will be checked for validity
 * @param change The difference between the original position and the new position
 * @returns If all nodes are in a valid position returns true, if any node is not returns false
 */
export function validateChildren(incomingNode: CutNode, change: Point): boolean {
    if (incomingNode.ellipse !== null) {
        const tempCut: CutNode = alterCut(incomingNode, change);
        if (!tree.canInsert(tempCut)) {
            return false;
        }
    }

    for (let i = 0; i < incomingNode.children.length; i++) {
        if (
            incomingNode.children[i] instanceof CutNode &&
            (incomingNode.children[i] as CutNode).ellipse !== null &&
            !validateChildren(incomingNode.children[i] as CutNode, change)
        ) {
            //If any of this node's children are in an invalid location return false for all of them.
            return false;
        } else if (incomingNode.children[i] instanceof AtomNode) {
            let tempAtom = incomingNode.children[i] as AtomNode;
            tempAtom = alterAtom(tempAtom, change);

            if (!tree.canInsert(tempAtom)) {
                return false;
            }
        }
    }

    //All children and current node are legal, return true.
    return true;
}

/**
 * If the incoming node is a cut, makes a temporary cut draws it and if it has children calls this
 * function for each of its children. Atom nodes are just redrawn using drawAtom.
 * @param incomingNode The current node to be drawn
 * @param color The color to draw the atom or cut as
 * @param change The difference between the original position and the new position
 */
export function drawAltered(incomingNode: CutNode | AtomNode, color: string, change: Point) {
    if (incomingNode instanceof CutNode && incomingNode.ellipse !== null) {
        const tempCut: CutNode = alterCut(incomingNode, change);
        drawCut(tempCut, color);
        //If this node has any children draws them as well.
        if (incomingNode.children.length !== 0) {
            for (let i = 0; i < incomingNode.children.length; i++) {
                drawAltered(incomingNode.children[i], color, change);
            }
        }
    } else if (incomingNode instanceof AtomNode) {
        const tempAtom: AtomNode = alterAtom(incomingNode, change);
        drawAtom(tempAtom, color, true);
    }
}

/**
 * Inserts the incoming node into the tree with the change to its original location. If the node
 * is a cut node that has children calls this function on each of its children.
 * @param incomingNode The current node to be inserted
 * @param change The difference between the original position and the new position
 */
export function insertChildren(incomingNode: CutNode | AtomNode, change: Point) {
    if (incomingNode instanceof CutNode && incomingNode.ellipse !== null) {
        const tempCut: CutNode = alterCut(incomingNode, change);
        tree.insert(tempCut);
        //If this node has any children recurses to insert them with the same distance change
        if (incomingNode.children.length !== 0) {
            for (let i = 0; i < incomingNode.children.length; i++) {
                insertChildren(incomingNode.children[i], change);
            }
        }
    } else if (incomingNode instanceof AtomNode) {
        const tempAtom: AtomNode = alterAtom(incomingNode, change);

        tree.insert(tempAtom);
    }
}

/**
 * Takes a cut object and changes the center point of the ellipse by the difference.
 * If the cut does not have an ellipse throws and error.
 * @param originalCut The original cut to be altered
 * @param difference The difference on how far the center should move
 * @returns The new altered version of the cut
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
        throw new Error("Cannot alter the position of a cut without an ellipse.");
    }
}

/**
 * Takes an atom object and changes the origin point by the difference.
 * @param originalAtom The Atom to be altered
 * @param difference The difference on how far the center should move
 * @returns The new altered version of the cut
 */
export function alterAtom(originalAtom: AtomNode, difference: Point) {
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