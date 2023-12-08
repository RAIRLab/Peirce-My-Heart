/**
 * File containing insertion node movement event handlers.
 * @author Anusha Tiwari
 */
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {redrawProof} from "../DrawModes/DrawUtils";
import {AEGTree} from "../AEG/AEGTree";
import {ProofNode} from "../AEG/ProofNode";

//The initial point the user pressed down.
// let startingPoint: Point;

//The selected subgraph that we will be placing
let currentGraphs: CutNode;

//The tree that we are trying to insert the graph into
let currentTree: AEGTree;

//Whether or not applying this rule will result in the creation of a new node for our proof
let legalNode: boolean;

export function pasteInProofMouseDown() {
    currentTree = new AEGTree();
    if (treeContext.currentProofStep) {
        currentTree.sheet = treeContext.currentProofStep.tree.sheet.copy();
    }
    currentGraphs = treeContext.selectForProof.sheet;

    if (
        currentGraphs.children.length > 0 &&
        treeContext.proof.length === 1 &&
        currentTree.sheet.isEmptySheet()
    ) {
        legalNode = true;
    }
}

export function pasteInProofMouseMove() {
    legalNode = false;
    redrawProof();
}

export function pasteInProofMouseUp() {
    if (legalNode) {
        currentTree.sheet = currentGraphs;
        treeContext.pushToProof(new ProofNode(currentTree, "Pasted"));
    }
    legalNode = false;
    redrawProof();
}

export function pasteInProofMouseOut() {
    legalNode = false;
    redrawProof();
}
