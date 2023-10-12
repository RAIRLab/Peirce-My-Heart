/**
 * A program to draw ellipses and atoms.
 * @author Dawn Moore
 * @author James Oswald
 */

import {AEGTree} from "./AEG/AEGTree";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {AtomNode} from "./AEG/AtomNode";
import {cutMouseDown, cutMouseMove, cutMouseOut, cutMouseUp} from "./CutMode";
import {atomKeyPress, atomMouseDown, atomMouseMove, atomMouseUp, atomMouseOut} from "./AtomMode";

//Extend the window interface to export functions without TS complaining
declare global {
    interface Window {
        ellipseMode: () => void;
        atomMode: () => void;
    }
}

//Setting up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;
ctx.font = "35pt arial";

//Global State
const cutDisplay = <HTMLParagraphElement>document.getElementById("graphString");
const cutTools = <HTMLParagraphElement>document.getElementById("cutTools");
const atomTools = <HTMLParagraphElement>document.getElementById("atomTools");
window.addEventListener("keypress", keyPressHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
canvas.addEventListener("mousemove", mouseMoveHandler);
canvas.addEventListener("mouseup", mouseUpHandler);
canvas.addEventListener("mouseout", mouseOutHandler);
canvas.addEventListener("mouseenter", mouseEnterHandler);
let modeState = "";
let hasMouseDown = false;
let hasMouseIn = true;
export const tree: AEGTree = new AEGTree();

//Window Exports
window.atomMode = atomMode;
window.ellipseMode = ellipseMode;
declare global {
    interface Window {
        ellipseMode: () => void;
        atomMode: () => void;
    }
}

/**
 * If there is no current mode creates the listeners.
 * Sets the current mode to cut mode.
 */
function ellipseMode() {
    modeState = "cutMode";
    cutTools.style.display = "block";
    //Block all other mode tools
    atomTools.style.display = "none";
}

/**
 * If there is no current mode creates the listeners.
 * Sets the current mode to atom mode.
 */
function atomMode() {
    modeState = "atomMode";
    atomTools.style.display = "block";
    //Block all other mode tools
    cutTools.style.display = "none";
}

/**
 * Calls the respective keypress function depending on current mode.
 * @param event The event of a keypress
 */
function keyPressHandler(event: KeyboardEvent) {
    switch (modeState) {
        case "atomMode":
            atomKeyPress(event);
            break;
    }
}

/**
 * Calls the respective mouse down function depending on current mode.
 * @param event The mouse down event
 */
function mouseDownHandler(event: MouseEvent) {
    switch (modeState) {
        case "cutMode":
            cutMouseDown(event);
            break;
        case "atomMode":
            atomMouseDown(event);
            break;
    }
    hasMouseDown = true;
}

/**
 * If mouse down has been used calls the respective mousedown function based on mode.
 * @param event the mouse move event
 */
function mouseMoveHandler(event: MouseEvent) {
    switch (modeState) {
        case "cutMode":
            if (hasMouseDown && hasMouseIn) {
                cutMouseMove(event);
            }
            break;
        case "atomMode":
            if (hasMouseDown && hasMouseIn) {
                atomMouseMove(event);
            }
            break;
    }
}

/**
 * If mouse down has been used calls the respective mouse up function based on mode.
 * Resets mouse down after use.
 * @param event The mouse up event
 */
function mouseUpHandler(event: MouseEvent) {
    switch (modeState) {
        case "cutMode":
            cutMouseUp(event);
            break;
        case "atomMode":
            atomMouseUp();
            break;
    }
    hasMouseDown = false;
}

/**
 * If mouse down has been used calls the respective mouse out function based on mode.
 * Resets mouse down after use.
 */
function mouseOutHandler() {
    switch (modeState) {
        case "cutMode":
            cutMouseOut();
            break;
        case "atomMode":
            atomMouseOut();
            break;
    }
}

function mouseEnterHandler() {
    hasMouseIn = true;
}

/**
 * Iterates through the entire tree, if there are no children the for loop will not begin.
 * Sends any Atom children to redrawAtom.
 * @param incomingNode The CutNode to be iterated through
 */
export function redrawCut(incomingNode: CutNode) {
    cutDisplay.innerHTML = tree.toString();
    for (let i = 0; incomingNode.children.length > i; i++) {
        if (incomingNode.children[i] instanceof AtomNode) {
            redrawAtom(<AtomNode>incomingNode.children[i]);
        } else {
            redrawCut(<CutNode>incomingNode.children[i]);
        }
    }
    if (incomingNode.ellipse instanceof Ellipse) {
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(
            incomingNode.ellipse.center.x,
            incomingNode.ellipse.center.y,
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
 */
function redrawAtom(incomingNode: AtomNode) {
    const displayBox = incomingNode.rectangle;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.rect(
        displayBox.startVertex.x,
        displayBox.startVertex.y,
        displayBox.width,
        displayBox.height
    );
    ctx.fillText(incomingNode.identifier, incomingNode.origin.x, incomingNode.origin.y);
    ctx.stroke();
}
