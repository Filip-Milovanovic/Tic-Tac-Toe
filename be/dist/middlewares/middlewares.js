"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jsonwebtoken_1.default.verify(token, "secret key", (err, data) => {
            if (err) {
                return res.status(403).json("Token is not valid");
            }
            req.data = data; // Castujemo data na JwtPayload
            next();
        });
    }
    else {
        res.status(401).json("You are not authenticated");
    }
};
exports.default = verifyJWT;
