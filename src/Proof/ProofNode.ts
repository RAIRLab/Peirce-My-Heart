import {AEGTree} from "../AEG/AEGTree";
import {TreeContext} from "../TreeContext";

/**
 * Defines a single step in a proof.
 * @author Anusha Tiwari
 */
export class ProofNode {
    /**
     * The AEGTree at this proof step.
     */
    public tree: AEGTree;

    /**
     * Inference rule applied in this ProofNode.
     */
    public appliedRule: string;

    /**
     * Index of this ProofNode in treeContext.ts' proof array.
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
    public constructor(tree?: AEGTree, rule?: string) {
        this.appliedRule = rule ?? "";
        this.tree = new AEGTree(tree?.sheet);
        this.index = TreeContext.proof.length;
    }
}
