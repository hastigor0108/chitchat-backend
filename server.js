const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["polling", "websocket"]
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.send("ChitChat backend running 💌");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* MEMORY STORE */
const rooms = {};

/* SOCKET */
io.on("connection", (socket) => {

  console.log("CONNECTED:", socket.id);

  socket.on("join-room", (room) => {
    if (!room) return;

    socket.join(room);

    if (!rooms[room]) rooms[room] = [];

    socket.emit("chat-history", rooms[room]);
  });

  socket.on("send-message", (data) => {

    if (!data || !data.room) return;

    if (!rooms[data.room]) rooms[data.room] = [];

    rooms[data.room].push(data);

    io.to(data.room).emit("receive-message", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", socket.id);
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on", PORT);
});
