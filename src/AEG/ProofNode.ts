import {AEGTree} from "./AEGTree";

/**
 * The structure representing a single node of the proof
 * @author Anusha Tiwari
 */
export class ProofNode {
    /**
     * The AEG Tree representing the current state of the proof
     */
    public tree: AEGTree;

    public appliedRule: string;

    /**
     * Construct a proof node by providing the AEG Tree at the current state of the proof
     * @param tree The AEG at the current state of the proof.
     * If not defined, an empty AEG tree will be set constructed.
     * @param rule The inference rule applied to get to this stage of the proof.
     */
    public constructor(tree?: AEGTree, rule?: string) {
        this.appliedRule = rule ?? "";
        this.tree = new AEGTree(tree?.sheet);
    }
}
