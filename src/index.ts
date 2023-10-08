/**
 * A program to draw ellipses and atoms.
 * @author Dawn Moore
 * @author James Oswald
 */

import {AEGTree} from "./AEG/AEGTree";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {AtomNode} from "./AEG/AtomNode";
import {ellipseCreation, removeCutListener} from "./EllipseCreation";
import {atomCreation, removeAtomListener} from "./AtomCreation";

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
let inEllipseMode: Boolean = false;
let inAtomMode: Boolean = false;
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
 * A function to begin a mode to draw cuts.
 * If atomMode was previously active, remove the listener.
 */
function ellipseMode() {
    inEllipseMode = true;
    ellipseCreation();
    if (inAtomMode) {
        removeAtomListener();
        inAtomMode = false;
    }
}

/**
 * A function to begin atom creation.
 * If ellipseMode was previously active, remove the listener.
 */
function atomMode() {
    inAtomMode = true;
    atomCreation();
    if (inEllipseMode) {
        removeCutListener();
        inEllipseMode = false;
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
 * Redraws the given atom.
 * @param incomingNode The Atom Node to be redrawn
 */
function redrawAtom(incomingNode: AtomNode) {
    ctx.fillText(incomingNode.identifier, incomingNode.origin.x, incomingNode.origin.y);
    ctx.stroke();
}
