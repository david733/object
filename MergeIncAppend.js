'use strict';

var _ = require('lodash');
var jsonpointer = require('json-pointer');

/**
 * Code block template.
 *
 */
function run(master, slave, paths) {
	
	var foundPaths = [];
	
	for (let path of paths) {
		let masterSearchResult = get(master, path);
		let slaveSearchResult = get(slave, path);
		if (masterSearchResult.Found && slaveSearchResult.Found) {
			foundPaths.push(path);
			let masterDocs = masterSearchResult.Out;
			let masterCodes = _.pluck(masterDocs, "Code");
														// let slaveCodes = _.pluck(slaveSearchResult.Out, "Code");
														// console.log(masterCodes.join(' '));
														// console.log(slaveCodes.join(' '));
			for (let doc of slaveSearchResult.Out) {
				let slaveCode = doc.Code;
				
				let collision = _.some(masterCodes, masterCode => equalCode(masterCode, slaveCode));
				while (collision) {
					slaveCode = incrementCode(slaveCode, "0.001");
					collision = _.some(masterCodes, masterCode => equalCode(masterCode, slaveCode));
				}
				
				doc.Code = slaveCode;
				
				let dcIndex = _.findIndex(doc.Attributes, {Name: "DocumentCode"});
				doc.Attributes[dcIndex].Value = slaveCode;
				
				masterDocs.push(doc);
				masterCodes.push(slaveCode);
			}
			set(master, path, _.sortBy(masterDocs, doc => doc.Code));
														// console.log(_.pluck(masterDocs, "Code").join(' '));
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

function equalCode(A, B) {
	if (A === B) return true;
	var aSplit = A.split('.'), bSplit = B.split('.');
	if (aSplit.length !== bSplit.length) return false;
	if (parseInt(aSplit[0], 10) !== parseInt(bSplit[0], 10)) return false;
	for (let i=1; i<aSplit.length; i++) {
		let aStr = aSplit[i], bStr = bSplit[i];
		let lengthDiff = aStr.length - bStr.length;
		if (lengthDiff > 0) bStr = bStr + '0'.repeat(lengthDiff);
		else if (lengthDiff < 0) aStr = aStr + '0'.repeat(-lengthDiff);
		if (parseInt(aStr, 10) !== parseInt(bStr, 10)) return false;
	}
	return true;
}

function incrementCode(code, inc) {
	var codeSplit = code.split('.'), incSplit = inc.split('.');
	if (codeSplit.length !== incSplit.length) return false;
	codeSplit[0] = (parseInt(codeSplit[0], 10) + parseInt(incSplit[0], 10)).toString(10);
	for (let i=1; i<codeSplit.length; i++) {
		let codeStr = codeSplit[i], incStr = incSplit[i];
		let lengthDiff = codeStr.length - incStr.length;
		
		if (lengthDiff > 0)	incStr = incStr + '0'.repeat(lengthDiff);
		else if (lengthDiff < 0) codeStr = codeStr + '0'.repeat(-lengthDiff);
		
		let maxLength = codeStr.length;
		let val = (parseInt(codeStr, 10) + parseInt(incStr, 10)).toString(10);
		codeSplit[i] = '0'.repeat(maxLength - val.length) + val;
	}
	return codeSplit.join('.');
}

function padEnd(str, len, padding) {
	var space = len - str.length;
	if (space <= 0) return str;
	else
		return str + padding.repeat(space);
}

module.exports = {
    run: run
};