/**
 * @file Contains methods for pasting AEGs into Proof Mode.
 *
 * @author Anusha Tiwari
 */

import {AEGTree} from "../AEG/AEGTree";
import {changeCursorStyle, redrawProof} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {getCurrentProofTree} from "./ProofToolUtils";
import {ProofModeMove, ProofModeNode} from "../ProofHistory/ProofModeNode";
import {TreeContext} from "../TreeContext";

//AEG in question.
let currentGraph: CutNode;

//AEGTree we want to insert currentGraph into.
let currentTree: AEGTree;

//True if we are able to paste into Proof Mode.
let legalNode: boolean;

/**
 * Sets fields appropriately.
 */
export function pasteInProofMouseDown(): void {
    currentTree = getCurrentProofTree();
    currentGraph = TreeContext.selectForProof.sheet;

    if (
        currentGraph.children.length > 0 &&
        TreeContext.proof.length === 1 &&
        currentTree.sheet.isEmptySheet()
    ) {
        legalNode = true;
        changeCursorStyle("cursor: copy");
    }
}

/**
 * Resets cursor style and redraws proof.
 */
export function pasteInProofMouseMove(): void {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}

/**
 * Pushes a "Pasted" step to the proof history and redraws the proof.
 */
export function pasteInProofMouseUp(): void {
    if (legalNode) {
        changeCursorStyle("cursor: default");
        currentTree.sheet = currentGraph;
        TreeContext.pushToProof(new ProofModeNode(currentTree, ProofModeMove.PASTE_GRAPH));
    }
    legalNode = false;
    redrawProof();
}

/**
 * Sets fields back to defaults.
 */
export function pasteInProofMouseOut(): void {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}
