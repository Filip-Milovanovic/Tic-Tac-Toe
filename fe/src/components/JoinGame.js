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
  const [anotherUserJoinerRoom, setAnotherUserJoinerRoom] = useState(false);

  //Tic-Tac-Toe Game States
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [player, setPlayer] = useState("X");
  const [firstPlayer, setFirstPlayer] = useState(false); //Da se ne bi pravila 2 reda kad stisnemo new game na oba clienta
  const [turn, setTurn] = useState("X");
  const [gameID, setGameID] = useState(undefined);
  const [finished, setFinished] = useState(false);
  const [winner, setWinner] = useState("X");

  let id,
    callCount = 1;

  useEffect(() => {
    const userr = localStorage.getItem("user");

    if (userr) {
      const parsedData = JSON.parse(userr);
      setUser(parsedData);
    }
  }, []);

  const handleCreateMultiplayer = async () => {
    setMultiplayer(true);
    setFirstPlayer(true);
    const player = user.username;
    const typee = "multiplayer";

    const response = await fetch("http://localhost:5000/game/newGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ player1: player, type: typee }),
    });

    if (response.ok) {
      const data = await response.json();
      setGameID(data.id);
    }
  };

  //SocketIO functions #############
  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
      setJoinedRoom(true);
    }
  };

  const sendMessage = (pl, sq, rm) => {
    socket.emit("send_message", { rm: room, pl: player, sq: sq });
  };

  const sendID = (rm, id) => {
    socket.emit("send_id", { rm: room, id: gameID });
  };

  useEffect(() => {
    //Primljena poruka
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
    });

    //Primljena poruka cim je neko usao u sobu
    socket.on("user_joined", (data) => {
      setAnotherUserJoinerRoom(true);
    });

    //Primamo gameID kad se joinujemo u sobu
    socket.on("receive_id", (data) => {
      id = data.id;
      localStorage.setItem("gameID", id);
    });
  }, [socket]);

  //Saljemo ID onome ko je usao u sobu
  if (anotherUserJoinerRoom) sendID(room, gameID);

  //#########################

  //Tic-Tac-Toe Game Logic
  const chooseSquare = async (square) => {
    if (turn === player && board[square] === "") {
      setTurn(player === "X" ? "O" : "X");
      const signn = player;

      //##### ZA MULTIPLAYER
      //Za player2
      const myId = Number(localStorage.getItem("gameID"));

      //gledamo koji je igrac
      const playerr = user.username;

      //Slanje u bazu podataka
      await fetch(
        `http://localhost:5000/game/addMove/${
          gameID !== undefined ? gameID : myId
        }`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ player: playerr, move: square, sign: signn }),
        }
      );

      await sendMessage(player, square, room);
      //##################################################

      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        if (newBoard[square] === "") {
          newBoard[square] = player;
        }
        return newBoard;
      });
    }
  };

  const checkWin = async () => {
    Patterns.forEach(async (currPattern) => {
      const firstPlayer = board[currPattern[0]];
      if (firstPlayer === "") return;
      let foundWinningPattern = true;
      currPattern.forEach((i) => {
        if (board[i] !== firstPlayer) {
          foundWinningPattern = false;
        }
      });
      if (foundWinningPattern) {
        setFinished(true);
        setWinner(board[currPattern[0]]);

        //MULTIPLAYER
        const idStorage = Number(localStorage.getItem("gameID"));
        const myId = gameID !== undefined ? gameID : idStorage;
        await fetch(`http://localhost:5000/game/setWinner/${myId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ winner: board[currPattern[0]] }),
        });
      }
    });
  };

  const checkTie = async () => {
    let filled = true;
    board.forEach((square) => {
      if (square === "") {
        filled = false;
      }
    });
    if (filled) {
      setFinished(true);
      setWinner("tie");

      //MULTIPLAYER
      const idStorage = Number(localStorage.getItem("gameID"));
      const myId = gameID !== undefined ? gameID : idStorage;
      await fetch(`http://localhost:5000/game/setWinner/${myId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ winner: "tie" }),
      });
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

  const handleJoinGame = async () => {
    //Joinuje se u igru
    handleJoinRoom();

    const player = user.username;

    //Saljemo API zahtjev da bi se upisao u bazu podataka
    setTimeout(async () => {
      const myId = Number(localStorage.getItem("gameID"));
      const response = await fetch(
        `http://localhost:5000/game/addPlayer2/${myId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ player2: player }),
        }
      );
    }, 500);
  };

  const handleNewGame = async () => {
    setFinished(false);
    setPlayer("X");
    setTurn("X");
    setBoard(["", "", "", "", "", "", "", "", ""]);

    //MULTIPLAYER
    const typee = "multiplayer";
    const player = user.username;

    // Treba da se poziva svaki drugi put, odnosno da se red u bazi pravi samo kad prvi to poziva
    if (firstPlayer) {
      console.log("USO");
      const response = await fetch("http://localhost:5000/game/newGame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player1: player, type: typee }),
      });

      if (response.ok) {
        const data = await response.json();
        setGameID(data.id);
      }
    } else {
      //ZA PLAYERA KOJI JE DRUGI PRITISNUO New Game, odnosno onoga koji se tek joinovao
      const player = user.username;

      setTimeout(async () => {
        const myId = Number(localStorage.getItem("gameID"));
        const response = await fetch(
          `http://localhost:5000/game/addPlayer2/${myId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ player2: player }),
          }
        );
      }, 500);
    }
  };

  const renderMessage = () => {
    if (winner === "X") {
      return <p>Player 1 is the winner!</p>;
    } else if (winner === "O") {
      return <p>Player 2 is the winner!</p>;
    } else if (winner === "tie") {
      return <p>It's a tie!</p>;
    } else {
      return <p>The game is ongoing...</p>;
    }
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
            <button className="joingame-btn-join" onClick={handleJoinGame}>
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
                  if (!finished) {
                    e.preventDefault();
                    chooseSquare(0);
                  }
                }}
              />
              <Square
                val={board[1]}
                chooseSquare={(e) => {
                  if (!finished) {
                    e.preventDefault();
                    chooseSquare(1);
                  }
                }}
              />
              <Square
                val={board[2]}
                chooseSquare={(e) => {
                  if (!finished) {
                    e.preventDefault();
                    chooseSquare(2);
                  }
                }}
              />
            </div>
            <div className="row">
              <Square
                val={board[3]}
                chooseSquare={(e) => {
                  if (!finished) {
                    e.preventDefault();
                    chooseSquare(3);
                  }
                }}
              />
              <Square
                val={board[4]}
                chooseSquare={(e) => {
                  if (!finished) {
                    e.preventDefault();
                    chooseSquare(4);
                  }
                }}
              />
              <Square
                val={board[5]}
                chooseSquare={(e) => {
                  if (!finished) {
                    e.preventDefault();
                    chooseSquare(5);
                  }
                }}
              />
            </div>
            <div className="row">
              <Square
                val={board[6]}
                chooseSquare={(e) => {
                  if (!finished) {
                    e.preventDefault();
                    chooseSquare(6);
                  }
                }}
              />
              <Square
                val={board[7]}
                chooseSquare={(e) => {
                  if (!finished) {
                    e.preventDefault();
                    chooseSquare(7);
                  }
                }}
              />
              <Square
                val={board[8]}
                chooseSquare={(e) => {
                  if (!finished) {
                    e.preventDefault();
                    chooseSquare(8);
                  }
                }}
              />
            </div>
          </div>
          {finished ? (
            <>
              <h1>{renderMessage()}</h1>
              <button onClick={handleNewGame}>New Game</button>
            </>
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
}

export default JoinGame;
