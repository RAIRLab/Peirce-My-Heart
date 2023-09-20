/**
 * A program to draw ellipses and atoms.
 * @author Dawn Moore
 * @author James Oswald
 */

import {AEGTree} from "./AEG/AEGTree";
import {Point} from "./AEG/Point";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {AtomNode} from "./AEG/AtomNode";

//Extend the window interface to export functions without TS complaining
declare global {
    interface Window {
        ellipseMode: () => void;
        atomMode: () => void;
    }
}

const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");
const modeElm: HTMLSelectElement = <HTMLSelectElement>document.getElementById("mode");
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;
const xshift: number = canvas.getBoundingClientRect().x;
const yshift: number = canvas.getBoundingClientRect().y;
let startingPoint: Point;
let atom: string;
ctx.font = "35pt arial";
let inEllipseMode: Boolean = false;
let inAtomMode: Boolean = false;
const tree: AEGTree = new AEGTree();
let currentEllipse: Ellipse;
window.atomMode = atomMode;
window.ellipseMode = ellipseMode;

declare global {
    interface Window {
        ellipseMode: () => void;
        atomMode: () => void;
    }
}

function distance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * A function to draw an ellipse between two points designated by the user.
 * @param original the point where the user originally clicked
 * @param current the point where the user's mouse is currently located
 */
function drawEllipse(original: Point, current: Point) {
    const center: Point = {
        x: (current.x - original.x) / 2 + original.x,
        y: (current.y - original.y) / 2 + original.y,
    };

    const sdx = original.x - current.x;
    const sdy = original.y - current.y;
    const dx = Math.abs(sdx);
    const dy = Math.abs(sdy);
    let rx, ry: number;

    if (modeElm.value === "circumscribed") {
        //This inscribed ellipse solution is inspired by the discussion of radius ratios in
        //https://stackoverflow.com/a/433426/6342516
        const rv: number = Math.floor(distance(center, current));
        rx = Math.floor(rv * (dy / dx));
        ry = Math.floor(rv * (dx / dy));
    } else {
        ry = dx / 2;
        rx = dy / 2;
    }

    if (showRectElm.checked) {
        ctx.beginPath();
        ctx.rect(original.x, original.y, -sdx, -sdy);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.ellipse(center.x, center.y, rx, ry, Math.PI / 2, 0, 2 * Math.PI);
    //I know this is stupid to constantly make a new ellipse but my brain hurts I'm sorry
    currentEllipse = new Ellipse(center, rx, ry);
    ctx.stroke();
}

/**
 * A function to begin a mode to draw cuts.
 * If atomMode was previously active, remove the listener.
 */
function ellipseMode() {
    inEllipseMode = true;
    canvas.addEventListener("mousedown", mouseDown);
    if (inAtomMode) {
        canvas.removeEventListener("mousedown", atomLocation);
        inAtomMode = false;
    }
}

/**
 * A function to begin atom creation.
 * If ellipseMode was previously active, remove the listener.
 */
function atomMode() {
    inAtomMode = true;
    canvas.addEventListener("mousedown", atomLocation);
    if (inEllipseMode) {
        canvas.removeEventListener("mousedown", mouseDown);
        inEllipseMode = false;
    }
}

/**
 * Logs the position where the mouse is first pressed down. Begins the event for moving
 * the mouse, then ends it once mouseup occurs.
 * @param event The even of holding down the mouse
 */
function mouseDown(event: MouseEvent) {
    startingPoint = {x: event.clientX - xshift, y: event.clientY - yshift};
    canvas.addEventListener("mousemove", mouseMoving);
    canvas.addEventListener("mouseup", () => {
        canvas.removeEventListener("mousemove", mouseMoving);
        const newCut: CutNode = new CutNode(currentEllipse);
        if (tree.canInsertAEG(newCut, currentEllipse.center)) {
            tree.insertAEG(newCut, currentEllipse.center);
        }
    });
}

/**
 * Follows the current mouse position, and draws the ellipse between the starting
 * point and the current point.Clears the canvas with every movement. When the
 * tree is finished a redraw function will be made to draw all of the already
 * created cuts and atoms.
 * @param event The event of a mouse moving
 */
function mouseMoving(event: MouseEvent) {
    //As strange as this is, this is the only way to clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentPoint: Point = {
        x: event.clientX - xshift,
        y: event.clientY - yshift,
    };
    redrawCut(tree.sheet);
    drawEllipse(startingPoint, currentPoint);
}

/**
 * Determines the original place of an atom with a mouse click.
 * @param event The action of a user click
 */
function atomLocation(event: MouseEvent) {
    startingPoint = {
        x: event.clientX - xshift,
        y: event.clientY - yshift,
    };
    document.addEventListener("keypress", drawAtom);
}

/**
 * Determines what the atom will look like, and places it in the original location.
 * When the mouse is clicked again it places the atom and it cannot be moved.
 * @param event The action of selecting a letter
 */
function drawAtom(event: KeyboardEvent) {
    atom = event.key;
    ctx.fillText(atom, startingPoint.x, startingPoint.y);
    ctx.stroke;
    canvas.addEventListener("mousemove", atomMoving);
    canvas.addEventListener("mousedown", () => {
        canvas.removeEventListener("mousemove", atomMoving);
        const newAtom: AtomNode = new AtomNode(atom, startingPoint);
        tree.insertAEG(newAtom, startingPoint);
    });
}

/**
 * When the mouse is moved it places the atom directly under it until in the desired location.
 * @param event The event of the mouse moving
 */
function atomMoving(event: MouseEvent) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    const currentPoint: Point = {
        x: event.clientX - xshift,
        y: event.clientY - yshift,
    };
    ctx.fillText(atom, currentPoint.x, currentPoint.y);
    ctx.stroke();
}

/**
 * Iterates through the entire tree, if there are no children the for loop will not begin.
 * Sends any Atom children to redrawAtom.
 * @param incomingNode The CutNode to be iterated through
 */
function redrawCut(incomingNode: CutNode) {
    for (let i = 0; incomingNode.children.length > i; i++) {
        if (incomingNode.children[i] instanceof AtomNode) {
            redrawAtom(<AtomNode>incomingNode.children[i]);
        } else {
            redrawCut(<CutNode>incomingNode.children[i]);
        }
    }
    if (incomingNode.ellipse instanceof Ellipse) {
        ctx.beginPath();
        ctx.ellipse(
            incomingNode.ellipse.center.x,
            incomingNode.ellipse.center.y,
            incomingNode.ellipse.radiusX,
            incomingNode.ellipse.radiusY,
            Math.PI / 2,
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
