import {AEGTree} from "../AEG/AEGTree";
import {changeCursorStyle} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {getCurrentProofTree} from "./ProofToolsUtils";
import {ProofNode} from "../AEG/ProofNode";
import {redrawProof} from "../SharedToolUtils/DrawUtils";
import {treeContext} from "../treeContext";

/**
 * File containing insertion node movement event handlers.
 * @author Anusha Tiwari
 */

//The initial point the user pressed down.
// let startingPoint: Point;

//The selected subgraph that we will be placing
let currentGraphs: CutNode;

//The tree that we are trying to insert the graph into
let currentTree: AEGTree;

//Whether or not applying this rule will result in the creation of a new node for our proof
let legalNode: boolean;

export function pasteInProofMouseDown() {
    currentTree = getCurrentProofTree();
    currentGraphs = treeContext.selectForProof.sheet;

    if (
        currentGraphs.children.length > 0 &&
        treeContext.proof.length === 1 &&
        currentTree.sheet.isEmptySheet()
    ) {
        legalNode = true;
        changeCursorStyle("cursor: copy");
    }
}

export function pasteInProofMouseMove() {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}

export function pasteInProofMouseUp() {
    if (legalNode) {
        changeCursorStyle("cursor: default");
        currentTree.sheet = currentGraphs;
        treeContext.pushToProof(new ProofNode(currentTree, "Pasted"));
    }
    legalNode = false;
    redrawProof();
}

export function pasteInProofMouseOut() {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}
