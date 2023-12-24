import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {TreeContext} from "../Contexts/TreeContext";

/**
 * Collection of methods used for Proof Mode tools.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

/**
 * Copies and returns the AEGTree of the current proof step. Returns an empty AEGTree
 * if no steps were taken.
 *
 * @returns AEGTree of the current proof step.
 */
export function getCurrentProofTree(): AEGTree {
    const currentTree = new AEGTree();
    //Check whether the current step has been defined.
    if (TreeContext.currentProofStep) {
        currentTree.sheet = TreeContext.currentProofStep.tree.sheet.copy();
    }

    return currentTree;
}

/**
 * Checks and returns if the incoming node can be inserted into the incoming AEGTree and
 * the proof's copy of the incoming AEGTree.
 *
 * @param currentNode Incoming node.
 * @returns True if currentNode can be inserted into tree and the proof's copy of tree.
 */
export function isMoveLegal(tree: AEGTree, currentNode: CutNode | AtomNode): boolean {
    return tree.canInsert(currentNode) && proofCanInsert(new AEGTree(tree.sheet), currentNode);
}

/**
 * Checks and returns if the incoming node can be inserted into a copy of the incoming AEGTree.
 *
 * @param tree Incoming AEGTree.
 * @param currentNode Incoming node.
 * @returns True if tree and the AEGTree of the current proof step are equal.
 */
export function proofCanInsert(tree: AEGTree, currentNode: CutNode | AtomNode): boolean {
    if (TreeContext.currentProofStep) {
        tree.insert(currentNode.copy());
        return tree.isEqualTo(new AEGTree(TreeContext.currentProofStep.tree.sheet));
    } else {
        return false;
    }
}
