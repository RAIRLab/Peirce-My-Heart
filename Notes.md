
## Preface 
A potential implementation of the AEG Data Structure.
The AEG Tree will be broken up into individual nodes, with each node containing a list of atoms (signiyfing propositions) and a truth value indicating whether the node has a cut.
The node will also have a list of the other nodes nested within this node, to help with building and traversing through the tree structure.

## After meeting 9/1 
### Discussions regarding the data structure design
The AEG Tree structure will be composed of CutNode and AtomNode, two separate classes. This will allow for easier translation between canvas representation and data structure being built in the background. 

Both these will inherit from a generic Node class
The former should contain coordinates for foci and a radius
The latter should contain coordinates (topX, topY, bottomX, bottomY) for a collision box
The boundaries of this collision box will determine what node it becomes a child of in the AEG Tree structure, when dragged and dropped