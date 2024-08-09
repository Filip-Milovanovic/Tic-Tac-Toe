const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

//Routes
const refreshRoute = require("./routes/refresh");
const registerRoute = require("./routes/register");
const deleteUserRoute = require("./routes/deleteUser");
const gameRoute = require("./routes/game");

//middleware
app.use(cors());
app.use(express.json()); //req.body
app.use(cookieParser());

//view engine
app.set("view engine", "ejs");

//ROUTES ################################

//Register
app.use("/register", registerRoute);

//Refresh - refresh, login, logout - using refresh tokens
app.use("/refresh", refreshRoute);

//remove users from some db
app.use("/delete", deleteUserRoute);

//game database manipulation
app.use("/game", gameRoute);

//Napravljeno zbog ciscenja baze podataka, mada se moze dodati i u funckinalnost :D
//DELETE
// app.delete("/register/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleteUser = await pool.query("DELETE FROM users WHERE id = $1", [
//       id,
//     ]);
//     res.json("Deleted");
//   } catch (err) {
//     console.error(err.message);
//   }
// });

//SOCKETIO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    socket.join(data);
    socket.to(data).emit("user_joined", { message: "New user has joined" });
  });

  socket.on("send_message", (data) => {
    console.log(data)
    socket.to(data.rm).emit("receive_message", data);
  });

  socket.on("send_id", (data) => {
    socket.to(data.rm).emit("receive_id", data);
  });
});

server.listen(5000, () => {
  console.log("Server has started on port 5000");
});
