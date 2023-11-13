/**
 * File containing event handlers to select from draw mode and copy to proof mode
 * @author Anusha Tiwari
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
// import {offset} from "./DragMode";
import {drawAtom, drawCut, cleanCanvas, redrawTree} from "./DrawUtils";
import {legalColor} from "../Themes";
import {AEGTree} from "../AEG/AEGTree";

//The initial point the user pressed down.
let selectPoint: Point;

//The current node and its children we will be moving.
let selectedNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be selected.
let legalNode: boolean;

/**
 * Handles the MouseDown event while in copy to proof mode.
 * Gets the lowest node on the tree at the point identified by the MouseDown event.
 * If it is a legal selection, highlights the node.
 * @param event The MouseDown event while in copy to proof mode
 */
export function toProofMouseDown(event: MouseEvent) {
    //Reset our selectForProof tree to a blank AEG so that a new graph can be selected
    treeContext.selectForProof.sheet = new AEGTree().sheet;

    selectPoint = new Point(event.x, event.y);
    selectedNode = treeContext.tree.getLowestNode(selectPoint);

    const tempTree = new AEGTree(treeContext.tree.sheet);

    if (selectedNode !== null) {
        legalNode = true;

        //Temporarily remove the selected part of the tree and highlight selected part only
        if (selectedNode !== tempTree.sheet) {
            const tempParent = tempTree.getLowestParent(selectPoint);
            if (tempParent !== null) {
                tempParent.remove(selectPoint);
            }
            redrawTree(tempTree);
        } else {
            //If the entire tree is selected, clear the canvas and redraw entire tree in legalColor.
            cleanCanvas();
        }

        //Highlight the selected part by redrawing in legalColor
        if (selectedNode instanceof AtomNode) {
            drawAtom(selectedNode, legalColor(), true);
        } else {
            highlightNode(selectedNode, legalColor());
        }

        /* //Add the selected part back into the tree
        if (selectedNode !== treeContext.tree.sheet) {
            treeContext.tree.insert(selectedNode);
        } */
    }
}

/**
 * Handles the MouseMove event while in copy to proof mode.
 * Currently MouseMove does not allow for node selection. (Can be changed as per team review)
 */
export function toProofMouseMove() {
    selectedNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}

/**
 * Handles the MouseUp event while in copy to proof mode.
 * MouseUp displays an alert stating that a legal node has been selected
 */
export function toProofMouseUp() {
    if (legalNode) {
        //If the selected node is the tree, insert its children so we do not insert another tree.
        if (selectedNode instanceof CutNode && selectedNode.ellipse === null) {
            for (let i = 0; i < selectedNode.children.length; i++) {
                treeContext.selectForProof.insert(selectedNode.children[i]);
            }
        } else {
            treeContext.selectForProof.insert(selectedNode!);
        }
        redrawTree(treeContext.tree);
        alert("Graph selected, you may now toggle to proof mode");
    }
}

/**
 * Handles the MouseOut event of when the mouse moves outside the canvas while in copy to proof mode.
 * On MouseOut, the selection is cancelled.
 */
export function toProofMouseOut() {
    selectedNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}

/**
 * Helper function to highlight the specific selected node
 */
function highlightNode(child: AtomNode | CutNode, color: string) {
    if (child instanceof AtomNode) {
        drawAtom(child, color, true);
    } else if (child instanceof CutNode) {
        drawCut(child, color);
        for (let i = 0; i < child.children.length; i++) {
            highlightNode(child.children[i], color);
        }
    }
}
