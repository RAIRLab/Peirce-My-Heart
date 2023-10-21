/**
 * File containing multi node movement event handlers.
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {redrawCut, tree} from "./index";
import {offset} from "./DragMode";
import {Ellipse} from "./AEG/Ellipse";
import {drawCut} from "./CutMode";
import {drawAtom} from "./AtomMode";

//Setting Up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

//The initial point the user pressed down.
let startingPoint: Point;
let currentNode: CutNode | AtomNode;
let legalNode: boolean;

export function moveMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    if (tree.getLowestNode(startingPoint) !== tree.sheet) {
        currentNode = tree.getLowestNode(startingPoint);
        const currentParent = tree.getLowestParent(startingPoint);
        currentParent.remove(startingPoint);
        legalNode = true;
        console.log(currentNode);
    }
}

export function moveMultiMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
        if (currentNode instanceof CutNode) {
            if (validateChildren(currentNode, moveDifference)) {
                drawAltered(currentNode, "#00FF00", moveDifference);
            } else {
                drawAltered(currentNode, "#FF0000", moveDifference);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = new AtomNode(
                currentNode.identifier,
                new Point(
                    currentNode.origin.x + moveDifference.x - offset.x,
                    currentNode.origin.y + moveDifference.y - offset.y
                ),
                currentNode.width,
                currentNode.height
            );

            if (tree.canInsert(tempAtom)) {
                drawAtom(tempAtom, "#00FF00", true);
            } else {
                drawAtom(tempAtom, "#FF0000", true);
            }
        }
    }
}

export function moveMultiMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        if (currentNode instanceof CutNode) {
            if (validateChildren(currentNode, moveDifference)) {
                insertChildren(currentNode, moveDifference);
            } else {
                tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = new AtomNode(
                currentNode.identifier,
                new Point(
                    currentNode.origin.x + moveDifference.x - offset.x,
                    currentNode.origin.y + moveDifference.y - offset.y
                ),
                currentNode.width,
                currentNode.height
            );

            if (tree.canInsert(tempAtom)) {
                tree.insert(tempAtom);
            } else {
                tree.insert(currentNode);
            }
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
    legalNode = false;
}

export function moveMultiMouseOut() {
    if (legalNode) {
        tree.insert(currentNode);
    }
    legalNode = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
}

function validateChildren(incomingNode: CutNode, change: Point): boolean {
    if (incomingNode.ellipse !== null) {
        const tempCut: CutNode = new CutNode(
            new Ellipse(
                new Point(
                    incomingNode.ellipse.center.x + change.x - offset.x,
                    incomingNode.ellipse.center.y + change.y - offset.y
                ),
                incomingNode.ellipse.radiusX,
                incomingNode.ellipse.radiusY
            )
        );
        if (!tree.canInsert(tempCut)) {
            return false;
        }
    }

    for (let i = 0; i < incomingNode.children.length; i++) {
        if (
            incomingNode.children[i] instanceof CutNode &&
            (incomingNode.children[i] as CutNode).ellipse !== null
        ) {
            if (!validateChildren(incomingNode.children[i] as CutNode, change)) {
                return false;
            }
        } else if (incomingNode.children[i] instanceof AtomNode) {
            const tempAtom: AtomNode = new AtomNode(
                (incomingNode.children[i] as AtomNode).identifier,
                new Point(
                    (incomingNode.children[i] as AtomNode).origin.x + change.x - offset.x,
                    (incomingNode.children[i] as AtomNode).origin.y + change.y - offset.y
                ),
                (incomingNode.children[i] as AtomNode).width,
                (incomingNode.children[i] as AtomNode).height
            );

            if (!tree.canInsert(tempAtom)) {
                return false;
            }
        }
    }
    return true;
}

function drawAltered(incomingNode: CutNode | AtomNode, color: string, change: Point) {
    if (incomingNode instanceof CutNode && incomingNode.ellipse !== null) {
        const tempCut: CutNode = new CutNode(
            new Ellipse(
                new Point(
                    incomingNode.ellipse.center.x + change.x - offset.x,
                    incomingNode.ellipse.center.y + change.y - offset.y
                ),
                incomingNode.ellipse.radiusX,
                incomingNode.ellipse.radiusY
            )
        );
        drawCut(tempCut, color);
        if (incomingNode.children.length !== 0) {
            for (let i = 0; i < incomingNode.children.length; i++) {
                drawAltered(incomingNode.children[i], color, change);
            }
        }
    } else if (incomingNode instanceof AtomNode) {
        const tempAtom: AtomNode = new AtomNode(
            incomingNode.identifier,
            new Point(
                incomingNode.origin.x + change.x - offset.x,
                incomingNode.origin.y + change.y - offset.y
            ),
            incomingNode.width,
            incomingNode.height
        );
        drawAtom(tempAtom, color, true);
    }
}

function insertChildren(incomingNode: CutNode | AtomNode, change: Point) {
    if (incomingNode instanceof CutNode && incomingNode.ellipse !== null) {
        const tempCut: CutNode = new CutNode(
            new Ellipse(
                new Point(
                    incomingNode.ellipse.center.x + change.x - offset.x,
                    incomingNode.ellipse.center.y + change.y - offset.y
                ),
                incomingNode.ellipse.radiusX,
                incomingNode.ellipse.radiusY
            )
        );
        tree.insert(tempCut);
        if (incomingNode.children.length !== 0) {
            for (let i = 0; i < incomingNode.children.length; i++) {
                insertChildren(incomingNode.children[i], change);
            }
        }
    } else if (incomingNode instanceof AtomNode) {
        const tempAtom: AtomNode = new AtomNode(
            incomingNode.identifier,
            new Point(
                incomingNode.origin.x + change.x - offset.x,
                incomingNode.origin.y + change.y - offset.y
            ),
            incomingNode.width,
            incomingNode.height
        );

        tree.insert(tempAtom);
    }
}
