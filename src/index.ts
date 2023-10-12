/**
 * A program to draw ellipses and atoms.
 * @author Dawn Moore
 * @author James Oswald
 */

import {AEGTree} from "./AEG/AEGTree";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {AtomNode} from "./AEG/AtomNode";
import {cutHandler} from "./CutMode";
import {atomHandler} from "./AtomMode";
import {saveFile} from "./FileUtils";

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
let modeState: string;
export const tree: AEGTree = new AEGTree();

//Window Exports
window.atomMode = atomMode;
window.ellipseMode = ellipseMode;
window.saveMode = saveMode;
declare global {
    interface Window {
        ellipseMode: () => void;
        atomMode: () => void;
        saveMode: () => void;
    }
}

/**
 * A function to begin a mode to draw cuts.
 * If atomMode was previously active, remove the listener.
 */
function ellipseMode() {
    if (modeState !== "ellipseMode") {
        removeListeners();
        modeState = "ellipseMode";
        atomTools.style.display = "none";
    }
    cutTools.style.display = "block";
    canvas.addEventListener("mousedown", cutHandler);
    canvas.addEventListener("mousemove", cutHandler);
    canvas.addEventListener("mouseup", cutHandler);
    canvas.addEventListener("mouseout", cutHandler);
}

/**
 * A function to begin atom creation.
 * If ellipseMode was previously active, remove the listener.
 */
function atomMode() {
    if (modeState !== "atomMode") {
        removeListeners();
        modeState = "atomMode";
        cutTools.style.display = "none";
    }
    atomTools.style.display = "block";
    window.addEventListener("keypress", atomHandler);
    canvas.addEventListener("mousedown", atomHandler);
    canvas.addEventListener("mousemove", atomHandler);
    canvas.addEventListener("mouseup", atomHandler);
    canvas.addEventListener("mouseout", atomHandler);
}

function saveMode() {
    console.log(tree);
    saveFile(tree);
}

/**
 * Removes all listeners added in a certain mode.
 */
function removeListeners() {
    if (modeState === "ellipseMode") {
        canvas.removeEventListener("mousedown", cutHandler);
        canvas.removeEventListener("mousemove", cutHandler);
        canvas.removeEventListener("mouseup", cutHandler);
        canvas.removeEventListener("mouseout", cutHandler);
    } else if (modeState === "atomMode") {
        window.removeEventListener("keypress", atomHandler);
        canvas.removeEventListener("mousedown", atomHandler);
        canvas.removeEventListener("mousemove", atomHandler);
        canvas.removeEventListener("mouseup", atomHandler);
        canvas.removeEventListener("mouseout", atomHandler);
    }
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
