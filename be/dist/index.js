"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const refresh_1 = __importDefault(require("./routes/refresh"));
const register_1 = __importDefault(require("./routes/register"));
const deleteUser_1 = __importDefault(require("./routes/deleteUser"));
const game_1 = __importDefault(require("./routes/game"));
// Initialize Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // req.body
app.use((0, cookie_parser_1.default)());
// View engine setup
app.set("view engine", "ejs");
// Routes
app.use("/register", register_1.default);
app.use("/refresh", refresh_1.default);
app.use("/delete", deleteUser_1.default);
app.use("/game", game_1.default);
// Initialize HTTP server and Socket.IO
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});
// Socket.IO event handling
io.on("connection", (socket) => {
    socket.on("join_room", (data) => {
        socket.join(data);
        socket.to(data).emit("user_joined", { message: "New user has joined" });
    });
    socket.on("send_message", (data) => {
        console.log(data);
        socket.to(data.rm).emit("receive_message", data);
    });
    socket.on("send_id", (data) => {
        socket.to(data.rm).emit("receive_id", data);
    });
    socket.on("send_newgame_created", (data) => {
        socket.to(data.rm).emit("receive_newgame_created", data);
    });
    socket.on("send_canplay", (data) => {
        socket.to(data.rm).emit("receive_canplay", data);
    });
});
// Start the server
server.listen(5000, () => {
    console.log("Server has started on port 5000");
});
