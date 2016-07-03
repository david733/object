'use strict';

var jsonpointer = require('json-pointer');

/**
 * Code block template.
 *
 */
function run(obj, paths) {
	var newObject = {};
	var searchResult;
	
	for (let path of paths) {
		searchResult = get(obj, path);
		if (searchResult.Found)
			set(newObject, path, searchResult.Out);
	}
	
	return { Out: newObject };
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
