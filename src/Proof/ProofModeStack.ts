/**
 * @file Contains the ProofModeStack class, which models an undo/redo stack in Proof Mode.
 *
 * @author Ryan R
 */

import {ProofNode} from "./ProofNode";

export class ProofModeStack {
    public history: ProofNode[];

    public constructor() {
        this.history = [];
    }

    public push(incomingMove: ProofNode): void {
        this.history.push(incomingMove);
    }

    public pop(): ProofNode | null {
        if (this.history.length === 0) {
            return null;
        }

        const poppedNode: ProofNode = this.history[this.history.length - 1];

        this.history.splice(this.history.length - 1, 1);
        return poppedNode;
    }

    public clear(): void {
        this.history = [];
    }

    public peek(): ProofNode {
        return this.history.length !== 0 ? this.history[this.history.length - 1] : new ProofNode();
    }
}
