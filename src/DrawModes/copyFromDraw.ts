/**
 * File containing event handlers to select from draw mode and copy to proof mode
 * @author Anusha Tiwari
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "./DragTool";
import {drawAtom, cleanCanvas, redrawTree, highlightNode} from "./DrawUtils";
import {legalColor} from "../Themes";
import {AEGTree} from "../AEG/AEGTree";

//The initial point the user pressed down.
let currentPoint: Point;

//The current node and its children we will be moving.
let selectedNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be selected.
let legalNode: boolean;

//A deep copy of the global tree
let tempTree: AEGTree;

const selectString = <HTMLParagraphElement>document.getElementById("selectionString");
/**
 * Handles the MouseDown event while in copy to proof mode.
 * Gets the lowest node on the tree at the point identified by the MouseDown event.
 * If it is a legal selection, highlights the node.
 * @param event The MouseDown event while in copy to proof mode
 */
export function copyFromDrawMouseDown(event: MouseEvent) {
    tempTree = new AEGTree(treeContext.tree.sheet);
    //Reset our selectForProof tree to a blank AEG so that a new graph can be selected
    treeContext.selectForProof.sheet = new AEGTree().sheet;

    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    selectedNode = treeContext.tree.getLowestNode(currentPoint);

    isLegal();
}

/**
 * Handles the MouseMove event while in copy to proof mode.
 * Currently MouseMove does not allow for node selection. (Can be changed as per team review)
 */
export function copyFromDrawMouseMove(event: MouseEvent) {
    if (legalNode) {
        redrawTree(treeContext.tree);

        currentPoint = new Point(event.x - offset.x, event.y - offset.y);
        selectedNode = treeContext.tree.getLowestNode(currentPoint);

        isLegal();
    }
}

/**
 * Handles the MouseUp event while in copy to proof mode.
 * MouseUp displays an alert stating that a legal node has been selected
 */
export function copyFromDrawMouseUp() {
    if (legalNode && selectedNode !== null) {
        //If the selected node is the tree, insert its children only
        if (selectedNode instanceof CutNode && selectedNode.ellipse === null) {
            for (let i = 0; i < selectedNode.children.length; i++) {
                treeContext.selectForProof.insert(selectedNode.children[i]);
            }
        } else {
            treeContext.selectForProof.insert(selectedNode);
        }

        console.log("selected: " + treeContext.selectForProof.toString());
        redrawTree(treeContext.tree);
    }

    selectedNode = null;
    legalNode = false;
}

/**
 * Handles the MouseOut event of when the mouse moves outside the canvas while in copy to proof mode.
 * On MouseOut, the selection is cancelled.
 */
export function copyFromDrawMouseOut() {
    selectedNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}

function isLegal() {
    //A tree which will contain our selected node so that it can be displayed on the sub bar
    const tree = new AEGTree();
    let removed = false;

    if (selectedNode !== null) {
        legalNode = true;

        //Temporarily remove the selected part of the tree and highlight selected part only
        //If the sheet has been selected, clear the canvas and redraw the entire tree
        if (
            selectedNode instanceof AtomNode ||
            !(selectedNode as CutNode).isEqualTo(tempTree.sheet)
        ) {
            tree.insert(selectedNode);
            const tempParent = tempTree.getLowestParent(currentPoint);
            //Remove the selected node from the tree so that it can be highlighted cleanly
            if (tempParent !== null) {
                tempParent.remove(currentPoint);
                removed = true;
            }
            redrawTree(tempTree);
        } else {
            tree.sheet = selectedNode as CutNode;
            //If the sheet is selected, clear the canvas so that entire tree is highlighted cleanly
            cleanCanvas();
        }

        //Highlight the selected part by redrawing in legalColor
        if (selectedNode instanceof AtomNode) {
            drawAtom(selectedNode, legalColor(), true);
        } else {
            highlightNode(selectedNode, legalColor());
        }

        //If something was removed, add it back kin
        if (removed) {
            tempTree.insert(selectedNode);
        }
    } else {
        legalNode = false;
    }
    selectString.innerHTML = tree.toString();
}
