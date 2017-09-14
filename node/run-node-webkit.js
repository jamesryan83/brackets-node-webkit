/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global */


// NOTE : changes in here are only updated when brackets is fully closed
// and opened again.  F5 isn't enough.  Something to do with domainManager
// not clearing out names like the name in registerDomain function


(function () {
    "use strict";

    var fs = require("fs");
    var path = require("path");
    var exec = require('child_process').exec;    
    
    /**
     * @private
     * Handler function to start node-webkit using another process
     * @param {string} nwpath Absolute path to nw.exe.
     * @param {string} basepath Current brackets project path.
     * @return {string} An error message if there is one.
     */
	function startnw(nwpath, basepath, callback) {
        console.log("Running: " + basepath + ", using: " + nwpath);
        
        // some validation to prevent starting node-webkit with invalid inputs
        // otherwise it fails silently and leaves a few nw.exe processes running
        
        // node-webkit projects need a package.json
        var packagePath = path.join(basepath, "package.json");
        if (!fs.existsSync(packagePath)) {
            return callback("package.json missing from currently open Bracekts project");
        }
        
        // node-webkit missing main property in package.json
        var packageJson = fs.readFileSync(packagePath, "utf8");
        if (!packageJson) {
            return callback("Error loading package.json.  File was empty or invalid");
        }        
        
        // parse the package.json file if there was one
        try {
            packageJson = JSON.parse(packageJson);            
        } catch (ex) {
            return callback("Error parsing package.json");
        }
                
        if (!packageJson.main) {
            return callback("Missing 'main' property from package.json");
        }
        
        // node-webkit invalid main value in package.json
        if (!fs.existsSync(path.join(basepath, packageJson.main))) {
            return callback("Invalid 'main' property of package.json: file not found");
        }
        
        // run node-webkit
        exec(nwpath + " " + basepath, function (error, stdout, stderr) {
            if (error) {
                console.log(error)
                return callback(
                    "<p>Error running project<br>" + basepath + "<br>    using<br>" + nwpath + 
                    "<br><br>There may be a problem with your nw.exe path or you may not have " + 
                    "a node-webkit project currently open in Brackets</p>");
            }
            
            return callback();
        });
	}
    

    // Init
    function init(domainManager) {
        if (!domainManager.hasDomain("run-node-webkit")) {
            domainManager.registerDomain("run-node-webkit", {major: 0, minor: 1});
        }

		domainManager.registerCommand("run-node-webkit", "startnw", startnw, true, 
            "Returns a message if started otherwise an error (err, message)", [
                { name: "nwpath", type: "string", description: "Absolute path to nw.exe" },
                { name: "basepath", type: "string", description: "Current brackets open project path" },
                { name: "callback", type: "function", description: "Callback (err, result)" }
            ], [ 
                { name: "message", type: "string", description: "Error message on start failure" }
            ], []);
    }

    
    exports.init = init;
    
}());

