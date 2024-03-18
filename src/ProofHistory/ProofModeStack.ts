/**
 * @file Contains the ProofModeStack class, which models an undo/redo stack in Proof Mode.
 *
 * @author Ryan R
 */

import {ProofModeNode} from "./ProofModeNode";

export class ProofModeStack {
    public history: ProofModeNode[];

    /**
     * Initializes the stack.
     */
    public constructor() {
        this.history = [];
    }

    /**
     * Adds the incoming ProofModeNode to the stack.
     *
     * @param incomingMove Incoming ProofModeNode.
     */
    public push(incomingMove: ProofModeNode): void {
        this.history.push(incomingMove);
    }

    /**
     * Removes and returns the ProofModeNode at the top of this stack, if one exists.
     *
     * @returns null if the stack is empty, or, if the stack is not empty, the ProofModeNode at its top.
     */
    public pop(): ProofModeNode | null {
        if (this.history.length === 0) {
            return null;
        }

        const poppedNode: ProofModeNode = this.history[this.history.length - 1];

        this.history.splice(this.history.length - 1, 1);
        return poppedNode;
    }

    /**
     * Returns the ProofModeNode at the top of the stack.
     *
     * @returns ProofModeNode at the top of the stack, or, if the stack is empty, an empty ProofModeNode.
     */
    public peek(): ProofModeNode {
        return this.history.length !== 0
            ? this.history[this.history.length - 1]
            : new ProofModeNode();
    }

    /**
     * Removes all entries in the stack.
     */
    public clear(): void {
        this.history = [];
    }
}
