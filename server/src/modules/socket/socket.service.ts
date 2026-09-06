import { Server } from "socket.io";
import http from "http";

class SocketService {
    private io: Server | null = null;

    init(server: http.Server) {
        this.io = new Server(server, {
            cors: {
                origin: "*", // Adjust in production
                methods: ["GET", "POST"],
            },
        });

        this.io.on("connection", (socket) => {
            console.log("Client connected to socket:", socket.id);

            // Join a specific order tracking room
            socket.on("join_order_room", (orderId: string) => {
                socket.join(`order:${orderId}`);
                console.log(`Socket ${socket.id} joined room: order:${orderId}`);
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });
    }

    emitOrderStatusUpdate(orderId: string, data: any) {
        if (!this.io) {
            console.warn("Socket.io is not initialized!");
            return;
        }
        this.io.to(`order:${orderId}`).emit("order:status:update", data);
    }
}

export const socketService = new SocketService();
