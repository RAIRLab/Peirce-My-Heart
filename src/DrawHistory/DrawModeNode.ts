/**
 * @file Contains the DrawModeNode class, which defines a step taken in Draw Mode.
 *
 * @author Ryan R
 */

import {AEGTree} from "../AEG/AEGTree";
import {DrawModeMove} from "./DrawModeMove";

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
