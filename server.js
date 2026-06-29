const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();

const server =
http.createServer(app);

/* CHAT MEMORY */
const chats = {};

const io =
new Server(server,{
cors:{
origin:"*",
methods:[
"GET",
"POST"
]
},
transports:[
"polling"
]
});

app.use(
express.static(
path.join(
__dirname,
"../frontend"
)
)
);

app.get(
"/",
(req,res)=>{
res.send(
"ChitChat backend running 💌"
);
}
);

app.get(
"/health",
(req,res)=>{
res.json({
status:"ok"
});
}
);

/* SOCKET */

io.on(
"connection",
(socket)=>{

console.log(
"CONNECTED:",
socket.id
);

/* ROOM */

socket.on(
"join-room",
(room)=>{

socket.join(
room
);

if(
!chats[
room
]
){

chats[
room
]=[];

}

socket.emit(
"chat-history",
chats[
room
]
);

}
);

/* SEND */

socket.on(
"send-message",
(data)=>{

if(
!data.room
)
return;

if(
!chats[
data.room
]
){

chats[
data.room
]=[];

}

chats[
data.room
]
.push(
data
);

io.to(
data.room
).emit(
"receive-message",
data
);

});

/* TYPING */

socket.on(
"typing",
(data)=>{

socket
.broadcast
.emit(
"typing",
data
);

});

socket.on(
"disconnect",
()=>{

console.log(
"LEFT"
);

});

}
);

const PORT =
process.env.PORT
||
3000;

server.listen(
PORT,
()=>{

console.log(
"RUNNING",
PORT
);

}
);
