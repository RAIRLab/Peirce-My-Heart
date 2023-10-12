import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {redrawCut, tree} from "./index";
import {Rectangle} from "./AEG/Rectangle";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;
const atomDisplay = <HTMLParagraphElement>document.getElementById("atomDisplay");
const atomDisplay = <HTMLParagraphElement>document.getElementById("atomDisplay");
let atomMetrics: TextMetrics;
let wasOut: boolean;

let currentAtom: AtomNode = new AtomNode("A"); //Default character A
atomDisplay.innerHTML = currentAtom.Identifier;

/**
 * Checks to see if the pressed key is a valid letter, if yes sets it to the atom node.
 * @param event The keypress event
 */
export function atomKeyPress(event: KeyboardEvent) {
    const regex = new RegExp(/^[A-Za-z]$/);
    if (regex.test(event.key)) {
        currentAtom.Identifier = event.key;
        atomDisplay.innerHTML = currentAtom.Identifier;
    }
}

/**
 * If a legal letter has been chosen places it on the canvas.
 * Color is based on whether the atom is in a valid place, determines the atom bounding box.
 * @param event The mouse down event
 * @returns Whether or not the mouse event took place
 */
export function atomMouseDown(event: MouseEvent) {
    atomMetrics = ctx.measureText(currentAtom.Identifier);
    wasOut = false;
    const startVertex: Point = new Point(
        event.clientX,
        event.clientY - atomMetrics.actualBoundingBoxAscent
    );
    currentAtom.Rectangle = new Rectangle(
        startVertex,
        atomMetrics.width,
        atomMetrics.fontBoundingBoxDescent + atomMetrics.actualBoundingBoxAscent
    );
    currentAtom.Origin = new Point(event.clientX, event.clientY);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    if (tree.canInsert(currentAtom)) {
        drawAtom(currentAtom, "#00FF00");
    } else {
        drawAtom(currentAtom, "#FF0000");
    }
}

/**
 * Moves the current atom to the current mouse position, redraws the canvas and redraws the atom.
 * @param event The mouse move event
 */
export function atomMouseMove(event: MouseEvent) {
    currentAtom.Origin = new Point(event.clientX, event.clientY);
    currentAtom.Rectangle.startVertex = new Point(
        event.clientX,
        event.clientY - atomMetrics.actualBoundingBoxAscent
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    if (!wasOut) {
        if (tree.canInsert(currentAtom)) {
            drawAtom(currentAtom, "#00FF00");
        } else {
            drawAtom(currentAtom, "#FF0000");
        }
    }
}

/**
 * If the atom is in a valid place, adds it to the tree. Redraws the canvas and resets currentAtom.
 * @param event The mouse up event
 */
export function atomMouseUp() {
    if (tree.canInsert(currentAtom) && !wasOut) {
        tree.insert(currentAtom);
    }
    currentAtom = new AtomNode(currentAtom.Identifier);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    console.log(tree.toString());
}

/**
 * If the mouse leaves the canvas resets the current atom.
 */
export function atomMouseOut() {
    currentAtom = new AtomNode(currentAtom.Identifier);
    wasOut = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
}

/**
 * Draws the given atomNode with the given color.
 * @param thisAtom the atomMode to be drawn.
 * @param color the color of the atom.
 */
function drawAtom(thisAtom: AtomNode, color: string) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const displayBox = thisAtom.rectangle;
    ctx.beginPath();
    ctx.fillText(thisAtom.identifier, thisAtom.origin.x, thisAtom.origin.y);
    ctx.rect(
        displayBox.startVertex.x,
        displayBox.startVertex.y,
        displayBox.width,
        displayBox.height
    );
    ctx.stroke();
}
