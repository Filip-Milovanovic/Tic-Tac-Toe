const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    //Check if user already exists
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    //INSERT IN DB
    if (user.rows.length === 0) {
      const newUser = await pool.query(
        "INSERT INTO users (username, password) VALUES($1,$2) RETURNING *",
        [username, password]
      );

      res
        .status(201)
        .json({
          userId: newUser.rows[0].id,
          usename: newUser.rows[0].username,
        });
    } else {
      res.json({ message: "This username is already taken. Try another one." });
    }
  } catch (err) {
    console.error(err);
    res.status(400).send("Error, user not created.");
  }
});

module.exports = router;
