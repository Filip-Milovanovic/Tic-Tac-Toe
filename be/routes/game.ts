import express, { Request, Response, NextFunction } from "express";
import pool from "../db";

const router = express.Router();

// Inicijalizacija baze podataka - dodavanje ID, type i player1
router.post("/newGame", async (req: Request, res: Response) => {
  const { player1, type }: { player1: string; type: string } = req.body;
  console.log(player1, type);

  try {
    let result;
    if (type === "multiplayer") {
      result = await pool.query(
        "INSERT INTO game (player1, type) VALUES ($1, $2) RETURNING *",
        [player1, type]
      );
    } else {
      result = await pool.query(
        "INSERT INTO game (player1, player2, type) VALUES ($1, $2, $3) RETURNING *",
        [player1, "CPU", type]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting new game:", err);
    res.status(500).send("Error inserting new game");
  }
});

// Update reda - dodajemo player2
router.patch("/addPlayer2/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { player2 }: { player2: string } = req.body;

  try {
    const result = await pool.query(
      "UPDATE game SET player2 = $1 WHERE id = $2 RETURNING *",
      [player2, id]
    );

    if (result.rowCount === 0) {
      res.status(404).send("Game not found");
    } else {

      res.json({ playerJoined: true });
    }
  } catch (err) {
    console.error("Error updating player2:", err);
    res.status(500).send("Error updating player2");
  }
});

// Dodavanje poteza
router.patch("/addMove/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { move, player, sign }: { move: string; player: string; sign: string } =
    req.body;
  console.log(move, player);
  const column = sign === "X" ? "player1Moves" : "player2Moves";

  try {
    const result = await pool.query(
      `UPDATE game 
         SET ${column} = array_append(${column}, $1) 
         WHERE id = $2 
         RETURNING *`,
      [move, id]
    );

    if (result.rowCount === 0) {
      res.status(404).send("Game not found");
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error("Error adding move:", err);
    res.status(500).send("Error adding move");
  }
});

// Dodavanje polja Winner
router.patch("/setWinner/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { winner }: { winner: string } = req.body;
  let w;
  if (winner !== "tie") {
    w = winner === "X" ? "Player 1" : "Player 2";
  } else {
    w = "tie";
  }

  try {
    const result = await pool.query(
      "UPDATE game SET winner = $1, finished = TRUE WHERE id = $2 RETURNING *",
      [w, id]
    );

    if (result.rowCount === 0) {
      res.status(404).send("Game not found");
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error("Error setting winner:", err);
    res.status(500).send("Error setting winner");
  }
});

export default router;
