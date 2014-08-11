
var path = require('path');
var fs = require('fs');


var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var app = express();
var port = process.env.PORT || 8888;

function socket_server() {

app.use(express.static(__dirname + "/"));
// app.use(express.static(working_dir));

var server = http.createServer(app);

server.listen(port);

console.log("http server listening on %d", port)

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
        console.log("websocket connection close")
        // clearInterval(id)
        // clearInterval(wrap_stats.stats_id);
        // clearTimeout(ID_timeout);
    });
});


}; //      socket_server

// ---

// ---

socket_server();

// ---

// httpd.createServer(requestHandler).listen(8888); // OK pre appfog
// https://stackoverflow.com/questions/16573668/best-practices-when-running-node-js-with-port-80-ubuntu-linode


console.log("process.env.HOSTING_VENDOR ", process.env.HOSTING_VENDOR);
// console.log("process.env.NODE_ENV ", process.env.NODE_ENV);
// console.log("process.env.SUBDOMAIN ", process.env.SUBDOMAIN);
// console.log("process.env.PORT ", process.env.PORT);

console.log("version: 0.0.52-5   ");

var serviceUrl;
// var servicePort;

if (process.env.HOSTING_VENDOR == "heroku") {

    serviceUrl = "http://webgl-3d-animation.herokuapp.com:";
    // http://gentle-cliffs-8200.herokuapp.com

    // servicePort = process.env.PORT || 3000;
    // servicePort = 80;

} else {

    serviceUrl = "http://localhost:";

    // servicePort = 8888;
};

console.log("\nPoint your browser at \n\n\t\t", serviceUrl + port, "\n");

