const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();

const server = http.createServer(app);

/* SOCKET.IO */
const io = new Server(server, {
cors: {
origin: "*",
methods: ["GET", "POST"]
}
});

/* FRONTEND */
app.use(
express.static(
path.join(__dirname, "../frontend")
)
);

/* TEST */
app.get("/", (req, res) => {
res.send("ChitChat backend running 💌");
});

/* SOCKET */
io.on("connection", (socket) => {

console.log("user connected");

/* SEND MESSAGE */
socket.on("send-message", (data) => {

io.emit(
"receive-message",
data
);

});

/* TYPING */
socket.on("typing", (data) => {

socket.broadcast.emit(
"typing",
data
);

});

/* DISCONNECT */
socket.on("disconnect", () => {

console.log(
"user disconnected"
);

});

});

/* PORT */
const PORT =
process.env.PORT || 3000;

server.listen(
PORT,
() => {

console.log(
`Server running on ${PORT}`
);

}
);
