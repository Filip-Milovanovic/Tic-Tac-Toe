const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyJWT = require("../middlewares/middlewares");

//Delete user
router.delete("/register/:id", verifyJWT, (req, res) => {
  if (req.data.id == req.params.id) {
    res.status(200).json("User has been deleted");
  } else {
    res.status(403).json("You are not allowed to delete this user.");
  }
});

//Remove user from loggedUsers db
router.delete("/login/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM loggedUsers WHERE id = $1", [id]);
  } catch (err) {
    console.log(err);
  }
});

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

module.exports = router;
