"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const middlewares_1 = __importDefault(require("../middlewares/middlewares"));
const router = express_1.default.Router();
let refreshTokens = [];
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id }, "secret key", {
        expiresIn: "3000m",
    });
};
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id }, "refresh secret key", {
        expiresIn: "3000m",
    });
};
// REFRESH TOKEN
router.post("/refresh", (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken)
        return res.status(401).json("You are not authenticated!");
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json("Refresh token is not valid!");
    }
    jsonwebtoken_1.default.verify(refreshToken, "refresh secret key", (err, data) => {
        if (err) {
            console.log(err);
            return res.status(403).json("Token is not valid!");
        }
        const userId = data.id;
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
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db_1.default.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password]);
        const user = result.rows[0];
        if (user) {
            const accessToken = generateAccessToken({ id: user.id });
            const refreshToken = generateRefreshToken({ id: user.id });
            refreshTokens.push(refreshToken);
            const loggedUser = await db_1.default.query("SELECT * FROM loggedUsers WHERE id=$1", [
                user.id,
            ]);
            if (loggedUser.rows.length === 0) {
                await db_1.default.query("INSERT INTO loggedUsers (id, username) VALUES($1,$2) RETURNING *", [user.id, user.username]);
            }
            res.json({
                id: user.id,
                username: user.username,
                accessToken,
                refreshToken,
            });
        }
        else {
            res.json({ message: "Wrong username/password" });
        }
    }
    catch (err) {
        console.error("Error during login:", err);
        res.status(500).send("Server error");
    }
});
// LOGOUT
router.post("/logout", middlewares_1.default, (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    console.log("Successfully logged out!");
    res.status(200).json({ loggedOut: true });
});
exports.default = router;
