/**
 * The class defining the structure of the node of an AEG Tree
 * @author AnushaTiwari
 */
export class AEGNode {

    /**
     * A list of atoms within this node
     */
    private atoms: string[];

    /**
     * A value signifying if this node has a cut or not
     */
    private cut: boolean;

    /**
     * A list of nodes nested within this node
     */
    private nestedNodes: AEGNode[];


    /**
     * The constructor to initialize the node.
     * The list of atoms, nested nodes, and whether this node has a cut can all be provided specific values.
     * If no values are provided, they attributes are initialized with default values.
     * 
     * @param atoms The list of atoms in the node.
     * @param cut Whether this node has a cut.
     * @param nestedNodes The list of nodes nested within this node.
     */
    public constructor(atoms?: string[], cut?: boolean, nestedNodes?: AEGNode[]) {
        //If a parameter is undefined, initialize the corresponding attribute with the default value
        //Else, set it with the given parameter

        if (atoms === undefined) {
            this.atoms = [];
        } else {
            this.atoms = atoms;
        }

        if (cut === undefined) {
            this.cut = false
        } else {
            this.cut = cut;
        }

        if (nestedNodes === undefined) {
            this.nestedNodes = [];
        } else {
            this.nestedNodes = nestedNodes;
        }
    }

    /**
     * Accessor for the list of atoms in this node.
     * @returns The list of atoms in this node.
     */
    public getAtoms(): string[] {
        return this.atoms;
    }

    /**
     * Modifier for the list of atoms in this node.
     * @param atoms The list to be set as the list of atoms of this node.
     */
    public setAtoms(atoms: string[]): void {
        this.atoms = atoms;
    }

    /**
     * Modifier that adds on to the list of atoms in this node.
     * @param atom The atom to be added to the list of atoms of this node.
     */
    public addAtom(atom: string): void {
        this.atoms.push(atom);
    }

    /**
     * Accessor that lets us know whether the node has a cut.
     * @returns True, if the node has a cut. Else, false..
     */
    public isCut(): boolean {
        return this.cut;
    }

    /**
     * Modifier that sets whether the node has a cut.
     * @param cut True, if the node should be set as having a cut. Else, false.
     */
    public setCut(cut: boolean): void {
        this.cut = cut;
    }

    /**
     * Accessor that returns the list of nodes nested within this node.
     * @returns The list of nodes nested within this node.
     */
    public getNestedNodes(): AEGNode[] {
        return this.nestedNodes;
    }

    /**
     * Modifier that sets the list of nodes nested within this node.
     * @param nodes The list to be set as the list of nodes nested within this node.
     */
    public setNestedNodes(nodes: AEGNode[]): void {
        this.nestedNodes = nodes;
    }

    /**
     * Modifier that adds a node to the list of nodes nested within this node.
     * @param node The node to be added to the list of nodes nested within this node.
     */
    public addNestedNode(node: AEGNode): void {
        this.nestedNodes.push(node);
    }

    /**
     * Method that checks whether a given AEGNode is the same as this AEGNode.
     * @param node The AEGNode being compared with this AEGNode
     */
    public equalToNode(node: AEGNode): boolean {
        
        //For 2 AEGNodes to be considered as "equal", all their attributes must be the same.
        //i.e. they must have the same list of atoms, nested nodes and the same cut value.
        //We must check these conditions individually and return false if any of the attributes are not the same.
        //If all the attributes are the same, return true.
        
        //Compare the list of atoms of both the nodes
        //Start by checking if they are of the same length and if every atom in the list is the same 
        if ((this.atoms.length === node.getAtoms().length) && (this.atoms.every((atom, index) => atom === node.getAtoms()[index]))) {
            //if the list of atoms is the same, check if the cut value is the same
            if (this.cut === node.isCut()) {
                //if the cut value is the same, check if the list of nested nodes are the same
                if ((this.nestedNodes.length === node.getAtoms().length) && (this.nestedNodes.every((nested, index) => nested === node.getNestedNodes()[index]))) {
                    return true;
                }
            }
        } 

        return false;
    }

}

