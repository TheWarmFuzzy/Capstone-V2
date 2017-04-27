//-----------------------------------------------------------------------------
//-Initialization--------------------------------------------------------------
//-----------------------------------------------------------------------------

//Load configs
var config = {};
config.console_extended = require("./config/console_extended.json")

//Load libraries
var apps = require("./lib/app.js");
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require("path");

console = require("./lib/console_extended.js")(console,config.console_extended);

//-----------------------------------------------------------------------------
//-Load TLS Credentials--------------------------------------------------------
//-----------------------------------------------------------------------------

//Load files required for TLS
var cert = fs.readFileSync(path.resolve("./certs/cert.pem"), "utf8");
var key = fs.readFileSync(path.resolve("./certs/key.pem"), "utf8");
var pass = fs.readFileSync(path.resolve("./certs/passphrase.key"), "utf8");

//Store in object for https object
var credentials = {"key":key,"cert":cert, "passphrase": pass};

//-----------------------------------------------------------------------------
//-Servers---------------------------------------------------------------------
//-----------------------------------------------------------------------------

//Ports
const PORT_HTTP = 8080;
const PORT_HTTPS = 8443;

//Create servers with loaded application
var server_http = http.createServer(apps.http);
var server_https = https.createServer(credentials, apps.https);

//Start HTTP server
server_http.listen(PORT_HTTP, function(){
	console.info("HTTP server loaded and running:", server_http.address().address + PORT_HTTP);
});

//Start HTTPS server
server_https.listen(PORT_HTTPS, function(){
	console.info("HTTPS server loaded and running:", server_https.address().address + PORT_HTTPS);
});
