# object
Custom code blocks for dealing with JSON structures.

### `Pick(obj, paths)`
Clones an object, but keeps only the properties at the provided paths.
Ignores any paths that are not found.

### `Remap(obj, oldPaths, newPaths)`
Gets the properties specified at a set of paths, and remaps them to a new set of paths.
Ignores any paths that are not found.
