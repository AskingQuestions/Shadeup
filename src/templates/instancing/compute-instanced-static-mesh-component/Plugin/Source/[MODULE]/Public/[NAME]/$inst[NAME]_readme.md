# ${NAME} usage

## World

1. Open the "Add Actors" panel and search for "Example Indirect Instancing"
2. Drag and drop that actor into your world
3. Apply a material and mesh
4. Select the "ExampleIndirectInstancingComponent" under the details hierarchy and click the "Add Instances" button to add more instances
5. Use your camera and fly into the meshes, they should be pushed away
6. Enjoy, and get digging into the code

## Notes

-   Shadows are broken until UE 5.1. See: https://github.com/EpicGames/UnrealEngine/blob/d11782b9046e9d0b130309591e4efc57f4b8b037/Engine/Plugins/Experimental/VirtualHeightfieldMesh/Source/VirtualHeightfieldMesh/Private/VirtualHeightfieldMeshSceneProxy.cpp#L538
-   Vertex velocities are not set up so you'll see some ghosting when using any type of temporal anti-aliasing (this is on my todo list to add)

Feel free to delete this file
