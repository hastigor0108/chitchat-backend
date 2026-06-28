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

/* ROOM STORAGE */
let rooms = {};

/* SOCKET */
io.on("connection", (socket) => {

  console.log("user connected:", socket.id);

  /* JOIN ROOM */
  socket.on("join-room", (room) => {

    if (!room) return;

    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = [];
    }

    // send old messages
    socket.emit("chat-history", rooms[room]);
  });

  /* SEND MESSAGE */
  socket.on("send-message", (data) => {

    const room = data.room;

    if (!room) return;

    if (!rooms[room]) {
      rooms[room] = [];
    }

    rooms[room].push(data);

    io.to(room).emit("receive-message", data);
  });

  /* TYPING */
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
