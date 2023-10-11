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
let atomMetrics: TextMetrics;

let hasMouseDown: Boolean = false;
let hasAtom: Boolean = false;
let currentAtom: AtomNode = new AtomNode("a"); //MAKING a THE DEFAULT IDENTIFIER FOR ATOMS
atomDisplay.innerHTML = currentAtom.Identifier;

/**
 * Will compare the event given with all possible events it could be.
 * keypress checks to see if the key was a letter and if yes sets it to that letter.
 * mousedown sets the atom down, calculates the bounding box, and checks for what color.
 * mousemove will alter the origin position and the starting vertex of the bounding box.
 * mouseup will add the atom to the tree if it is in a valid location.
 * mosueout will end drawing early.
 * @param event The event that will be used
 * @param event the event that will be used
 */
export function atomHandler(event: Event) {
    if (event.type === "keypress") {
        const thisEvent: KeyboardEvent = <KeyboardEvent>event;
        const regex = new RegExp(/^[A-Za-z]$/);
        if (regex.test(thisEvent.key)) {
            currentAtom.Identifier = thisEvent.key;
            atomDisplay.innerHTML = currentAtom.Identifier;
            hasAtom = true;
        }
    } else if (event.type === "mousedown" && hasAtom) {
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
}

/**
 * Draws the given atomNode with the given color.
 * @param thisAtom the atomnode to be drawn.
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
