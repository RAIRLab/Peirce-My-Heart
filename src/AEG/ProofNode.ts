import {AEGTree} from "./AEGTree";

/**
 * The structure representing a single node of the proof
 * @author Anusha Tiwari
 */
export class ProofList {
    /**
     * The AEG Tree representing the current state of the proof
     */
    private internalTree: AEGTree | null;

    /**
     * The AEG Tree representing the previous state of the proof
     */
    private internalNextTree: AEGTree | null;

    /**
     * The AEG Tree representing the next state of the proof
     */
    private internalPreviousTree: AEGTree | null;

    /**
     * Construct a proof node by providing the AEG Tree at the current state of the proof
     * @param tree The AEG at the current state of the proof
     * @param nextTree (OPTIONAL) The AEG at the next state of the proof
     * @param prevTree (OPTIONAL) The AEG at the previous state of the proof
     */
    public constructor(tree: AEGTree, rule?: string, nextTree?: AEGTree, prevTree?: AEGTree) {
        this.internalTree = tree ?? null;
        this.internalNextTree = nextTree ?? null;
        this.internalPreviousTree = prevTree ?? null;
    }

    /**
     * Accessor that returns the AEG at the current state of the proof
     */
    public get tree(): AEGTree | null {
        return this.internalTree;
    }

    /**
     * Modifier to set the AEG at the current state of the proof
     */
    public set tree(tree: AEGTree | null) {
        this.internalTree = tree;
    }

    /**
     * Accessor that returns the AEG at the next state of the proof
     */
    public get nextTree(): AEGTree | null {
        return this.internalNextTree;
    }

    /**
     * Modifier to set the AEG at the current state of the proof
     */
    public set nextTree(tree: AEGTree | null) {
        this.internalNextTree = tree;
    }

    /**
     * Accessor that returns the AEG at the previous state of the proof
     */
    public get previousTree(): AEGTree | null {
        return this.internalPreviousTree;
    }

    /**
     * Modifier to set the AEG at the current state of the proof
     */
    public set previousTree(tree: AEGTree | null) {
        this.internalPreviousTree = tree;
    }
}
