/**
 * File containing helper functions for move, copy, and delete modes.
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "./DragTool";
import {Ellipse} from "../AEG/Ellipse";
import {drawCut, drawAtom} from "./DrawUtils";
import {AEGTree} from "../AEG/AEGTree";

const modeElm: HTMLSelectElement = <HTMLSelectElement>document.getElementById("mode");

/**
 * Checks the validity of the incoming node and all of its children. If the child is a cut node uses
 * recursion to check the validity, if it is an atom it does not need recursion. If even one node
 * fails, every current position will return as invalid.
 * @param incomingNode The current node that will be checked for validity
 * @param change The difference between the original position and the new position
 * @returns If all nodes are in a valid position returns true, if any node is not returns false
 */
export function validateChildren(tree: AEGTree, incomingNode: CutNode, change: Point): boolean {
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
            !validateChildren(tree, incomingNode.children[i] as CutNode, change)
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
 * @param tree The tree we want to insert the node in. By default, inserts in global draw tree.
 */
export function insertChildren(incomingNode: CutNode | AtomNode, change: Point, tree?: AEGTree) {
    const insertTree = tree ? tree : treeContext.tree;
    if (incomingNode instanceof CutNode && incomingNode.ellipse !== null) {
        const tempCut: CutNode = alterCut(incomingNode, change);
        insertTree.insert(tempCut);
        //If this node has any children recurses to insert them with the same distance change
        if (incomingNode.children.length !== 0) {
            for (let i = 0; i < incomingNode.children.length; i++) {
                insertChildren(incomingNode.children[i], change, tree);
            }
        }
    } else if (incomingNode instanceof AtomNode) {
        const tempAtom: AtomNode = alterAtom(incomingNode, change);

        insertTree.insert(tempAtom);
    }
}

/**
 * Takes a node object and alters it accordingly based on the type of node
 * @param node The node to be altered
 * @param difference The difference on how far the node should move
 * @returns The new altered version of the node
 */
export function alterNode(node: AtomNode | CutNode, difference: Point) {
    if (node instanceof AtomNode) {
        return alterAtom(node, difference);
    }

    return alterCut(node as CutNode, difference);
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
 * Takes a cut and makes a copy of it with the center changed by the given difference.
 * Creates a new array of children and alters those by the same distance acting recursively if needed.
 * @param originalCut The cut we want to change the center of
 * @param difference The distance the cut will be shifted
 * @returns The new cut node with all of it's children altered
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
        throw new Error("Cannot alter the position of a cut without an ellipse.");
    }
}

/**
 * Takes an atom object and changes the origin point by the difference.
 * @param originalAtom The Atom to be altered
 * @param difference The difference on how far the atom should move
 * @returns The new altered version of the atom
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

/**
 * Highlights all the children of the incoming node as the incoming color.
 * @param child The incoming node
 * @param color The incoming color
 */
export function highlightChildren(child: AtomNode | CutNode, color: string) {
    if (child instanceof AtomNode) {
        drawAtom(child, color, true);
    } else if (child instanceof CutNode) {
        drawCut(child, color);
        for (let i = 0; i < child.children.length; i++) {
            highlightChildren(child.children[i], color);
        }
    }
}

/**
 * Makes a copy of original cut and changes the center and radii by the difference given.
 * Alters the change to the center based on the direction that is being moved to.
 * @param originalCut The original cut that will be copied and altered
 * @param difference The change for the new cut
 * @param direction the direction the radius will be expanding towards
 * @returns The new altered cut
 */
export function resizeCut(originalCut: CutNode, difference: Point, direction: Point) {
    if (originalCut.ellipse !== null) {
        return new CutNode(
            new Ellipse(
                new Point(
                    originalCut.ellipse.center.x + difference.x,
                    originalCut.ellipse.center.y + difference.y
                ),
                originalCut.ellipse.radiusX + difference.x * direction.x,
                originalCut.ellipse.radiusY + difference.y * direction.y
            )
        );
    } else {
        throw new Error("Cannot alter the position of a cut without an ellipse.");
    }
}
/**
 * A function to calculate an ellipse between two points designated by the user.
 * @param original the point where the user originally clicked
 * @param current the point where the user's mouse is currently located
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
        //This inscribed ellipse solution is inspired by the discussion of radius ratios in
        //https://stackoverflow.com/a/433426/6342516
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
 * Checks to see if the given ellipse is large enough to be considered legal.
 * @param ellipse The ellipse to be checked
 * @returns Whether the given ellipse is large enough to be legal
 */
export function ellipseLargeEnough(ellipse: Ellipse) {
    if (ellipse.radiusX > 15 && ellipse.radiusY > 15) {
        return true;
    }
    return false;
}
