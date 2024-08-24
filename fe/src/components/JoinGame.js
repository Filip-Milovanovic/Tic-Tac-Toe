import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

function JoinGame() {
  //Socket
  const socket = useSocket();
  // States
  const [room, setRoom] = useState(
    (Math.floor(Math.random() * 1000) + 1).toString()
  );

  let navigate = useNavigate();

  const handleCreateMultiplayer = async () => {
    localStorage.setItem("type", "multiplayer");
    localStorage.setItem("firstPlayer", JSON.stringify(true));
    localStorage.setItem("canPlay", JSON.stringify(true));

    // Getting user data from local storage
    const user = localStorage.getItem("user");
    const parsedData = JSON.parse(user);

    const response = await fetch("http://localhost:5000/game/newGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player1: parsedData.username,
        type: "multiplayer",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("id", data.id);
    }

    joinRoom();
    navigate("/game");
  };

  const handleJoinMultiplayer = async () => {
    localStorage.setItem("type", "multiplayer");
    localStorage.setItem("firstPlayer", JSON.stringify(false));
    joinRoom();

    //Saljemo da je pocela igra
    await fetch("http://localhost:5000/gameLogic/gameStarted", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rm: room, gameStarted: true }),
    });

    let id;

    setTimeout(async () => {
      id = Number(localStorage.getItem("id"));

      const user = localStorage.getItem("user");
      const parsedData = JSON.parse(user);
      const player = parsedData.username;

      await fetch(`http://localhost:5000/game/addPlayer2/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player2: player }),
      });

      navigate("/game");
    }, 1000);
  };

  const handleCreateSingleplayer = async () => {
    localStorage.setItem("type", "singleplayer");

    const user = localStorage.getItem("user");
    const parsedData = JSON.parse(user);
    const player = parsedData.username;

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

    navigate("/game");
  };

  const handleGameHistory = () => {
    navigate("/gameHistory");
  };

  // SOCKET IO FUNCTION
  const joinRoom = () => {
    localStorage.setItem("room", room);
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  const sendID = async () => {
    const id = localStorage.getItem("id");

    await fetch("http://localhost:5000/gameLogic/sendId", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rm: room, id: id }),
    });
  };

  // SOCKET IO RECIEVE
  useEffect(() => {
    socket.on("user_joined", async (data) => {
      try {
        await sendID();
      } catch (err) {
        console.log(err.message);
      }
    });

    socket.on("receive_id", (data) => {
      localStorage.setItem("id", data.id);
    });

    socket.on("receive_gamestarted", (data) => {
      localStorage.setItem("gameStarted", JSON.stringify(data.gameStarted));
    });
  }, [socket]);

  return (
    <>
      <Header />
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
            onChange={(e) => {
              setRoom(e.target.value);
            }}
          />
          <button onClick={handleJoinMultiplayer} className="joingame-btn-join">
            Join
          </button>
        </div>
        <button onClick={handleGameHistory} className="joingame-btn --hist">
          Get history of your games
        </button>
      </div>
    </>
  );
}

export default JoinGame;
