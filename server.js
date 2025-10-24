const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend connections

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("✅ WebSocket Server is running!");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ username, roomName }) => {
    socket.username = username;
    socket.join(roomName);
    console.log(`${username} joined ${roomName}`);
    io.to(roomName).emit("message", `[${username}] joined the room.`);
  });

  socket.on("roomMessage", ({ roomName, msg, time }) => {
    const messageText = `[${socket.username}]: ${msg} (${time})`;
    io.to(roomName).emit("message", messageText);
  });

  socket.on("leaveRoom", (roomName) => {
    io.to(roomName).emit("message", `[${socket.username}] left the room.`);
    socket.leave(roomName);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.username || socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
