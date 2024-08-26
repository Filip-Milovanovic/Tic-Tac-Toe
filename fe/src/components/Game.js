import React, { useEffect, useState } from "react";
import Square from "./Square";
import { useSocket } from "./SocketContext";
import { sendMessage, updateBoardMP, sendCanPlayFun } from "utils/utils";
import { Patterns } from "../WinningPatterns";

const Game = () => {
  let gameFinished = false;
  //Socket
  const socket = useSocket();
  //Game States
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [player, setPlayer] = useState("X");
  const [turn, setTurn] = useState("X");
  const [finished, setFinished] = useState(false);
  const [winner, setWinner] = useState("X");
  const [firstPlayer, setFirstPlayer] = useState(false);
  const [newGameCreated, setNewGameCreated] = useState(false);
  const [type, setType] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  const getRoom = () => {
    const room = localStorage.getItem("room");
    return room;
  };

  const getUsername = () => {
    const user = localStorage.getItem("user");
    const parsedData = JSON.parse(user);
    const player = parsedData.username;
    return player;
  };

  //UseEffect koji se poziva samo pri prvom renderu
  useEffect(() => {
    const storedValue = localStorage.getItem("firstPlayer");
    const booleanValue = JSON.parse(storedValue);
    setFirstPlayer(booleanValue);
    const type = localStorage.getItem("type");
    setType(type);

    //GameStarted
    const storedGameStarted = localStorage.getItem("gameStarted");
    const gameStartedVal = JSON.parse(storedGameStarted);
    setGameStarted(gameStartedVal);

    //CanPlay
    const storedCanPlay = localStorage.getItem("canPlay");
    const canPlayVal = JSON.parse(storedCanPlay);
    setCanPlay(canPlayVal);
  }, []);

  //SOCKET IO RECIEVERS
  useEffect(() => {
    socket.on("receive_message", (data) => {
      const name = data.player;
      const username = getUsername();

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

    socket.on("receive_id", (data) => {
      localStorage.setItem("id", data.id);
    });

    socket.on("receive_canplay", (data) => {
      setCanPlay(true);
    });

    socket.on("receive_newgame_created", (data) => {
      setNewGameCreated(true);
    });

    socket.on("receive_gamestarted", async (data) => {
      setGameStarted(true);
      localStorage.removeItem("gameStarted");
    });
  }, [socket]);

  const chooseSquare = async (square) => {
    if (turn === player && board[square] === "") {
      setTurn(player === "X" ? "O" : "X");
      const signn = player;

      //id igre
      const id = Number(localStorage.getItem("id"));

      //gledamo koji je igrac
      const playerr = getUsername();

      //room
      const room = localStorage.getItem("room");

      //Slanje u bazu podataka
      await fetch(`http://localhost:5000/game/addMove/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player: playerr, move: square, sign: signn }),
      });

      //Saljemo poruku drugom igracu sta smo odigrali
      await sendMessage(square, player, room, playerr);

      //Azuriramo board
      setBoard(await updateBoardMP(board, square, player));

      sendCanPlayFun(room);
    }
  };

  // Singleplayer game logika
  const chooseSquareSingleplayer = async (square) => {
    if (turn === player && board[square] === "") {
      const signn = turn;

      setTurn(player === "X" ? "O" : "X");

      const playerr = getUsername();

      //id
      const id = Number(localStorage.getItem("id"));

      await fetch(`http://localhost:5000/game/addMove/${id}`, {
        method: "POST",
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

      if (!gameFinished) {
        setTimeout(() => {
          cpuPlays(square);
        }, 750);
      }
    }
  };

  const cpuPlays = async (square) => {
    //id
    const id = Number(localStorage.getItem("id"));

    const response = await fetch(
      `http://localhost:5000/gameLogic/cpuPlays/${id}`,
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

  //Check win i check tie
  const checkWin = async (updatedBoard) => {
    //id
    const id = Number(localStorage.getItem("id"));
    //tip
    const type = localStorage.getItem("type");
    //tipovi
    let multiplayer, singleplayer;

    //setovanje tipova
    if (type === "multiplayer") {
      multiplayer = true;
      singleplayer = false;
    } else if (type === "singleplayer") {
      multiplayer = false;
      singleplayer = true;
    }

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
        myId: id,
        gameID: id,
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
    //id
    const id = Number(localStorage.getItem("id"));

    //tip
    const type = localStorage.getItem("type");

    //setovanje tipa
    const multiplayer = type === "multiplayer" ? true : false;

    const response = await fetch(`http://localhost:5000/gameLogic/checkTie`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board: board,
        multiplayer: multiplayer,
        gameID: id,
        myId: id,
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

  useEffect(() => {
    checkWin(board);
    checkTie();
  }, [board]);

  //Render finish message
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

  //Send ID
  const sendID = async () => {
    const id = localStorage.getItem("id");
    const room = localStorage.getItem("room");

    await fetch("http://localhost:5000/gameLogic/sendId", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rm: room, id: id }),
    });
  };

  //New game buttons logika
  const handleNewGame = async () => {
    setFinished(false);
    setPlayer("X");
    setTurn("X");
    setBoard(["", "", "", "", "", "", "", "", ""]);

    //MULTIPLAYER
    const typee = "multiplayer";
    const player = getUsername();

    //Room
    const room = localStorage.getItem("room");

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
        localStorage.setItem("id", data.id);
        await sendID();
      }

      await fetch("http://localhost:5000/gameLogic/newGameCreated", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rm: room }),
      });
    }
    if (newGameCreated) {
      //ZA PLAYERA KOJI JE DRUGI PRITISNUO New Game, odnosno onoga koji se tek joinovao
      const player = getUsername();
      setGameStarted(true);
      setCanPlay(false);

      await fetch("http://localhost:5000/gameLogic/gameStarted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rm: room, gameStarted: true }),
      });

      //Da se ne bi cuvali stejtovi u novoj partiji
      setNewGameCreated(false);

      setTimeout(async () => {
        const id = Number(localStorage.getItem("id"));
        await fetch(`http://localhost:5000/game/addPlayer2/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ player2: player }),
        });
      }, 1000);
    }
  };

  const handleNewGameSingleplayer = async () => {
    gameFinished = false;
    setFinished(false);
    setPlayer("X");
    setTurn("X");
    setBoard(["", "", "", "", "", "", "", "", ""]);

    const player = getUsername();
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
      localStorage.setItem("id", data.id);
    }
  };

  const getType = () => {
    return localStorage.getItem("type");
  };

  return (
    <>
      <h3 className="game--hd">Game ID: {getRoom()}</h3>
      {!gameStarted && <RenderSpinner type={type} />}
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
                      const type = localStorage.getItem("type");
                      if (type === "multiplayer" && gameStarted && canPlay)
                        chooseSquare(squareIndex);
                      else if (type === "singleplayer")
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
          {firstPlayer && (
            <button
              className="new-game-btn"
              onClick={
                type === "multiplayer"
                  ? handleNewGame
                  : handleNewGameSingleplayer
              }
            >
              New Game
            </button>
          )}
        </div>
      )}

      {finished && newGameCreated ? (
        <button className="new-game-btn" onClick={handleNewGame}>
          New Game
        </button>
      ) : (
        ""
      )}
    </>
  );
};

const RenderSpinner = ({ type }) => {
  if (type === "multiplayer") {
    return (
      <>
        <p className="toast-msg">Waiting for other player to join...</p>
        <span className="loader"></span>
      </>
    );
  } else return "";
};

export default Game;
