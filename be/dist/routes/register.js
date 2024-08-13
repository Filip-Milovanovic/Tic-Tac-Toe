"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Proveri da li korisnik već postoji
        const userResult = await db_1.default.query("SELECT * FROM users WHERE username = $1", [username]);
        // Dodaj u bazu ako ne postoji
        if (userResult.rows.length === 0) {
            const newUserResult = await db_1.default.query("INSERT INTO users (username, password) VALUES($1, $2) RETURNING *", [username, password]);
            const newUser = newUserResult.rows[0];
            res.status(201).json({
                userId: newUser.id,
                username: newUser.username,
            });
        }
        else {
            res.json({ message: "This username is already taken. Try another one." });
        }
    }
    catch (err) {
        console.error(err);
        res.status(400).send("Error, user not created.");
    }
});
exports.default = router;
