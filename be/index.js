const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

//Routes
const refreshRoute = require("./routes/refresh");
const registerRoute = require("./routes/register");
const deleteUserRoute = require("./routes/deleteUser");

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

//Delete user
app.use("/delete", deleteUserRoute);

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

app.listen(5000, () => {
  console.log("Server has started on port 5000");
});
