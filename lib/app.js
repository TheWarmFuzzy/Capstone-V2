//-----------------------------------------------------------------------------
//-Initialization--------------------------------------------------------------
//-----------------------------------------------------------------------------

//Load configs
var config = {};
config.app = require("../config/app.json");
config.directories = require("../config/directories.json");

//Load libraries
var express = require('express');
//var session = require('express-session');

//-----------------------------------------------------------------------------
//-HTTP Application------------------------------------------------------------
//-----------------------------------------------------------------------------

//----------------
//-Initialization-
//----------------

var app_http = express();

//----------------
//-Routing--------
//----------------

//Redirect user to https application
app_http.use(function(req,res,next){
	
	//Log redirection
	console.info("User redirected to HTTPS server");
	
	//Redirect
	res.redirect(308, "https://localhost:8443");
	
});

//-----------------------------------------------------------------------------
//-HTTPS Application-----------------------------------------------------------
//-----------------------------------------------------------------------------

//----------------
//-Initialization-
//----------------

var app_https = express();


//----------------
//-Reusable-------
//----------------



//----------------
//-Routing--------
//----------------
app_https.use(authentication);
app_https.use(authorization);

app_https.use(function(req,res,next){
	res.send("Hello");
});

//-----------------------------------------------------------------------------
//-Middleware------------------------------------------------------------------
//-----------------------------------------------------------------------------

//Confirms the user's identity
function authentication(req, res, next){
	req.authentication = {};
	req.authentication.name = "N/A";
	req.authentication.level = 1;
	
	console.log();
	console.info("Authentication");
	console.log("\t","User:",req.authentication.name);
	console.log("\t","Permissions:", req.authentication.level);
	next();
}

//Confirms user's permissions
function authorization(req, res, next){
	//Log information
	console.info("Authorization");
	
	req.authorization = {};
	req.authorization.page = authorize_directory(req, res);
	if(!req.authorization.page){
		return false;
	}
	
	next();
}

//Checks if a user is allowed to navigate to a page with the given method
//Returns name of page to render if allowed
function authorize_directory(req,res){
	
	var url_directories = req.path.split("/"),
		directory_level = url_directories[url_directories.length - 1] == "" ? url_directories.length - 1 : url_directories.length,
		directory = config.directories,
		page;
	//Gets the current page from the config
	//Supports page nesting
	for(var i = 0; i < directory_level; i++){
		
		//Load the next page
		directory = directory[url_directories[i]];
		
		//Cancels if the page doesn't exist or nesting goes too far
		if(!directory || config.app.max_directory_nest == i){
			console.warn("\t","Page: '", req.path,"' - Denied");
			res.status(403).send("Forbidden");
			return false;
		}
	}

	//Loop down finding lowest available permission
	for(var i = req.authentication.level; i > 0; i--){
		if(directory[i]){
			page = directory[i];
			break;
		}
	}
	
	//Check if permissions were not found
	if(!page){
		console.warn("\t","Page: '", req.path,"' - Denied");
		res.status(403).send("Forbidden");
		return false;
		
	}
	console.log("\t","Page: '", req.path, "' - Allowed");
	
	//Check if the method used is allowed
	if(page.allowed_methods.indexOf(req.method) < 0){
		console.warn("\t","Method:", req.method, "- Denied");
		res.status(405).send("Method not allowed.");
		return false;
	}
	console.log("\t","Method:", req.method, "- Allowed");
	
	return page;
}

//-----------------------------------------------------------------------------
//-Exports---------------------------------------------------------------------
//-----------------------------------------------------------------------------

module.exports = {"http":app_http,"https":app_https};