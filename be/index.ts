import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import http from "http";
import { Server, Socket } from "socket.io";
import pool from "./db";
import refreshRoute from "./routes/refresh";
import registerRoute from "./routes/register";
import deleteUserRoute from "./routes/deleteUser";
import gameRoute from "./routes/game";

// Initialize Express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json()); // req.body
app.use(cookieParser());

// View engine setup
app.set("view engine", "ejs");

// Routes
app.use("/register", registerRoute);
app.use("/refresh", refreshRoute);
app.use("/delete", deleteUserRoute);
app.use("/game", gameRoute);

// Initialize HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Socket.IO event handling
io.on("connection", (socket: Socket) => {
  socket.on("join_room", (data: string) => {
    socket.join(data);
    socket.to(data).emit("user_joined", { message: "New user has joined" });
  });

  socket.on("send_message", (data: { rm: string; message: string }) => {
    console.log(data);
    socket.to(data.rm).emit("receive_message", data);
  });

  socket.on("send_id", (data: { rm: string; id: string }) => {
    socket.to(data.rm).emit("receive_id", data);
  });

  socket.on("send_newgame_created", (data: { rm: string; gameData: any }) => {
    socket.to(data.rm).emit("receive_newgame_created", data);
  });

  socket.on("send_canplay", (data: { rm: string; canPlay: boolean }) => {
    socket.to(data.rm).emit("receive_canplay", data);
  });
});

// Start the server
server.listen(5000, () => {
  console.log("Server has started on port 5000");
});
