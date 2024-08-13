const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../db");
const verifyJWT = require("../middlewares/middlewares");

let refreshTokens = [];

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.rows[0].id }, "secret key", {
    expiresIn: "3000m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.rows[0].id }, "refresh secret key", {
    expiresIn: "3000m",
  });
};

//REFRESH TOKEN
router.post("/refresh", (req, res) => {
  //take the refresh token from user
  const refreshToken = req.body.token;

  //send error is there is no token/token is not valid
  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }

  //if everything is ok, create new access token, refresh token and send to user
  jwt.verify(refreshToken, "refresh secret key", (err, data) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = jwt.sign({ id: data.id }, "secret key", {
      expiresIn: "3000m",
    });
    const newRefreshToken = jwt.sign({ id: data.id }, "refresh secret key", {
      expiresIn: "3000m",
    });

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

//LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE username = $1 AND password = $2",
    [username, password]
  );

  if (user.rows.length > 0) {
    //Generate access token
    const accessToken = generateAccessToken(user);

    //Generate refresh token
    const refreshToken = generateRefreshToken(user);

    //Add refresh token to array of refresh tokens
    refreshTokens.push(refreshToken);

    //Add user to logged in users table
    const loggedUser = await pool.query("SELECT FROM loggedUsers WHERE id=$1", [
      user.rows[0].id,
    ]);

    //If he is already in base, he can not log in twice
    if (loggedUser.rows.length === 0) {
      await pool.query(
        "INSERT INTO loggedUsers (id, username) VALUES($1,$2) RETURNING *",
        [user.rows[0].id, user.rows[0].username]
      );
    }

    console.log(
      typeof(user.rows[0].id),
      user.rows[0].id,
      user.rows[0].username,
      accessToken,
      refreshToken
    );
    //Send data to front-end
    res.json({
      id: user.rows[0].id,
      username: user.rows[0].username,
      accessToken,
      refreshToken,
    });
  } else {
    res.json({ message: "Wrong username/password" });
  }
});

//LOGOUT
router.post("/logout", verifyJWT, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  console.log("Successfully logged out!");
  res.status(200).json({ loggedOut: true });
});

module.exports = router;
