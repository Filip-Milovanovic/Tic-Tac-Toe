import React, { useEffect, useState } from "react";
import Header from "./Header";
import io from "socket.io-client";
import Square from "./Square";
import { Patterns } from "../WinningPatterns";

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

  let id: number | undefined,
    gameFinished: boolean = false;

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
      console.log(data.id);
    }
  };

  //SocketIO functions #############
  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
      setJoinedRoom(true);
    }
  };

  const sendMessage = (pl: string, sq: number, rm: string) => {
    socket.emit("send_message", {
      rm: room,
      pl: player,
      sq: sq,
    } as MessageData);
  };

  const sendID = (rm: string, id: number) => {
    socket.emit("send_id", { rm: room, id: gameID } as IDData);
  };

  const sendNewGameCreated = (rm: string) => {
    socket.emit("send_newgame_created", { rm: room } as NewGameCreatedData);
  };

  const sendCanPlay = (rm: string) => {
    socket.emit("send_canplay", { rm: room } as CanPlayData);
  };

  useEffect(() => {
    //Primljena poruka
    socket.on("receive_message", (data: MessageData) => {
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
  if (anotherUserJoinerRoom) sendID(room, gameID ?? 0);

  //#########################

  //Tic-Tac-Toe Game Logic
  const chooseSquare = async (square: number) => {
    if (turn === player && board[square] === "") {
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

      await sendMessage(player, square, room);
      //##################################################

      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        if (newBoard[square] === "") {
          newBoard[square] = player;
        }
        return newBoard;
      });

      //Dajemo dozvolu playeru 2 da igra
      sendCanPlay(room);
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
    //Random broj izmedju 0 i 8
    if (gameFinished) return;
    console.log(finished);

    let randomNumber: number;
    console.log(board);

    do {
      randomNumber = Math.floor(Math.random() * 9);
    } while (board[randomNumber] !== "" || randomNumber === square);

    console.log("Uslo", randomNumber);

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

    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      if (newBoard[randomNumber] === "") {
        newBoard[randomNumber] = "O";
        checkWin(newBoard);
      }
      return newBoard;
    });

    setTurn("X");
  };

  const checkWin = async (updatedBoard: string[]) => {
    for (const currPattern of Patterns) {
      const firstPlayer = updatedBoard[currPattern[0]];
      if (firstPlayer === "") continue;

      let foundWinningPattern = true;
      for (const i of currPattern) {
        if (updatedBoard[i] !== firstPlayer) {
          foundWinningPattern = false;
          break;
        }
      }

      if (foundWinningPattern) {
        setFinished(true);
        setWinner(updatedBoard[currPattern[0]]);
        gameFinished = true;

        if (multiplayer) {
          const idStorage = Number(localStorage.getItem("gameID"));
          const myId = gameID !== undefined ? gameID : idStorage;
          await fetch(`http://localhost:5000/game/setWinner/${myId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ winner: updatedBoard[currPattern[0]] }),
          });
        } else if (singleplayer) {
          await fetch(`http://localhost:5000/game/setWinner/${gameID}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ winner: updatedBoard[currPattern[0]] }),
          });
        }

        return;
      }
    }
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
      if (multiplayer) {
        const idStorage = Number(localStorage.getItem("gameID"));
        const myId = gameID !== undefined ? gameID : idStorage;
        await fetch(`http://localhost:5000/game/setWinner/${myId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ winner: "tie" }),
        });
      } else {
        await fetch(`http://localhost:5000/game/setWinner/${gameID}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ winner: "tie" }),
        });
      }
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
      await fetch(`http://localhost:5000/game/addPlayer2/${myId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player2: player }),
      });
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
      sendNewGameCreated(room);
    }
    if (newGameCreated) {
      //ZA PLAYERA KOJI JE DRUGI PRITISNUO New Game, odnosno onoga koji se tek joinovao
      const player = user?.username ?? "";

      //Da se ne bi cuvali stejtovi u novoj partiji
      setNewGameCreated(false);
      setCanPlay(false);

      setTimeout(async () => {
        const myId = Number(localStorage.getItem("gameID"));
        await fetch(`http://localhost:5000/game/addPlayer2/${myId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ player2: player }),
        });
      }, 500);
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
      console.log(data.id);
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
          <div className="board">
            <div className="row">
              <Square
                val={board[0]}
                chooseSquare={() => {
                  if (!finished && canPlay) {
                    chooseSquare(0);
                  }
                }}
              />
              <Square
                val={board[1]}
                chooseSquare={() => {
                  if (!finished && canPlay) {
                    chooseSquare(1);
                  }
                }}
              />
              <Square
                val={board[2]}
                chooseSquare={() => {
                  if (!finished && canPlay) {
                    chooseSquare(2);
                  }
                }}
              />
            </div>
            <div className="row">
              <Square
                val={board[3]}
                chooseSquare={() => {
                  if (!finished && canPlay) {
                    chooseSquare(3);
                  }
                }}
              />
              <Square
                val={board[4]}
                chooseSquare={() => {
                  if (!finished && canPlay) {
                    chooseSquare(4);
                  }
                }}
              />
              <Square
                val={board[5]}
                chooseSquare={() => {
                  if (!finished && canPlay) {
                    chooseSquare(5);
                  }
                }}
              />
            </div>
            <div className="row">
              <Square
                val={board[6]}
                chooseSquare={() => {
                  if (!finished && canPlay) {
                    chooseSquare(6);
                  }
                }}
              />
              <Square
                val={board[7]}
                chooseSquare={() => {
                  if (!finished && canPlay) {
                    chooseSquare(7);
                  }
                }}
              />
              <Square
                val={board[8]}
                chooseSquare={() => {
                  if (!finished && canPlay) {
                    chooseSquare(8);
                  }
                }}
              />
            </div>
          </div>
          {finished ? <h1>{renderMessage()}</h1> : ""}
          {finished && firstPlayer ? (
            <button onClick={handleNewGame}>New Game</button>
          ) : (
            ""
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
            <div className="row">
              <Square
                val={board[0]}
                chooseSquare={() => {
                  if (!finished) {
                    chooseSquareSingleplayer(0);
                  }
                }}
              />
              <Square
                val={board[1]}
                chooseSquare={() => {
                  if (!finished) {
                    chooseSquareSingleplayer(1);
                  }
                }}
              />
              <Square
                val={board[2]}
                chooseSquare={() => {
                  if (!finished) {
                    chooseSquareSingleplayer(2);
                  }
                }}
              />
            </div>
            <div className="row">
              <Square
                val={board[3]}
                chooseSquare={() => {
                  if (!finished) {
                    chooseSquareSingleplayer(3);
                  }
                }}
              />
              <Square
                val={board[4]}
                chooseSquare={() => {
                  if (!finished) {
                    chooseSquareSingleplayer(4);
                  }
                }}
              />
              <Square
                val={board[5]}
                chooseSquare={() => {
                  if (!finished) {
                    chooseSquareSingleplayer(5);
                  }
                }}
              />
            </div>
            <div className="row">
              <Square
                val={board[6]}
                chooseSquare={() => {
                  if (!finished) {
                    chooseSquareSingleplayer(6);
                  }
                }}
              />
              <Square
                val={board[7]}
                chooseSquare={() => {
                  if (!finished) {
                    chooseSquareSingleplayer(7);
                  }
                }}
              />
              <Square
                val={board[8]}
                chooseSquare={() => {
                  if (!finished) {
                    chooseSquareSingleplayer(8);
                  }
                }}
              />
            </div>
          </div>
          {finished && (
            <>
              <h1>{renderMessage()}</h1>
              <button onClick={handleNewGameSingleplayer}>New Game</button>
            </>
          )}
        </>
      )}
    </>
  );
}

export default JoinGame;
