export class GenericNode {

    /**
     * Member which signifies what type of node this is.
     */
    nodeType : GenericNode; 

    /**
     * The constructor to initialize a new Generic Node.
     * @param type The type of the node.
     */
    public constructor(type? : GenericNode) {
        this.nodeType = type ?? new GenericNode;
    }

}