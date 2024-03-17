/**
 * @file Contains the DrawModeStack class, which models an undo/redo stack in Draw Mode.
 *
 * @author Ryan R
 */

import {DrawModeNode} from "./DrawModeNode";

export class DrawModeStack {
    public history: DrawModeNode[];

    public constructor() {
        this.history = [];
    }

    public push(incomingMove: DrawModeNode): void {
        this.history.push(incomingMove);
    }

    public pop(): DrawModeNode | null {
        if (this.history.length === 0) {
            return null;
        }

        const poppedNode: DrawModeNode = this.history[this.history.length - 1];

        this.history.splice(this.history.length - 1, 1);
        return poppedNode;
    }

    public peek(): DrawModeNode {
        return this.history.length !== 0
            ? this.history[this.history.length - 1]
            : new DrawModeNode();
    }
}
