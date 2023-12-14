import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {cleanCanvas, highlightNode, redrawTree} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {treeContext} from "../treeContext";

/**
 * Contains methods for copying AEGs to Proof Mode.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

//First Point the user clicks.
let currentPoint: Point;

//AEG in question.
let selectedNode: CutNode | AtomNode | null = null;

//True if selectedNode is not null.
let legalNode: boolean;

//Deep copy of the Draw Mode AEGTree.
let tempTree: AEGTree;

//Under the "Selected subgraph:" text in CopyToProof's toolbar.
const selectString = <HTMLParagraphElement>document.getElementById("selectionString");

/**
 * Sets tempTree to a new AEGTree.
 * Then sets selectedNode to the lowest node at the coordinates given by the incoming MouseEvent.
 * Then highlights selectedNode the legal color.
 *
 * @param event Incoming MouseEvent.
 */
export function copyFromDrawMouseDown(event: MouseEvent) {
    tempTree = new AEGTree(treeContext.tree.sheet);
    //Set our selectForProof tree to a new AEGTree so that a new graph can be selected.
    treeContext.selectForProof.sheet = new AEGTree().sheet;

    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    selectedNode = treeContext.tree.getLowestNode(currentPoint);

    highlightSelection();
}

/**
 * Sets selectedNode to the lowest node at the coordinates given by the incoming MouseEvent.
 * Currently MouseMove does not allow for node selection. (Can be changed as per team review.)
 *
 * @param event Incoming MouseEvent.
 */
export function copyFromDrawMouseMove(event: MouseEvent) {
    if (legalNode) {
        redrawTree(treeContext.tree);

        currentPoint = new Point(event.x - offset.x, event.y - offset.y);
        selectedNode = treeContext.tree.getLowestNode(currentPoint);

        highlightSelection();
    }
}

/**
 * Inserts selectedNode and all its children into treeContext's selectForProof field.
 * Then sets selectedNode to null.
 * Then sets legality to false.
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

        redrawTree(treeContext.tree);
    }

    selectedNode = null;
    legalNode = false;
}

/**
 * Sets selectedNode to null.
 * Then sets legality to false.
 * Then redraws the Draw Mode AEGTree.
 */
export function copyFromDrawMouseOut() {
    selectedNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}

/**
 * Removes selectedNode from the Draw Mode AEGTree and draws it as the legal color.
 */
function highlightSelection() {
    //Displayed under the "Selected subgraph:" text.
    const tree = new AEGTree();
    let removed = false;

    if (selectedNode !== null) {
        legalNode = true;

        //Temporarily remove selectedNode from tree and highlight selectedNode only.
        if (
            selectedNode instanceof AtomNode ||
            !(selectedNode as CutNode).isEqualTo(tempTree.sheet)
        ) {
            tree.insert(selectedNode);
            const tempParent = tempTree.getLowestParent(currentPoint);
            //Remove the node at currentPoint from tempTree so that selectedNode is highlighted without color overlaps.
            if (tempParent !== null) {
                tempParent.remove(currentPoint);
                removed = true;
            }
            redrawTree(tempTree);
        } else {
            tree.sheet = selectedNode as CutNode;
            //If The Sheet of Assertion is selected,
            //Clear canvas so the entire Draw Mode AEGTree is highlighted without color overlaps.
            cleanCanvas();
        }

        highlightNode(selectedNode, legalColor());

        //If something was removed, add it back in.
        if (removed) {
            tempTree.insert(selectedNode);
        }
    } else {
        legalNode = false;
    }
    selectString.innerHTML = tree.toString();
}
