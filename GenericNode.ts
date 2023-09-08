export class GenericNode {

    /**
     * Member which signifies what type of node this is.
     */
    private nodeType : GenericNode; //null for sheet

    /**
     * Member which contains the list of children nodes nested within this node.
     */
    private children : GenericNode[]; //for atoms, this becomes null because atom is always a leaf   

    /**
     * Member that signifies the cut level of this node.
     */
    //private cutLevel : number;

    /**
     * The constructor to initialize a new Generic Node.
     * @param type The type of the node.
     * @param childList The list of children nodes nested within this node.
     */
    constructor(type? : GenericNode, childList? : GenericNode[]) {
        this.nodeType = type ?? new GenericNode;
        this.children = childList ?? [];
    }

    /**
     * Accessor to get the type of the node.
     * @returns The type of the node.
     */
    public getNodeType() : GenericNode {
        return this.nodeType;
    }

    /**
     * Modifier to set the type of the node.
     * @param type The type to be set as the type of the node.
     */
    public setNodeTypes(type : GenericNode) {
        this.nodeType = type;
    }

    /**
     * Accessor to return the children of this node .
     * @returns The children of this node 
     */
    public getChildren() : GenericNode[] {
        return this.children;
    }

    /**
     * Modifier to set the children of the node
     * @param childList The list to be set as the children of the node.
     */
    public setChildren(childList : GenericNode[]) {
        this.children = childList;
    }

    /**
     * Returns a string represenation of a generic node
     * @returns The string representaion of this node
     */
    toString(): string {
        let str: string = this.nodeType.toString();

        if(this.children.length > 0) {
            str += ", \n" + "With nested nodes: " + this.children.toString();
        }
        return(str);
    }

}