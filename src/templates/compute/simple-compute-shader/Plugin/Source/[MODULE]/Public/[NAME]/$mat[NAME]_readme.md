# ${NAME} usage

## Blueprint

1. Create new/open a material and check off the Use with Virtual Heightfield Mesh _(this is to prevent the compute shader from being compiled against every material in the engine)_
2. Create a new render target with the size set to a multiple of 32
3. Right-click in any blueprint editor and add the node: "Execute Material RTCompute Shader"
4. Pass in a context actor (run "Get Actor By Class" and set the class to "Actor"), material, and render target
5. Enjoy, and get digging into the code

Feel free to delete this file
