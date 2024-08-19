import React, { useEffect, useState } from "react";
import Header from "./Header";
import io from "socket.io-client";
import Square from "./Square";
import { Patterns } from "../WinningPatterns";
import { sendCanPlayFun, sendMessage, updateBoardMP } from "utils/utils";

const socket = io("http://localhost:5000");

//Definicija tipova za state-ove i funkcije
interface User {
  username: string;
  id: number;
  accessToken: string;
  refreshToken: string;
}

type GameType = "multiplayer" | "singleplayer";

interface MessageData {
  rm: string;
  pl: string;
  sq: number;
  player: string;
}

interface IDData {
  id: number;
}

interface NewGameCreatedData {
  rm: string;
}

interface CanPlayData {
  rm: string;
}

function JoinGame() {
  //User information state
  const [user, setUser] = useState<User | null>(null);

  //Multiplayer Game State
  const [multiplayer, setMultiplayer] = useState<boolean>(false);

  //Singleplayer Game State
  const [singleplayer, setSingleplayer] = useState<boolean>(false);

  //SocketIO Room States
  const [room, setRoom] = useState<string>("");
  const [joinedRoom, setJoinedRoom] = useState<boolean>(false);
  const [anotherUserJoinerRoom, setAnotherUserJoinerRoom] =
    useState<boolean>(false);

  //Tic-Tac-Toe Game States
  const [board, setBoard] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [player, setPlayer] = useState<string>("X");
  const [turn, setTurn] = useState<string>("X");

  //Multiplayer states #####################
  const [firstPlayer, setFirstPlayer] = useState<boolean>(false); //Da se ne bi pravila 2 reda kad stisnemo new game na oba clienta
  const [newGameCreated, setNewGameCreated] = useState<boolean>(false); //Drugi igrac dobija poruku da je napravljen novi gejm
  const [canPlay, setCanPlay] = useState<boolean>(false); //Provjerava da li igrac ima pravo da igra, napravljeno da player2 ne bi mogao da ima prvi potez
  //########################################

  const [gameID, setGameID] = useState<number | undefined>(undefined);
  const [finished, setFinished] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>("X");
  const [gameStarted, setGameStarted] = useState<boolean>(true);

  let id: number | undefined,
    gameFinished: boolean = false,
    username: string;

  useEffect(() => {
    const userr = localStorage.getItem("user");

    if (userr) {
      const parsedData = JSON.parse(userr);
      setUser(parsedData);
      username = parsedData.username;
    }
  }, []);

  const handleCreateMultiplayer = async () => {
    setGameStarted(false);
    setMultiplayer(true);
    setFirstPlayer(true);
    setCanPlay(true);
    const player = user?.username ?? "";
    const typee: GameType = "multiplayer";

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

  const handleCreateSingleplayer = async () => {
    setSingleplayer(true);

    const player = user?.username ?? "";
    const typee: GameType = "singleplayer";

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

  useEffect(() => {
    //Primljena poruka
    socket.on("receive_message", (data: MessageData) => {
      const name = data.player;

      if (name !== username) {
        const currentPlayer = data.pl === "X" ? "O" : "X";

        setPlayer(currentPlayer);
        setTurn(currentPlayer);

        setBoard((prevBoard) => {
          const newBoard = [...prevBoard];
          if (newBoard[data.sq] === "") {
            newBoard[data.sq] = data.pl;
          }
          return newBoard;
        });
      }
    });

    //Primljena poruka cim je neko usao u sobu
    socket.on("user_joined", (data) => {
      setAnotherUserJoinerRoom(true);
      setGameStarted(true);
    });

    //Primamo gameID kad se joinujemo u sobu
    socket.on("receive_id", (data: IDData) => {
      id = data.id;
      localStorage.setItem("gameID", id.toString());
    });

    //Dobijamo informaciju kao drugi player da je napravljen novi gejm
    socket.on("receive_newgame_created", (data: NewGameCreatedData) => {
      setNewGameCreated(true);
    });

    socket.on("receive_canplay", (data) => {
      setCanPlay(true);
    });
  }, [socket]);

  //Saljemo ID onome ko je usao u sobu
  const SendId = async () => {
    const id = gameID ?? 0;
    if (anotherUserJoinerRoom) {
      const response = await fetch("http://localhost:5000/gameLogic/sendId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rm: room, id: id }),
      });
    }
  };

  SendId();

  //#########################

  //Tic-Tac-Toe Game Logic
  const chooseSquare = async (square: number) => {
    if (turn === player && board[square] === "" && gameStarted) {
      setTurn(player === "X" ? "O" : "X");
      const signn = player;

      //##### ZA MULTIPLAYER
      //Za player2
      const myId = Number(localStorage.getItem("gameID"));

      //gledamo koji je igrac
      const playerr = user?.username ?? "";

      //Slanje u bazu podataka
      await fetch(`http://localhost:5000/game/addMove/${gameID ?? myId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player: playerr, move: square, sign: signn }),
      });

      //Saljemo poruku drugom igracu sta smo odigrali
      await sendMessage(square, player, room, playerr);

      //##################################################

      setBoard(await updateBoardMP(board, square, player));

      //Dajemo dozvolu playeru 2 da igra
      sendCanPlayFun(room);
      // await fetch("http://localhost:5000/gameLogic/canPlay", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ rm: room }),
      // });
    }
  };

  const chooseSquareSingleplayer = async (square: number) => {
    if (turn === player && board[square] === "") {
      const signn = turn;

      setTurn(player === "X" ? "O" : "X");

      const playerr = user?.username ?? "";

      await fetch(`http://localhost:5000/game/addMove/${gameID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player: playerr, move: square, sign: signn }),
      });

      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        if (newBoard[square] === "") {
          newBoard[square] = player;
          checkWin(newBoard);
        }
        return newBoard;
      });

      setTimeout(() => {
        cpuPlays(square);
      }, 750);
    }
  };

  const cpuPlays = async (square: number) => {
    const response = await fetch(
      `http://localhost:5000/gameLogic/cpuPlays/${gameID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameFinished: gameFinished,
          square: square,
          board: board,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        if (newBoard[data.move] === "") {
          newBoard[data.move] = "O";
          checkWin(newBoard);
        }
        return newBoard;
      });
    }

    setTurn("X");
  };

  const checkWin = async (updatedBoard: string[]) => {
    const idStorage = Number(localStorage.getItem("gameID"));
    const myId = gameID !== undefined ? gameID : idStorage;

    const response = await fetch(`http://localhost:5000/gameLogic/checkWin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        updatedBoard: updatedBoard,
        multiplayer: multiplayer,
        singleplayer: singleplayer,
        Patterns: Patterns,
        myId: myId,
        gameID: myId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setFinished(data.finished);
      setWinner(data.winner);
      setNewGameCreated(false);
      gameFinished = data.gameFinished;
    }
  };

  const checkTie = async () => {
    const idStorage = Number(localStorage.getItem("gameID"));
    const myId = gameID !== undefined ? gameID : idStorage;

    const response = await fetch(`http://localhost:5000/gameLogic/checkTie`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board: board,
        multiplayer: multiplayer,
        gameID: myId,
        myId: myId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setFinished(data.finished);
      setWinner(data.winner);
      setNewGameCreated(false);
    }
  };

  useEffect(() => {
    checkWin(board);
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

    const player = user?.username ?? "";

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
    const player = user?.username ?? "";

    // Treba da se poziva svaki drugi put, odnosno da se red u bazi pravi samo kad prvi to poziva
    if (firstPlayer) {
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

      const res = await fetch(
        "http://localhost:5000/gameLogic/newGameCreated",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rm: room }),
        }
      );
    }
    if (newGameCreated) {
      //ZA PLAYERA KOJI JE DRUGI PRITISNUO New Game, odnosno onoga koji se tek joinovao
      const player = user?.username ?? "";

      //Da se ne bi cuvali stejtovi u novoj partiji
      setNewGameCreated(false);
      setCanPlay(false);

      setTimeout(async () => {
        const myId = Number(localStorage.getItem("gameID"));
        const res = await fetch(
          `http://localhost:5000/game/addPlayer2/${myId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ player2: player }),
          }
        );
      }, 1000);
    }
  };

  const handleNewGameSingleplayer = async () => {
    gameFinished = false;
    setFinished(false);
    setPlayer("X");
    setTurn("X");
    setBoard(["", "", "", "", "", "", "", "", ""]);

    const player = user?.username ?? "";
    const typee = "singleplayer";

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
      {!multiplayer && !singleplayer && (
        <div className="joingame-container">
          <button className="joingame-btn" onClick={handleCreateMultiplayer}>
            Create new multiplayer game
          </button>
          <button className="joingame-btn" onClick={handleCreateSingleplayer}>
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
            className="create-room-input"
            placeholder="Enter room number"
            onChange={(e) => {
              setRoom(e.target.value);
            }}
          />
          <button className="create-room-btn" onClick={joinRoom}>
            Join Room
          </button>
        </>
      )}
      {/* If multiplayer is true, and user is in a room */}
      {multiplayer && joinedRoom && (
        <>
          {!gameStarted && (
            <>
              <p className="toast-msg">Waiting for other player to join...</p>
              <span className="loader"></span>
            </>
          )}
          <div className="board">
            {[0, 1, 2].map((rowIndex) => (
              <div className="row" key={rowIndex}>
                {[0, 1, 2].map((colIndex) => {
                  const squareIndex = rowIndex * 3 + colIndex;
                  return (
                    <Square
                      key={squareIndex}
                      val={board[squareIndex]}
                      chooseSquare={() => {
                        if (!finished && canPlay) {
                          chooseSquare(squareIndex);
                        }
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {finished && (
            <div className="finished-game-div">
              <h1 className="finish-message">{renderMessage()}</h1>
              {firstPlayer && (
                <button className="new-game-btn" onClick={handleNewGame}>
                  New Game
                </button>
              )}
            </div>
          )}

          {finished && newGameCreated ? (
            <button onClick={handleNewGame}>New Game</button>
          ) : (
            ""
          )}
        </>
      )}
      {singleplayer && (
        <>
          <div className="board">
            {[0, 1, 2].map((rowIndex) => (
              <div className="row" key={rowIndex}>
                {[0, 1, 2].map((colIndex) => {
                  const squareIndex = rowIndex * 3 + colIndex;
                  return (
                    <Square
                      key={squareIndex}
                      val={board[squareIndex]}
                      chooseSquare={() => {
                        if (!finished) {
                          chooseSquareSingleplayer(squareIndex);
                        }
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          {finished && (
            <div className="finished-game-div">
              <h1 className="finish-message">{renderMessage()}</h1>
              <button
                className="new-game-btn"
                onClick={handleNewGameSingleplayer}
              >
                New Game
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default JoinGame;
