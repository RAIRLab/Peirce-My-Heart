import {AEGTree} from "../AEG/AEGTree";
import {CutNode} from "../AEG/CutNode";
import {AtomNode} from "../AEG/AtomNode";
import {treeContext} from "../treeContext";

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
