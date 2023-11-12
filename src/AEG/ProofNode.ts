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

    /**
     * The AEG Tree representing the previous state of the proof
     */
    public next: ProofNode | null = null;

    /**
     * The AEG Tree representing the next state of the proof
     */
    public previous: ProofNode | null = null;

    /**
     * Construct a proof node by providing the AEG Tree at the current state of the proof
     * @param tree The AEG at the current state of the proof.
     * If not defined, an empty AEG tree will be set constructed.
     * @param next (OPTIONAL) The AEG at the next state of the proof
     * @param prev (OPTIONAL) The AEG at the previous state of the proof
     */
    public constructor(tree?: AEGTree, next?: ProofNode, prev?: ProofNode) {
        this.tree = tree ?? new AEGTree();
        this.next = next ?? null;
        this.previous = prev ?? null;
    }

    // /**
    //  * Accessor that returns the AEG at the current state of the proof
    //  */
    // public get tree(): AEGTree | null {
    //     return this.internalTree;
    // }

    // /**
    //  * Modifier to set the AEG at the current state of the proof
    //  */
    // public set tree(tree: AEGTree | null) {
    //     this.internalTree = tree;
    // }

    // /**
    //  * Accessor that returns the AEG at the next state of the proof
    //  */
    // public get nextTree(): AEGTree | null {
    //     return this.internalNextTree;
    // }

    // /**
    //  * Modifier to set the AEG at the current state of the proof
    //  */
    // public set nextTree(tree: AEGTree | null) {
    //     this.internalNextTree = tree;
    // }

    // /**
    //  * Accessor that returns the AEG at the previous state of the proof
    //  */
    // public get previousTree(): AEGTree | null {
    //     return this.internalPreviousTree;
    // }

    // /**
    //  * Modifier to set the AEG at the current state of the proof
    //  */
    // public set previousTree(tree: AEGTree | null) {
    //     this.internalPreviousTree = tree;
    // }
}
