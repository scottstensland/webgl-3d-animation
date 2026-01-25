
const path = require('path');
const fs = require('fs');
const { Server: WebSocketServer } = require("ws");
const http = require("http");
const express = require("express");
const app = express();

const port = process.env.PORT || 8888;

function socket_server() {
    app.use(express.static(__dirname + "/"));

    const server = http.createServer(app);

    server.listen(port);

    console.log(`http server listening on ${port}`);

    const wss = new WebSocketServer({ server });

    console.log("websocket server created");

    wss.on("connection", (ws) => {
        console.log("websocket connection open");

        // Note: This app.on("text") seems misplaced; it might be intended for ws or another event.
        app.on("text", (received_data) => {
            console.log(`Received text format: ${received_data}`);
        });

        ws.on("message", (received_data) => {
            console.log(`Received message: ${received_data}`);
        });

        ws.on("close", () => {
            console.log("websocket connection close");
        });
    });
} // socket_server

socket_server();

console.log(`version: ${process.env.npm_package_version}`);

let serviceUrl;

if (process.env.HOSTING_VENDOR === "heroku") {
    serviceUrl = "http://webgl-3d-animation.herokuapp.com:";
} else {
    serviceUrl = "http://localhost:";
}

console.log(`\nPoint your browser at \n\n\t\t${serviceUrl}${port}/\n`);
