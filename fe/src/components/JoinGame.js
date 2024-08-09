import React, { useEffect, useState } from "react";
import Header from "./Header";
import io from "socket.io-client";
import Square from "./Square";
import { Patterns } from "../WinningPatterns";

const socket = io.connect("http://localhost:5000");

function JoinGame() {
  //User information state
  const [user, setUser] = useState(null);

  //Multiplayer Game State
  const [multiplayer, setMultiplayer] = useState(false);

  //SocketIO Room States
  const [room, setRoom] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(false);

  //Tic-Tac-Toe Game States
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [player, setPlayer] = useState("X");
  const [turn, setTurn] = useState("X");
  const [result, setResult] = useState({ winner: "none", state: "none" });

  useEffect(() => {
    const userr = localStorage.getItem("user");

    if (userr) {
      const parsedData = JSON.parse(userr);
      setUser(parsedData);
    }
  }, []);

  const handleCreateMultiplayer = () => {
    setMultiplayer(true);
  };

  //SocketIO functions #############
  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
      setJoinedRoom(true);
      console.log(room);
    }
  };

  const sendMessage = (pl, sq, rm) => {
    socket.emit("send_message", { rm: room, pl: player, sq: sq });
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      const currentPlayer = data.pl === "X" ? "O" : "X";
      setPlayer(currentPlayer);
      setTurn(currentPlayer);
      // console.log(data, currentPlayer);
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        if (newBoard[data.sq] === "") {
          newBoard[data.sq] = data.pl;
        }
        return newBoard;
      });
      console.log(board);
    });
  }, [socket]);

  //#########################

  //Tic-Tac-Toe Game Logic
  const chooseSquare = async (square) => {
    if (turn === player && board[square] === "") {
      setTurn(player === "X" ? "O" : "X");

      await sendMessage(player, square, room);

      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        if (newBoard[square] === "") {
          newBoard[square] = player;
        }
        return newBoard;
      });
    }
    console.log(board);
  };

  const checkWin = () => {
    Patterns.forEach((currPattern) => {
      const firstPlayer = board[currPattern[0]];
      if (firstPlayer === "") return;
      let foundWinningPattern = true;
      currPattern.forEach((i) => {
        if (board[i] !== firstPlayer) {
          foundWinningPattern = false;
        }
      });
      if (foundWinningPattern) {
        setResult({ winner: board[currPattern[0]], state: "won" });

        alert(`Winner:  ${board[currPattern[0]]}`);
      }
    });
  };

  const checkTie = () => {
    let filled = true;
    board.forEach((square) => {
      if (square === "") {
        filled = false;
      }
    });
    if (filled) {
      setResult({ winned: "none", state: "tie" });
      alert("Game tied");
    }
  };

  useEffect(() => {
    checkWin();
    checkTie();
  }, [board]);

  // ######################

  const handleJoinRoom = () => {
    setMultiplayer(true);
    joinRoom();
  };

  return (
    <>
      <Header />
      {/* MULTIPLAYER GAME */}
      {/* If multiplayer is false */}
      {!multiplayer && (
        <div className="joingame-container">
          <button className="joingame-btn" onClick={handleCreateMultiplayer}>
            Create new multiplayer game
          </button>
          <button className="joingame-btn">
            Create new single player game
          </button>
          <div className="joingame-label-div">
            <label>Join multiplayer game by ID</label>
            <input
              type="text"
              onChange={(e) => {
                setRoom(e.target.value);
              }}
            />
            <button className="joingame-btn-join" onClick={handleJoinRoom}>
              Join
            </button>
          </div>
        </div>
      )}
      {/* If multiplayer is true, and user did not join any room */}
      {multiplayer && !joinedRoom && (
        <>
          <input
            placeholder="Enter room number"
            onChange={(e) => {
              setRoom(e.target.value);
            }}
          />
          <button onClick={joinRoom}>Join Room</button>
        </>
      )}
      {/* If multiplayer is true, and user is in a room */}
      {multiplayer && joinedRoom && (
        <>
          <div className="board">
            <div className="row">
              <Square
                val={board[0]}
                chooseSquare={(e) => {
                  e.preventDefault();
                  chooseSquare(0);
                }}
              />
              <Square
                val={board[1]}
                chooseSquare={(e) => {
                  e.preventDefault();
                  chooseSquare(1);
                }}
              />
              <Square
                val={board[2]}
                chooseSquare={(e) => {
                  e.preventDefault();
                  chooseSquare(2);
                }}
              />
            </div>
            <div className="row">
              <Square
                val={board[3]}
                chooseSquare={(e) => {
                  e.preventDefault();
                  chooseSquare(3);
                }}
              />
              <Square
                val={board[4]}
                chooseSquare={(e) => {
                  e.preventDefault();
                  chooseSquare(4);
                }}
              />
              <Square
                val={board[5]}
                chooseSquare={(e) => {
                  e.preventDefault();
                  chooseSquare(5);
                }}
              />
            </div>
            <div className="row">
              <Square
                val={board[6]}
                chooseSquare={(e) => {
                  e.preventDefault();
                  chooseSquare(6);
                }}
              />
              <Square
                val={board[7]}
                chooseSquare={(e) => {
                  e.preventDefault();
                  chooseSquare(7);
                }}
              />
              <Square
                val={board[8]}
                chooseSquare={(e) => {
                  e.preventDefault();
                  chooseSquare(8);
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default JoinGame;
