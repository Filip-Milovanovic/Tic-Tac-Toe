import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';
import verifyJWT from '../middlewares/middlewares';

const router = express.Router();

let refreshTokens: string[] = [];

const generateAccessToken = (user: { id: number }) => {
  return jwt.sign({ id: user.id }, "secret key", {
    expiresIn: "3000m",
  });
};

const generateRefreshToken = (user: { id: number }) => {
  return jwt.sign({ id: user.id }, "refresh secret key", {
    expiresIn: "3000m",
  });
};

// REFRESH TOKEN
router.post("/refresh", (req: Request, res: Response) => {
  const refreshToken = req.body.token as string;

  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }

  jwt.verify(refreshToken, "refresh secret key", (err, data) => {
    if (err) {
      console.log(err);
      return res.status(403).json("Token is not valid!");
    }

    const userId = (data as jwt.JwtPayload).id;

    const newAccessToken = generateAccessToken({ id: userId });
    const newRefreshToken = generateRefreshToken({ id: userId });

    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

// LOGIN
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    const user = result.rows[0];
    if (user) {
      const accessToken = generateAccessToken({ id: user.id });
      const refreshToken = generateRefreshToken({ id: user.id });

      refreshTokens.push(refreshToken);

      const loggedUser = await pool.query("SELECT * FROM loggedUsers WHERE id=$1", [
        user.id,
      ]);

      if (loggedUser.rows.length === 0) {
        await pool.query(
          "INSERT INTO loggedUsers (id, username) VALUES($1,$2) RETURNING *",
          [user.id, user.username]
        );
      }

      res.json({
        id: user.id,
        username: user.username,
        accessToken,
        refreshToken,
      });
    } else {
      res.json({ message: "Wrong username/password" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Server error");
  }
});

// LOGOUT
router.post("/logout", verifyJWT, (req: Request, res: Response) => {
  const refreshToken = req.body.token as string;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  console.log("Successfully logged out!");
  res.status(200).json({ loggedOut: true });
});

export default router;
