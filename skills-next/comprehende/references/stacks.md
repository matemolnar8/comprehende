# Stacked requests

A request is in a stack when the base branch the forge reports for it is the head branch of another request. That other request is the lower layer. The review covers this layer only:

- Base is the lower layer's head branch. When the change is already on the default branch, base is the recorded base SHA.
- Fetch the lower layer's request body the same way as this request's body: one more fetch in the step-2 shell call, or one more in the MCP parallel block.
- The lower layer is a `pr` source. Cite it where a group uses its code.
