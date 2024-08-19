import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server, Socket } from "socket.io";
import refreshRoute from "./routes/refresh";
import registerRoute from "./routes/register";
import deleteUserRoute from "./routes/deleteUser";
import gameRoute from "./routes/game";
import gameLogicRoute from "./routes/gameLogic";

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
app.use("/gameLogic", gameLogicRoute);

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

  app.post("/gameLogic/sendMessage", (req: Request, res: Response) => {
    const {
      pl,
      sq,
      rm,
      player,
    }: { player: string; pl: string; sq: number; rm: string } = req.body;
    const data = { pl, sq, rm, player };
    res.json({ message: "Message sent" });
    socket.broadcast.to(rm).emit("receive_message", data);
  });

  app.post("/gameLogic/sendId", (req: Request, res: Response) => {
    const { rm, id }: { rm: string; id: number } = req.body;
    const data = { rm, id };
    res.json({ message: "ID sent" });
    socket.to(rm).emit("receive_id", data);
  });

  app.post("/gameLogic/newGameCreated", (req: Request, res: Response) => {
    const { rm }: { rm: string } = req.body;
    const data = { rm };
    res.json({ message: "New Game Created sent" });
    socket.to(rm).emit("receive_newgame_created", data);
  });

  app.post("/gameLogic/canPlay", (req: Request, res: Response) => {
    const { rm }: { rm: string } = req.body;
    const data = { rm };
    res.json({ message: "Can Play sent" });
    socket.to(rm).emit("receive_canplay", data);
  });
});

// Start the server
server.listen(4000, () => {
  console.log("Server has started on port 5000");
});
