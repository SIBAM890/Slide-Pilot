const { Server } = require("socket.io");

const io = new Server(process.env.PORT || 3000, {
    cors: {
        origin: "*", // Allow connections from Vercel/Localhost
        methods: ["GET", "POST"]
    }
});

console.log("🚀 SlidePilot Signaling Server running...");

io.on("connection", (socket) => {
    // 1. Join Session
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        // Notify others in room that a user connected (initiates WebRTC)
        // This is usually caught by the Broadcaster to initiate the call to the new Controller
        socket.to(roomId).emit("user-connected", socket.id);
    });

    // 2. WebRTC Handshaking (Offer/Answer/ICE Candidates)
    socket.on("signal", (data) => {
        // If target is specified, send to specific user
        if (data.target) {
            io.to(data.target).emit("signal", {
                signal: data.signal,
                caller: socket.id
            });
        } else {
            // Otherwise broadcast to room (excluding sender)
            // Useful if we just want to blast the signal to the other peer
            if (data.roomId) {
                socket.to(data.roomId).emit("signal", {
                    signal: data.signal,
                    caller: socket.id
                });
            }
        }
    });

    // 3. Remote Control Commands (Smart Board -> Laptop)
    socket.on("control-command", ({ roomId, command }) => {
        // Broadcast to everyone else in the room (specifically the presenter)
        socket.to(roomId).emit("execute-command", command);
        console.log(`Command ${command} sent to room ${roomId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        // Optional: notify room of disconnection
    });
});
