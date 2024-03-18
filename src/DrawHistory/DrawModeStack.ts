/**
 * @file Contains the DrawModeStack class, which models an undo/redo stack in Draw Mode.
 *
 * @author Ryan R
 */

import {DrawModeNode} from "./DrawModeNode";

export class DrawModeStack {
    public history: DrawModeNode[];

    /**
     * Initializes the stack.
     */
    public constructor() {
        this.history = [];
    }

    /**
     * Adds the incoming DrawModeNode to the stack.
     *
     * @param incomingMove Incoming DrawModeNode.
     */
    public push(incomingMove: DrawModeNode): void {
        this.history.push(incomingMove);
    }

    /**
     * Removes and returns the DrawModeNode at the top of this stack, if one exists.
     *
     * @returns null if the stack is empty, or,
     *      if the stack is not empty, the DrawModeNode at its top.
     */
    public pop(): DrawModeNode | null {
        if (this.history.length === 0) {
            return null;
        }

        const poppedNode: DrawModeNode = this.history[this.history.length - 1];

        this.history.splice(this.history.length - 1, 1);
        return poppedNode;
    }

    /**
     * Returns the DrawModeNode at the top of the stack.
     *
     * @returns DrawModeNode at the top of the stack, or,
     *      if the stack is empty, an empty DrawModeNode.
     */
    public peek(): DrawModeNode {
        return this.history.length !== 0
            ? this.history[this.history.length - 1]
            : new DrawModeNode();
    }

    /**
     * Removes all entries in the stack.
     */
    public clear(): void {
        this.history = [];
    }
}
