'use strict';

var jsonpointer = require('json-pointer');

/**
 * Code block template.
 *
 */
function run(obj, oldPaths, newPaths) {
	var numPaths = oldPaths.length < newPaths.length ? oldPaths.length : newPaths.length;
	var searchResult;
	
	for (let i=0; i<numPaths; i++) {
		searchResult = get(obj, oldPaths[i]);
		if (searchResult.Found) {
			set(obj, newPaths[i], searchResult.Out);
			remove(obj, oldPaths[i]);
		}
		// else
		// 	set(newObject, newPaths[i], null);
	}
	
	return { Out: obj };
}

function get(x, path) {
    path = addRootSlashIfNecessary(path);
    var value;
    var found = true;
    try {
        value = jsonpointer.get(x, path);
    } catch (e) {
        found = false;
    }
    return {
        Out: value,
        Found: found,
    };
}

function set(x, path, value) {
    path = addRootSlashIfNecessary(path);
    jsonpointer.set(x, path, value);
    return x;
}


function remove(x, path) {
    path = addRootSlashIfNecessary(path);
    jsonpointer.remove(x, path);
    return x;
}

function addRootSlashIfNecessary(path) {
    if (path.length === 0) {
        throw new Error("Invalid empty path");
    }
    if (path[0] === "/") {
        return path;
    }
    return "/" + path;
}

module.exports = {
    run: run
};
