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

let hasMouseDown: Boolean = false;
let hasAtom: Boolean = false;
let currentAtom: AtomNode = new AtomNode();

export function atomHandler(event: Event) {
    if (event.type === "keypress") {
        const thisEvent: KeyboardEvent = <KeyboardEvent>event;
        const regex = new RegExp(/^[A-Za-z]$/);
        if (regex.test(thisEvent.key)) {
            currentAtom.identifier = thisEvent.key;
            hasAtom = true;
        }
    } else if (event.type === "mousedown" && hasAtom) {
        const thisEvent: MouseEvent = <MouseEvent>event;
        atomMetrics = ctx.measureText(currentAtom.identifier);
        const startVertex: Point = new Point(
            thisEvent.clientX,
            thisEvent.clientY - atomMetrics.actualBoundingBoxAscent
        );
        currentAtom.rect = new Rectangle(
            startVertex,
            atomMetrics.width,
            atomMetrics.fontBoundingBoxDescent + atomMetrics.actualBoundingBoxAscent
        );

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
        currentAtom = new AtomNode(currentAtom.identifier);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet);
        hasMouseDown = false;
        console.log(tree.toString());
    } else if (event.type === "mouseout" && hasMouseDown) {
        hasMouseDown = false;
        currentAtom = new AtomNode(currentAtom.identifier);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet);
    }
}

function drawAtom(thisAtom: AtomNode, color: string) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const displayBox = thisAtom.rect;
    ctx.beginPath();
    ctx.fillText(thisAtom.identifier, thisAtom.origin.x, thisAtom.origin.y);
    ctx.rect(
        displayBox.startVertex.x,
        displayBox.startVertex.y,
        displayBox.width,
        displayBox.height
    );
    ctx.stroke();
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "000000";
}
