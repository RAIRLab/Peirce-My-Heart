import {Point} from "./AEG/Point";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {redrawCut} from "./index";
import {tree} from "./index";
import {Rectangle} from "./AEG/Rectangle";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");
const modeElm: HTMLSelectElement = <HTMLSelectElement>document.getElementById("mode");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

let hasMouseDown: Boolean = false;
let currentEllipse: Ellipse = new Ellipse();
let startingPoint: Point = new Point();

export function cutHandler(event: MouseEvent) {
    let newCut: CutNode = new CutNode();
    const currentPoint: Point = new Point();

    if (event.type === "mousedown") {
        hasMouseDown = true;
        startingPoint.x = event.clientX;
        startingPoint.y = event.clientY;
    } else if (event.type === "mousemove" && hasMouseDown) {
        currentPoint.x = event.clientX;
        currentPoint.y = event.clientY;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet);
        currentEllipse = createEllipse(startingPoint, currentPoint);
        newCut.ellipse = currentEllipse;

        if (tree.canInsert(newCut) && currentEllipse.radiusX > 30 && currentEllipse.radiusY > 30) {
            drawEllipse(newCut, "#00FF00");
        } else {
            drawEllipse(newCut, "#6600ff");
        }
    } else if (event.type === "mouseup" && hasMouseDown) {
        newCut = new CutNode(currentEllipse);
        if (tree.canInsert(newCut) && currentEllipse.radiusX > 30 && currentEllipse.radiusY > 30) {
            tree.insert(newCut);
        }
        hasMouseDown = false;
        startingPoint = new Point();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet);
        console.log(tree.toString());
    } else if (event.type === "mouseout" && hasMouseDown) {
        hasMouseDown = false;
        startingPoint = new Point();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet);
    }
}

/**
 * A function to draw an ellipse between two points designated by the user.
 * @param original the point where the user originally clicked
 * @param current the point where the user's mouse is currently located
 */
export function createEllipse(original: Point, current: Point): Ellipse {
    const center: Point = new Point(
        (current.x - original.x) / 2 + original.x,
        (current.y - original.y) / 2 + original.y
    );

    const sdx = original.x - current.x;
    const sdy = original.y - current.y;
    const dx = Math.abs(sdx);
    const dy = Math.abs(sdy);
    let rx, ry: number;

    if (modeElm.value === "circumscribed") {
        //This inscribed ellipse solution is inspired by the discussion of radius ratios in
        //https://stackoverflow.com/a/433426/6342516
        const rv: number = Math.floor(center.distance(current));
        ry = Math.floor(rv * (dy / dx));
        rx = Math.floor(rv * (dx / dy));
    } else {
        rx = dx / 2;
        ry = dy / 2;
    }

    if (showRectElm.checked) {
        ctx.beginPath();
        ctx.rect(original.x, original.y, -sdx, -sdy);
        ctx.stroke();
    }

    return new Ellipse(center, rx, ry);
}

function drawEllipse(thisCut: CutNode, color: string) {
    ctx.strokeStyle = color;
    const ellipse: Ellipse = <Ellipse>thisCut.ellipse;
    const displayBox: Rectangle = ellipse.boundingBox;
    const center: Point = ellipse.center;
    ctx.beginPath();
    ctx.rect(
        displayBox.startVertex.x,
        displayBox.startVertex.y,
        displayBox.width,
        displayBox.height
    );
    ctx.ellipse(center.x, center.y, ellipse.radiusX, ellipse.radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
}
