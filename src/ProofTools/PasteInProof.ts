import {AEGTree} from "../AEG/AEGTree";
import {changeCursorStyle} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {getCurrentProofTree} from "./ProofToolsUtils";
import {ProofNode} from "../AEG/ProofNode";
import {redrawProof} from "../SharedToolUtils/DrawUtils";
import {treeContext} from "../treeContext";

/**
 * Containing methods for pasting AEGs into Proof Mode.
 *
 * @author Anusha Tiwari
 */

//AEG in question.
let currentGraph: CutNode;

//AEGTree we want to insert currentGraph into.
let currentTree: AEGTree;

//True if we are able to paste into Proof Mode.
let legalNode: boolean;

/**
 * Sets currentTree to the current proof tree.
 * Then sets currentGraph to the sheet in treeContext's selectForProof field.
 * Then sets legality to true and cursor style to copy if currentGraph has children and currentTree is empty.
 */
export function pasteInProofMouseDown() {
    currentTree = getCurrentProofTree();
    currentGraph = treeContext.selectForProof.sheet;

    if (
        currentGraph.children.length > 0 &&
        treeContext.proof.length === 1 &&
        currentTree.sheet.isEmptySheet()
    ) {
        legalNode = true;
        changeCursorStyle("cursor: copy");
    }
}

/**
 * Sets cursor style to default.
 * Then sets legality to false.
 * Then redraws the proof.
 */
export function pasteInProofMouseMove() {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}

/**
 * Sets the cursor style to default, sets the proof's Sheet of Assertion to currentGraph, and creates an appropriate proof step if legality is true.
 * Then sets legality to false.
 * Then redraws the proof.
 */
export function pasteInProofMouseUp() {
    if (legalNode) {
        changeCursorStyle("cursor: default");
        currentTree.sheet = currentGraph;
        treeContext.pushToProof(new ProofNode(currentTree, "Pasted"));
    }
    legalNode = false;
    redrawProof();
}

/**
 * Sets cursor style to default.
 * Then sets legality to false.
 * Then redraws the proof.
 */
export function pasteInProofMouseOut() {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}
