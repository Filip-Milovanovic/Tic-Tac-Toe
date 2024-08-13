import express, { Request, Response, NextFunction } from 'express';
import pool from '../db'; // Uverite se da imate TypeScript modul za 'db'
import verifyJWT from '../middlewares/middlewares'; 

const router = express.Router();

// Interface za req.data (ako je poznato šta sve sadrži)
interface CustomRequest extends Request {
  data?: {
    id: string;
  };
}

// Delete user
router.delete('/register/:id', verifyJWT, (req: CustomRequest, res: Response) => {
  if (req.data?.id === req.params.id) {
    res.status(200).json("User has been deleted");
  } else {
    res.status(403).json("You are not allowed to delete this user.");
  }
});

// Remove user from loggedUsers db
router.delete('/login/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM loggedUsers WHERE id = $1", [id]);
    res.status(200).json("User has been removed from loggedUsers");
  } catch (err) {
    console.error(err);
    res.status(500).json("An error occurred");
  }
});

export default router;
