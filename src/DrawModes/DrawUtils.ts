/**
 * File containing all drawing function for the canvas
 * @author Dawn MOore
 */

import {Point} from "../AEG/Point";
import {CutNode} from "../AEG/CutNode";
import {AtomNode} from "../AEG/AtomNode";
import {Ellipse} from "../AEG/Ellipse";
import {treeContext} from "../treeContext";
import {offset} from "./DragTool";
import {placedColor} from "../Themes";
import {AEGTree} from "../AEG/AEGTree";

//Setting up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;
ctx.font = "35pt arial";

//Tree string displayed on webpage
const cutDisplay = <HTMLParagraphElement>document.getElementById("graphString");
const proofString = <HTMLParagraphElement>document.getElementById("proofString");

//HTML bounding box check
const atomCheckBox = <HTMLInputElement>document.getElementById("atomBox");
const atomCheckBoxes = <HTMLInputElement>document.getElementById("atomBoxes");
atomCheckBoxes.addEventListener("input", checkBoxRedraw);

/**
 * Draws the given cut onto the canvas.
 * @param thisCut The cut containing the ellipse to be drawn
 * @param color the line color of the ellipse
 */
export function drawCut(thisCut: CutNode, color: string) {
    const ellipse: Ellipse = <Ellipse>thisCut.ellipse;
    if (ellipse !== null) {
        ctx.strokeStyle = color;
        const center: Point = ellipse.center;
        ctx.beginPath();
        ctx.ellipse(
            center.x + offset.x,
            center.y + offset.y,
            ellipse.radiusX,
            ellipse.radiusY,
            0,
            0,
            2 * Math.PI
        );
        ctx.stroke();
    }
}

/**
 * Draws the given atomNode with the given color.
 * @param thisAtom the atomMode to be drawn.
 * @param color the color of the atom.
 */
export function drawAtom(thisAtom: AtomNode, color: string, currentAtom: Boolean) {
    ctx.textBaseline = "bottom";
    const atomMetrics: TextMetrics = ctx.measureText(thisAtom.identifier);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillText(thisAtom.identifier, thisAtom.origin.x + offset.x, thisAtom.origin.y + offset.y);
    if (atomCheckBoxes.checked || (atomCheckBox.checked && currentAtom)) {
        ctx.rect(
            thisAtom.origin.x + offset.x,
            thisAtom.origin.y + offset.y - atomMetrics.actualBoundingBoxAscent,
            thisAtom.width,
            thisAtom.height
        );
    }
    ctx.stroke();
}

export function drawGuidelines(original: Point, current: Point, color: string) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    const dx: number = original.x - current.x + offset.x;
    const dy: number = original.y - current.y + offset.y;
    ctx.rect(original.x, original.y, -dx, -dy);
    ctx.stroke();
}

/**
 * When the checkbox for showing all bounding boxes is checked redraws the canvas showing the boxes.
 */
function checkBoxRedraw() {
    redrawTree(treeContext.tree);
}

export function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Resets the canvas and begins the recursive method of drawing the current tree.
 */
export function redrawTree(tree: AEGTree, color?: string) {
    cutDisplay.innerHTML = tree.toString();
    cleanCanvas();
    redrawCut(tree.sheet, color);
}

/**
 * Iterates through the entire tree, if there are no children the for loop will not begin.
 * Sends any Atom children to redrawAtom.
 * @param incomingNode The CutNode to be iterated through
 * @param offset The difference between the actual graph and the current canvas
 */
function redrawCut(incomingNode: CutNode, color?: string) {
    for (let i = 0; incomingNode.children.length > i; i++) {
        if (incomingNode.children[i] instanceof AtomNode) {
            redrawAtom(<AtomNode>incomingNode.children[i]);
        } else {
            redrawCut(<CutNode>incomingNode.children[i]);
        }
    }
    if (incomingNode.ellipse instanceof Ellipse) {
        ctx.strokeStyle = color ? color : placedColor();
        ctx.beginPath();
        ctx.ellipse(
            incomingNode.ellipse.center.x + offset.x,
            incomingNode.ellipse.center.y + offset.y,
            incomingNode.ellipse.radiusX,
            incomingNode.ellipse.radiusY,
            0,
            0,
            2 * Math.PI
        );
        ctx.stroke();
    }
}

/**
 * Redraws the given atom. Also redraws the the bounding box.
 * @param incomingNode The Atom Node to be redrawn
 * @param offset The difference between the actual graph and the current canvas
 */
export function redrawAtom(incomingNode: AtomNode) {
    drawAtom(incomingNode, placedColor(), false);
}

export function redrawProof() {
    //If this is the first step taken in the proof,
    //set the current tree as the head of the proof history
    let tree: AEGTree;
    if (treeContext.proofHistory.length === 0) {
        tree = new AEGTree();
    } else {
        tree = treeContext.proofHistory[treeContext.proofHistory.length - 1].tree;
    }

    cleanCanvas();
    proofString.innerHTML = tree.toString();
    redrawCut(tree.sheet);
}

/**
 * Helper function to highlight the specific selected node
 */
export function highlightNode(child: AtomNode | CutNode, color: string) {
    if (child instanceof AtomNode) {
        drawAtom(child, color, false);
    } else if (child instanceof CutNode) {
        drawCut(child, color);
        for (let i = 0; i < child.children.length; i++) {
            highlightNode(child.children[i], color);
        }
    }
}
