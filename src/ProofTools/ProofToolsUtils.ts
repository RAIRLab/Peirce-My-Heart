import {AEGTree} from "../AEG/AEGTree";
import {CutNode} from "../AEG/CutNode";
import {AtomNode} from "../AEG/AtomNode";
import {treeContext} from "../treeContext";

/**
 * Get a copy of the AEGTree of the current step in the proof.
 * If there is no steps in the proof, returns a new AEGTree
 * @returns A copy of the AEGTree of the current step in the proof
 */
export function getCurrentProofTree() {
    const currentTree = new AEGTree();
    //Check whether the current step has been defined
    if (treeContext.currentProofStep) {
        //If it has, get a copy of its tree
        currentTree.sheet = treeContext.currentProofStep.tree.sheet.copy();
    }

    return currentTree;
}

/**
 * Determines if the current node can be inserted in a position that is not overlapping with anything
 * and it being inserted would result in a graph that would equal one another.
 * @param currentNode The node that will be checked for legality
 * @returns Whether or no the node is in a legal position
 */
export function isMoveLegal(tree: AEGTree, currentNode: CutNode | AtomNode): boolean {
    return tree.canInsert(currentNode) && proofCanInsert(new AEGTree(tree.sheet), currentNode);
}

/**
 * Inserts a copy of our current node into a copy of our current tree and compares this to a copy
 * of the original tree.
 * @param tree A copy of the current tree without the current node
 * @param currentNode The node that will be checked for legality
 * @returns Whether or not the two graphs are equal
 */
export function proofCanInsert(tree: AEGTree, currentNode: CutNode | AtomNode): boolean {
    if (treeContext.currentProofStep) {
        tree.insert(currentNode.copy());
        return tree.isEqualTo(new AEGTree(treeContext.currentProofStep.tree.sheet));
    } else {
        return false;
    }
}
