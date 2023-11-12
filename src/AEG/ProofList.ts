//import {AEGTree} from "./AEGTree";
import {ProofNode} from "./ProofNode";

export class ProofList {
    private internalHead: ProofNode | null = null;

    public get head(): ProofNode | null {
        return this.internalHead;
    }

    public set head(node: ProofNode) {
        this.insertAtFirst(node);
    }

    public ProofList(node?: ProofNode) {
        this.internalHead = node ?? null;
    }

    public insertAtFirst(node: ProofNode) {
        if (this.internalHead === null) {
            this.internalHead = node;
        } else {
            this.internalHead.previous = node;
            node.next = this.internalHead;
            this.internalHead = node;
        }
    }

    public insertAtEnd(node: ProofNode) {
        if (this.internalHead === null) {
            this.internalHead = node;
        } else {
            const lastNode = this.getLastNode(this.internalHead);
            lastNode.next = node;
            node.previous = lastNode;
        }
    }

    public getLastNode(currentNode: ProofNode): ProofNode {
        //If currentNode.next exists, recurse the function on currentNode.next to keep traversing
        //the list. Otherwise, return currentNode -> if it has no next, it is the last node of list
        return currentNode.next ? this.getLastNode(currentNode.next) : currentNode;
    }

    public deleteNode(node: ProofNode) {
        if (node.previous === null) {
            //If the node has no previous, it was the head node
            //Set the head at the next of the node to be deleted
            this.internalHead = node.next;
        } else {
            //Set the next of the node before this node to the node after this node
            node.previous.next = node.next;
        }
    }

    /* public toArray(): AEGTree[] {
        const arr: AEGTree = []; //ERROR: Type 'never[]' is missing the following properties from type 'AEGTree': internalSheet, sheet, verify, verifyAEG, and 7 more
        if (this.head === null) {
            return arr;
        }

    } */
}
