import express, { Request, Response } from 'express';
import pool from '../db';

const router = express.Router();

// Definiši tip za korisnika
interface User {
  id: number;
  username: string;
}

router.post("/", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Proveri da li korisnik već postoji
    const userResult = await pool.query<User>(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    // Dodaj u bazu ako ne postoji
    if (userResult.rows.length === 0) {
      const newUserResult = await pool.query<User>(
        "INSERT INTO users (username, password) VALUES($1, $2) RETURNING *",
        [username, password]
      );

      const newUser = newUserResult.rows[0];
      res.status(201).json({
        userId: newUser.id,
        username: newUser.username,
      });
    } else {
      res.json({ message: "This username is already taken. Try another one." });
    }
  } catch (err) {
    console.error(err);
    res.status(400).send("Error, user not created.");
  }
});

export default router;
