const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let documentContent = "";

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("load-document", documentContent);

  socket.on("send-changes", (delta) => {
    documentContent = delta;
    socket.broadcast.emit("receive-changes", delta);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(4000, () => console.log("🚀 Server running on port 4000"));