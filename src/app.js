
var path            = require('path');
var fs              = require('fs');
var WebSocketServer = require("ws").Server;
var http            = require("http");
var express         = require("express");
var app             = express();

var port = process.env.PORT || 8888;

function socket_server() {

    app.use(express.static(__dirname + "/"));

    var server = http.createServer(app);

    server.listen(port);

    console.log("http server listening on %d", port);

    var wss = new WebSocketServer({
        server: server
    });

    console.log("websocket server created");

    wss.on("connection", function(ws) {

        console.log("websocket connection open");

        app.on("text", function(received_data) {

            console.log("Received text format : " + received_data);
        });

        ws.on("message", function(received_data) {

            console.log("Received message : " + received_data);
        });

        // ---

        ws.on("close", function() {
            console.log("websocket connection close");
        });
    });

} //      socket_server

// ---

socket_server();

// ---

console.log("version: " + process.env.npm_package_version);

var serviceUrl;

if (process.env.HOSTING_VENDOR == "heroku") {

    serviceUrl = "http://webgl-3d-animation.herokuapp.com:";

} else {

    serviceUrl = "http://localhost:";
}

console.log("\nPoint your browser at \n\n\t\t", serviceUrl + port + "/", "\n");
