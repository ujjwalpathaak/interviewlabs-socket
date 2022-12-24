import { Server } from "socket.io";
const PORT = process.env.PORT || 9000
const io = new Server({
  cors: true,
});

// URL -> https://interviewlabs-socket.onrender.com
const nameToSocketMapping = new Map();
const socketToNameMapping = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { roomId, name } = data;
    console.log("user ", name, "joined room", roomId);
    nameToSocketMapping.set(name, socket.id);
    socketToNameMapping.set(socket.id, name);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { name });
  });
  socket.on("call-user", (data) => {
    const { name, offer } = data;
    const socketId = nameToSocketMapping.get(name);
    const froEmail = socketToNameMapping.get(socket.id);
    socket.to(socketId).emit("incomming-call", { from: froEmail, offer });
  });
  socket.on("call-accepted", (data) => {
    const { name, ans } = data;
    const socketId = nameToSocketMapping.get(name);
    socket.to(socketId).emit("call-accepted", { ans });
  });
});

io.listen(PORT, () => {
  console.log(`Socket server running on ${PORT}`);
});
