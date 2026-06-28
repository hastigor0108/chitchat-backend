const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(
express.static(
path.join(__dirname, "../frontend")
)
);

io.on("connection", (socket) => {

console.log("user connected");

socket.on("send-message", (data) => {
io.emit("receive-message", data);
});

socket.on("typing", (data) => {
socket.broadcast.emit("typing", data);
});

socket.on("disconnect", () => {
console.log("user disconnected");
});

});

server.listen(3000, () => {
console.log("http://localhost:3000");
});