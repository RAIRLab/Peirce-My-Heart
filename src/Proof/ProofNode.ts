/**
 * @file Contains the ProofNode class, which defines a single step in a proof.
 *
 * @author Anusha Tiwari
 */

import {AEGTree} from "../AEG/AEGTree";
import {ProofModeMove} from "./ProofModeMove";
import {TreeContext} from "../TreeContext";

/**
 * Defines a single step in a proof.
 */
export class ProofNode {
    /**
     * The AEGTree at this proof step.
     */
    public tree: AEGTree;

    /**
     * Inference rule applied in this ProofNode.
     */
    public appliedRule: ProofModeMove;

    /**
     * Index of this ProofNode in treeContext.ts' proof array.
     * @todo Highly unlikely we need this, adds another thing to keep track of and update -James
     */
    public index: number;

    /**
     * Constructs a ProofNode.
     *
     * @param tree AEGTree at this proof step.
     * If not passed in, an empty AEGTree will be constructed and set as this ProofNode's tree.
     * @param rule Inference rule applied.
     * If not passed in, appliedRule will be set as an empty string.
     */
    public constructor(tree?: AEGTree, rule?: ProofModeMove) {
        this.appliedRule = rule ?? ProofModeMove.CLEAR;
        this.tree = new AEGTree(tree?.sheet);
        this.index = TreeContext.proof.length;
    }
}
