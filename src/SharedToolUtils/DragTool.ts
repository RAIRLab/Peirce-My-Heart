import {Point} from "../AEG/Point";
import {redrawProof, redrawTree} from "./DrawUtils";
import {treeContext} from "../treeContext";

/**
 * Collection of functions for drag based events.
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

//Original point later points will be compared to.
let originPoint: Point;

//Difference between real AEG coordinates and current canvas location.
export let offset: Point = new Point(0, 0);

//Tracks if the mouse has ever left canvas disallowing future movements.
let wasOut: boolean;

/**
 * Sets the origin point of the user's click so it can be compared for offset.
 * @param event The mouse down event in drag mode
 */
export function dragMouseDown(event: MouseEvent) {
    originPoint = new Point(event.x - offset.x, event.y - offset.y);
    wasOut = false;
}

/**
 * Compares the origin point with the current point and calculate the current difference as offset.
 * @param event The mouse move event in drag mode
 */
export function dragMouseMove(event: MouseEvent) {
    if (!wasOut) {
        offset = new Point(event.x - originPoint.x, event.y - originPoint.y);

        if (treeContext.modeState === "Proof") {
            redrawProof();
        } else {
            redrawTree(treeContext.tree);
        }
    }
}

/**
 * Sets wasOut to true when the cursor leaves the canvas and redraws the canvas.
 */
export function dragMosueOut() {
    wasOut = true;
    if (treeContext.modeState === "Proof") {
        redrawProof();
    } else {
        redrawTree(treeContext.tree);
    }
}
