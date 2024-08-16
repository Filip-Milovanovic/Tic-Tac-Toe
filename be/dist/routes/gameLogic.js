"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Patterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];
router.post("/cpuPlays/:gameID", async (req, res) => {
    const { gameID } = req.params;
    const { gameFinished, board, square, } = req.body;
    if (gameFinished)
        return res.json({ message: "Game is finished" });
    let randomNumber;
    do {
        randomNumber = Math.floor(Math.random() * 9);
    } while (board[randomNumber] !== "" || randomNumber === square);
    const cpu = "CPU";
    const signCpu = "O";
    await fetch(`http://localhost:5000/game/addMove/${gameID}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            player: cpu,
            move: randomNumber,
            sign: signCpu,
        }),
    });
    res.json({ move: randomNumber });
});
router.post("/updateBoardMP", (req, res) => {
    const { prevBoard, move, sign, } = req.body;
    let board = [...prevBoard];
    board[move] = sign;
    res.json({ newBoard: board });
});
router.post("/updateBoardSP/:gameID", async (req, res) => {
    const { gameID } = req.params;
    const { prevBoard, move, sign, } = req.body;
    let board = [...prevBoard];
    board[move] = sign;
    let gameFinishedd;
    //Provjeravamo da li je kraj
    const response = await fetch(`http://localhost:5000/gameLogic/checkWin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            updatedBoard: board,
            multiplayer: false,
            singleplayer: true,
            Patterns: Patterns,
            myId: gameID,
            gameID: gameID,
        }),
    });
    if (response.ok) {
        const data = await response.json();
        gameFinishedd = data.gameFinished;
    }
    res.json({ newBoard: board, finishedd: gameFinishedd });
});
router.post("/checkTie", async (req, res) => {
    const { board, multiplayer, gameID, myId, } = req.body;
    let finished = false, winner = "";
    let filled = true;
    board.forEach((square) => {
        if (square === "") {
            filled = false;
        }
    });
    if (filled) {
        finished = true;
        winner = "tie";
        if (multiplayer) {
            await fetch(`http://localhost:5000/game/setWinner/${myId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ winner: "tie" }),
            });
        }
        else {
            await fetch(`http://localhost:5000/game/setWinner/${gameID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ winner: "tie" }),
            });
        }
    }
    res.json({ finished: finished, winner: winner });
});
router.post("/checkWin", async (req, res) => {
    const { updatedBoard, Patterns, multiplayer, myId, gameID, singleplayer, } = req.body;
    //States
    let finished = false, winner = "", gameFinished = false;
    for (const currPattern of Patterns) {
        const firstPlayer = updatedBoard[currPattern[0]];
        if (firstPlayer === "")
            continue;
        let foundWinningPattern = true;
        for (const i of currPattern) {
            if (updatedBoard[i] !== firstPlayer) {
                foundWinningPattern = false;
                break;
            }
        }
        if (foundWinningPattern) {
            finished = true;
            gameFinished = true;
            winner = updatedBoard[currPattern[0]];
            if (multiplayer) {
                await fetch(`http://localhost:5000/game/setWinner/${myId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ winner: updatedBoard[currPattern[0]] }),
                });
            }
            else if (singleplayer) {
                await fetch(`http://localhost:5000/game/setWinner/${gameID}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ winner: updatedBoard[currPattern[0]] }),
                });
            }
        }
    }
    res.json({ finished: finished, gameFinished: gameFinished, winner: winner });
});
exports.default = router;
