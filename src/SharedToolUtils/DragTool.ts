import {changeCursorStyle} from "./DrawUtils";
import {Point} from "../AEG/Point";
import {redrawProof, redrawTree} from "./DrawUtils";
import {treeContext} from "../treeContext";

/**
 * Collection of methods for drag related tools.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

//Original Point later Points will be compared to.
let originPoint: Point;

//Difference between real AEG coordinates and current canvas location.
export let offset: Point = new Point(0, 0);

//Tracks if the mouse has ever left the HTML canvas.
let wasOut: boolean;

/**
 * Sets the canvas' style attribute to grab.
 */
export function dragMouseEnter() {
    changeCursorStyle("cursor: grab");
}

/**
 * Sets originPoint to the coordinates of the incoming MouseEvent.
 * @param event Incoming MouseEvent.
 */
export function dragMouseDown(event: MouseEvent) {
    changeCursorStyle("cursor: grabbing");
    originPoint = new Point(event.x - offset.x, event.y - offset.y);
    wasOut = false;
}

/**
 * Compares originPoint with the coordinates of the incoming MouseEvent and redraws the tree.
 * @param event Incoming MouseEvent.
 */
export function dragMouseMove(event: MouseEvent) {
    if (!wasOut) {
        changeCursorStyle("cursor: grabbing");
        offset = new Point(event.x - originPoint.x, event.y - originPoint.y);
        redrawCorrectTree();
    }
}

/**
 * Sets the canvas' style tag to grab.
 */
export function dragMouseUp() {
    changeCursorStyle("cursor: grab");
}

/**
 * Sets wasOut to true and redraws the canvas.
 */
export function dragMouseOut() {
    changeCursorStyle("cursor: default");
    wasOut = true;
    redrawCorrectTree();
}

/**
 * Redraws the correct tree based on global mode state.
 */
function redrawCorrectTree() {
    if (treeContext.modeState === "Proof") {
        redrawProof();
    } else {
        redrawTree(treeContext.tree);
    }
}
