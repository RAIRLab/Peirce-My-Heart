import {AEGTree} from "./AEGTree";
import {ProofNode} from "./ProofNode";

export class ProofList {
    private internalHead: ProofNode = new ProofNode(new AEGTree());

    public ProofList(node: ProofNode) {
        this.internalHead = node;
    }

    public get head(): ProofNode {
        return this.internalHead;
    }

    public set head(node: ProofNode) {
        this.insertAtFirst(node);
    }

    public insertAtFirst(node: ProofNode) {
        //If the head and the node to be inserted in first are both empty sheets, skip the head by
        //setting the next of the node to be inserted as the next of head
        //This is to avoid having 2 consecutive empty sheets
        if (this.internalHead.tree.sheet.isEmptySheet() && node.tree.sheet.isEmptySheet()) {
            node.next = this.internalHead.next;
        } else {
            this.internalHead.previous = node;
            node.next = this.internalHead;
            this.internalHead = node;
        }
    }

    public insertAtEnd(node: ProofNode) {
        const lastNode = this.getLastNode(this.internalHead);
        //If the head and the node to be inserted at end are both empty sheets, skip the node by
        //setting the next of the last node as the next of the node to be inserted
        //This is to avoid having 2 consecutive empty sheets
        if (lastNode.tree.sheet.isEmptySheet() && node.tree.sheet.isEmptySheet()) {
            lastNode.next = node.next;
        } else {
            lastNode.next = node;
            node.previous = lastNode;
        }
    }

    public getLastNode(currentNode: ProofNode): ProofNode {
        //If currentNode.next exists, recurse the function on currentNode.next to keep traversing
        //the list. Otherwise, return currentNode -> if it has no next, it is the last node of list
        if (currentNode.next === null) {
            return currentNode;
        } else {
            return this.getLastNode(currentNode.next);
        }
    }

    public deleteNode(node: ProofNode) {
        if (node.previous === null) {
            //If the node has no previous, it was the head node
            //Set the head at the next of the node to be deleted
            //If there was no next, initialize the head as a new proof node
            this.internalHead = node.next ?? new ProofNode(new AEGTree());
        } else {
            //Set the next of the node before this node to the node after this node
            node.previous.next = node.next;
        }
    }

    /**
     * Convert our proof list into an ordered array
     * @returns An array of AEG Trees, in order of the proof
     */
    public toArray(): AEGTree[] {
        const arr: AEGTree[] = [];
        arr.push(this.head.tree);

        if (this.head.next === null) {
            return arr;
        } else {
            let nextNode: ProofNode | null = this.head.next;
            do {
                arr.push(nextNode.tree);
                nextNode = nextNode.next;
            } while (nextNode !== null);
            return arr;
        }
    }

    /**
     * Builds a proof list from a given array of AEG Trees
     * @param arr The array of AEG Trees in order, which will be used to construct our proof list
     */
    public rebuildFromArray(arr: AEGTree[] | null) {
        if (arr !== null && arr.length !== 0) {
            //Reset the proof list so that new list can be build
            this.internalHead.tree = new AEGTree();
            this.head.next = null;

            let node: ProofNode;
            arr.forEach(tree => {
                node = new ProofNode(tree);
                this.insertAtEnd(node);
            });
        }
    }
}
