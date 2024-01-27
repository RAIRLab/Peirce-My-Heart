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

    public pop(): DrawModeNode {
        const poppedNode: DrawModeNode = this.history[this.history.length - 1];

        this.history.splice(this.history.length - 2, this.history.length - 1);

        return poppedNode;
    }

    public peek(): DrawModeNode {
        return this.history[this.history.length - 1];
    }
}
