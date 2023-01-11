import { Server } from "socket.io";
const io = new Server(process.env.PORT || 9000, {
  cors: true,
});

let nameToSocketMapping = new Map();
let socketToNameMapping = new Map();

io.on("connection", (socket) => {
  socket.on("get-me", () => {
    let id = socket.id
    socket.emit("me", {id});
  });

  socket.on("newRoom-created", (data) => {
    const { roomId, name } = data;
    nameToSocketMapping.set(name, socket.id);
    socketToNameMapping.set(socket.id, name);
    socket.join(roomId);
    socket.emit("newRoom-created", { roomId, name });
  });

  socket.on("join-room", (data) => {
    const { roomId, name } = data;
    nameToSocketMapping.set(name, socket.id);
    socketToNameMapping.set(socket.id, name);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("newUser-joined", { name });
  });

  socket.on("call-user", (data) => {
    const { name, offer } = data;
    const socketId = nameToSocketMapping.get(name);
    const fromName = socketToNameMapping.get(socket.id);
    socket.to(socketId).emit("incomming-call", { from: fromName, offer });
  });

  socket.on("call-accepted", (data) => {
    const { name, ans } = data;
    const socketId = nameToSocketMapping.get(name);
    socket.to(socketId).emit("calling-accepted", { ans });
  });

  socket.on("nego-call-user", (data) => {
    const { name, offer } = data;
    const socketId = nameToSocketMapping.get(name);
    const fromName = socketToNameMapping.get(socket.id);
    socket.to(socketId).emit("nego-incomming-call", { from: fromName, offer });
  });

  socket.on("nego-call-accepted", (data) => {
    const { name, ans } = data;
    const socketId = nameToSocketMapping.get(name);
    socket.to(socketId).emit("nego-calling-accepted", { ans });
  });
});
