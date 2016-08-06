'use strict';

var jsonpointer = require('json-pointer');

/**
 * Code block template.
 *
 */
function run(master, slave, paths) {
	var foundPaths = [];
	// var searchResult;
	
	for (let path of paths) {
		let masterSearchResult = get(master, path);
		let slaveSearchResult = get(slave, path);
		if (masterSearchResult.Found && slaveSearchResult.Found) {
			foundPaths.push(path);
			set(master, path, masterSearchResult.Out.concat(slaveSearchResult.Out));
		}
	}
	
	return { Master: master, Found: foundPaths };
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