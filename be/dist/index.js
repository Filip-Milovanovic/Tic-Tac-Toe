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
const gameLogic_1 = __importDefault(require("./routes/gameLogic"));
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
app.use("/gameLogic", gameLogic_1.default);
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
    app.post("/gameLogic/sendMessage", (req, res) => {
        const { pl, sq, rm, playerr, } = req.body;
        const data = { pl, sq, rm, playerr };
        res.json({ message: "Message sent" });
        socket.broadcast.to(rm).emit("receive_message", data);
    });
    app.post("/gameLogic/sendId", (req, res) => {
        const { rm, id } = req.body;
        const data = { rm, id };
        res.json({ message: "ID sent" });
        socket.to(rm).emit("receive_id", data);
    });
    app.post("/gameLogic/newGameCreated", (req, res) => {
        const { rm } = req.body;
        const data = { rm };
        res.json({ message: "New Game Created sent" });
        socket.to(rm).emit("receive_newgame_created", data);
    });
    app.post("/gameLogic/canPlay", (req, res) => {
        const { rm } = req.body;
        const data = { rm };
        res.json({ message: "Can Play sent" });
        socket.to(rm).emit("receive_canplay", data);
    });
});
// Start the server
server.listen(5000, () => {
    console.log("Server has started on port 5000");
});
