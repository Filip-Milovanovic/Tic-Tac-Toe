"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db")); // Uverite se da imate TypeScript modul za 'db'
const middlewares_1 = __importDefault(require("../middlewares/middlewares"));
const router = express_1.default.Router();
// Delete user
router.delete('/register/:id', middlewares_1.default, (req, res) => {
    if (req.data?.id === req.params.id) {
        res.status(200).json("User has been deleted");
    }
    else {
        res.status(403).json("You are not allowed to delete this user.");
    }
});
// Remove user from loggedUsers db
router.delete('/login/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.default.query("DELETE FROM loggedUsers WHERE id = $1", [id]);
        res.status(200).json("User has been removed from loggedUsers");
    }
    catch (err) {
        console.error(err);
        res.status(500).json("An error occurred");
    }
});
exports.default = router;
