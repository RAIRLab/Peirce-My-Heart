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
let atomMetrics: TextMetrics;

let currentAtom: AtomNode = new AtomNode();
let hasKeyPress = false;

/**
 * Checks to see if the pressed key is a valid letter, if yes sets it to the atom node.
 * @param event The keypress event
 */
export function atomHandler(event: Event) {
    if (event.type === "keypress") {
        const thisEvent: KeyboardEvent = <KeyboardEvent>event;
        const regex = new RegExp(/^[A-Za-z]$/);
        if (regex.test(thisEvent.key)) {
            currentAtom.Identifier = thisEvent.key;
            hasAtom = true;
        }
    } else if (event.type === "mousedown" && hasAtom) {
export function atomKeyPress(event: KeyboardEvent) {
    const thisEvent: KeyboardEvent = <KeyboardEvent>event;
    const regex = new RegExp(/^[A-Za-z]$/);
    if (regex.test(thisEvent.key)) {
        currentAtom.identifier = thisEvent.key;
        hasKeyPress = true;
    }
}

/**
 * If a legal letter has been chosen places it on the canvas.
 * Color is based on whether the atom is in a valid place, determines the atom bounding box.
 * @param event The mouse down event
 * @returns Whether or not the mouse event took place
 */
export function atomMouseDown(event: MouseEvent): boolean {
    if (hasKeyPress) {
        const thisEvent: MouseEvent = <MouseEvent>event;
        atomMetrics = ctx.measureText(currentAtom.Identifier);
        const startVertex: Point = new Point(
            thisEvent.clientX,
            thisEvent.clientY - atomMetrics.actualBoundingBoxAscent
        );
        currentAtom.Rectangle = new Rectangle(
            startVertex,
            atomMetrics.width,
            atomMetrics.fontBoundingBoxDescent + atomMetrics.actualBoundingBoxAscent
        );
        currentAtom.Origin = new Point(thisEvent.clientX, thisEvent.clientY);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet);
        if (tree.canInsert(currentAtom)) {
            drawAtom(currentAtom, "#00FF00");
        } else {
            drawAtom(currentAtom, "#6600ff");
        }
        hasMouseDown = true;
    } else if (event.type === "mousemove" && hasMouseDown) {
        const thisEvent: MouseEvent = <MouseEvent>event;
        currentAtom.Origin = new Point(thisEvent.clientX, thisEvent.clientY);
        currentAtom.Rectangle.startVertex = new Point(
            thisEvent.clientX,
            thisEvent.clientY - atomMetrics.actualBoundingBoxAscent
        );
        return true;
    }
    return false;
}

/**
 * Moves the current atom to the current mouse position, redraws the canvas and redraws the atom.
 * @param event The mouse move event
 */
export function atomMouseMove(event: MouseEvent) {
    const thisEvent: MouseEvent = <MouseEvent>event;
    currentAtom.origin = new Point(thisEvent.clientX, thisEvent.clientY);
    currentAtom.rect.startVertex = new Point(
        thisEvent.clientX,
        thisEvent.clientY - atomMetrics.actualBoundingBoxAscent
    );

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet);
        if (tree.canInsert(currentAtom)) {
            drawAtom(currentAtom, "#00FF00");
        } else {
            drawAtom(currentAtom, "#FF0000");
        }
    } else if (event.type === "mouseup" && hasMouseDown) {
        if (tree.canInsert(currentAtom)) {
            tree.insert(currentAtom);
        }
        currentAtom = new AtomNode(currentAtom.Identifier);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet);
        hasMouseDown = false;
        console.log(tree.toString());
    } else if (event.type === "mouseout" && hasMouseDown) {
        hasMouseDown = false;
        currentAtom = new AtomNode(currentAtom.Identifier);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    if (tree.canInsert(currentAtom)) {
        drawAtom(currentAtom, "#00FF00");
    } else {
        drawAtom(currentAtom, "#FF0000");
    }
}

/**
 * If the atom is in a valid place, adds it to the tree. Redraws the canvas and resets currentAtom.
 * @param event The mouse up event
 */
export function atomMouseUp(event: MouseEvent) {
    if (tree.canInsert(currentAtom)) {
        tree.insert(currentAtom);
    }
    currentAtom = new AtomNode(currentAtom.identifier);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    console.log(tree.toString());
}

/**
 * If the mouse leaves the canvas resets the current atom.
 */
export function atomMouseOut() {
    currentAtom = new AtomNode(currentAtom.identifier);
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
    const displayBox = thisAtom.Rectangle;
    ctx.beginPath();
    ctx.fillText(thisAtom.Identifier, thisAtom.Origin.x, thisAtom.Origin.y);
    ctx.rect(
        displayBox.startVertex.x,
        displayBox.startVertex.y,
        displayBox.width,
        displayBox.height
    );
    ctx.stroke();
}
