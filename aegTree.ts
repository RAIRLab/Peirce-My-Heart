import { AEGNode } from "./aegNode";

/**
 * The class defining the structure of an AEG Tree
 * @author AnushaTiwari
 */
export class AEGTree {

    /**
     * Every AEG Tree must have a sheet of assertion on which the AEG is drawn
     * i.e. The sheet of assertion is the head node of the Tree
     */
    private sheet: AEGNode;
    
    /**
     * The constructor to initialize the AEG Tree
     * 
     * @param head The head node, or sheet, of the AEG Tree
     */
    public constructor(head? : AEGNode) {
        if(head) {
            this.sheet = head;
        } else {
            this.sheet = new AEGNode();
        }
    }

    /**
     * Method which adds a node onto the sheet of assertion
     * @param node The node to be added onto the sheet of assertion
     */
    public addToSheet(node : AEGNode) : void {
        this.sheet.addNestedNode(node);
    }

    /**
     * Method that adds a node to a specific node in the AEGTree
     * @param chosenNode The node to which the new node must be added
     * @param newNode The new node to be added
     * @returns True, if the node was added successfully. Else, false
     */
    public addToNode(chosenNode : AEGNode, newNode : AEGNode) : boolean {
        if(this.sheet.equalToNode(chosenNode)) {
            this.addToSheet(newNode);
            return true;
        } else {
            //Traverse through the tree to find the matching node
            //If the node is not found, return false to show unsucessful operation. Else, return true
            let treeNode = this.checkNested(this.sheet, chosenNode);
            if(treeNode === undefined) {
                return false;
            } else {
                treeNode.addNestedNode(newNode);
                return true;
            }
        }
    }

    /**
     * Checks whether a given node matches any nodes within the subtree specified by a node of the tree.
     * @param treeNode The node specifying the subtree 
     * @param matchNode The node to be checked as matching for
     */
    public checkNested(treeNode : AEGNode, matchNode : AEGNode) : AEGNode | undefined {
        //Base condition
        //Check whether the current node is equal to the matchNode
        if(treeNode.equalToNode(matchNode)) {
            return treeNode;

        } else {
            let returnedNode: undefined | AEGNode;
            returnedNode = undefined;

            //loop through all the nested nodes of the node
            for(let i = 0; i < treeNode.getNestedNodes().length; i++) {
                returnedNode = this.checkNested(treeNode.getNestedNodes()[i], matchNode);

                //function returns undefined if there was no match found within the subtree
                //therefore, if all the nested nodes have been checked and no match has been found, return undefined
                if((returnedNode === undefined) && (i === (treeNode.getNestedNodes().length-1))) {
                    return undefined;
                }
            }
            return returnedNode;
        }
    } 

}