/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */


// using this project as a guide...
// https://github.com/brackets-beautify/brackets-beautify/blob/master/main.js

// some other helpful links
// Brackets API: http://brackets.io/docs/current/index.html
// Brackets-node: https://github.com/adobe/brackets/wiki/Brackets-Node-Process:-Overview-for-Developers


// Run node webkit
define(function (require, exports, module) {
    "use strict";

    // Load brackets modules
    var Dialogs = brackets.getModule('widgets/Dialogs');
    var NodeDomain = brackets.getModule("utils/NodeDomain");    
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var Mustache = brackets.getModule('thirdparty/mustache/mustache');
    var CommandManager = brackets.getModule("command/CommandManager");
    var ProjectManager = brackets.getModule("project/ProjectManager");    
	var DefaultDialogs = brackets.getModule('widgets/DefaultDialogs');
    
    
    // Load the run-node-webkit node module
    var runNodeWebkit = new NodeDomain(
        "run-node-webkit", ExtensionUtils.getModulePath(module, "node/run-node-webkit"));
    

    // Add a menu item in the File menu
	var Menus = brackets.getModule("command/Menus");
	var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
	
    
    // Load preferences for saving node-webkit path into
	var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    var prefs = PreferencesManager.getExtensionPrefs("brackets-node-webkit");		
	
    
    // Load custom dialog template
    var DialogContentTemplate = require("text!dialog.html");
    
	
    // Runs node-webkit
	function runNW () {
		var nwPath = prefs.get("nwpath");
        
		if (nwPath) {        
            // start node-webkit using currently open project path
            runNodeWebkit.exec("startnw", nwPath, ProjectManager.getProjectRoot()._path)
                .fail(function (err) {
                    // error loading project with node-webkit
                    var dialog = Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, "Node-Webkit Error", err);                    
                });
            
		} else {			
			var dialog = Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, "Node-Webkit Error", 
				"nw.exe path is missing");
            
            dialog.getPromise().done(function () {
                showChangeNwExeDialog();
            });
		}
	}

    
    // Show the dialog to change the nw.exe path 
    function showChangeNwExeDialog () {
        var dialog = Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_INFO, "Change Node-Webkit nw.exe location", 
            Mustache.render(DialogContentTemplate, { currentPath: prefs.get("nwpath") }));
        
        dialog.getPromise().done(function () {
            var nwPath = dialog.getElement().find("input").prop("value");            
            
            if (nwPath) {
                if (nwPath.indexOf(".exe") === -1) {
                    alert("path must end with .exe");
                    return false;
                }
                
                prefs.set("nwpath", nwPath);                
            } else {
                alert("path can't be empty");
                return false;
            }
        });
    }
    
			
    // Run nw.js menu command
	var COMMAND_ID_1 = "run-node-webkit.js";
	CommandManager.register("Run Node-Webkit Project", COMMAND_ID_1, function() {
		runNW();
    });	
	menu.addMenuItem(COMMAND_ID_1, "Ctrl-Alt-W");
	
	
	// Set nw.js location menu command
	var COMMAND_ID_2 = "setnw";
    CommandManager.register("Set Node-Webkit exe Location", COMMAND_ID_2, function() {
        showChangeNwExeDialog();
    });    
	menu.addMenuItem(COMMAND_ID_2);
	
	
	
	// load icon for toolbar
	ExtensionUtils.loadStyleSheet(module, "styles.css");
	
	// Add Toolbar Button	
    $(document.createElement("a"))
        .attr("id", "brackets-node-webkit-icon")
        .attr("href", "#")
        .attr("title", "Run Node-Webkit")
        .on("click", function () {
            runNW();
        })
        .appendTo($("#main-toolbar .buttons"));
	
    
    
    
});
