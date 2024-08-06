const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    //INSERT IN DB
    const newUser = await pool.query(
      "INSERT INTO users (username, password) VALUES($1,$2) RETURNING *",
      [username, password]
    );

    res
      .status(201)
      .json({ userId: newUser.rows[0].id, usename: newUser.rows[0].username });
  } catch (err) {
    console.error(err);
    res.status(400).send("Error, user not created.");
  }
});

module.exports = router;
