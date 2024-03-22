/**
 * @file Contains the DrawModeNode class, which defines a step taken in Draw Mode.
 * Also contains the DrawModeMove enum.
 *
 * @author Ryan R
 */

import {AEGTree} from "../AEG/AEGTree";

export enum DrawModeMove {
    CLEAR,
    DRAW_ATOM,
    DRAW_CUT,
    MOVE_SINGLE,
    MOVE_MULTI,
    COPY_SINGLE,
    COPY_MULTI,
    DELETE_SINGLE,
    DELETE_MULTI,
    RESIZE,
    COPY_GRAPH,
}

export class DrawModeNode {
    public tree: AEGTree;
    public appliedMove: DrawModeMove;

    /**
     * Sets tree to the incoming AEGTree and appliedMove to the incoming DrawModeMove.
     *
     * @param tree Incoming AEGTree. Defaults to a default AEGTree construction.
     * @param appliedMove Incoming DrawModeMove. Defaults to CLEAR.
     */
    public constructor(tree?: AEGTree, appliedMove?: DrawModeMove) {
        this.tree = new AEGTree(tree?.sheet) ?? new AEGTree();
        this.appliedMove = appliedMove ?? DrawModeMove.CLEAR;
    }
}
