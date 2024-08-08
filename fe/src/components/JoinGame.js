import React, { useEffect, useState } from "react";
import Header from "./Header";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000");

function JoinGame() {
  //User information state
  const [user, setUser] = useState(null);

  //Multiplayer Game State
  const [multiplayer, setMultiplayer] = useState(false);

  //SocketIO Room States
  const [room, setRoom] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(false);

  //Message States
  const [message, setMessage] = useState("");
  const [messageRecieved, setMessageRecieved] = useState("");

  useEffect(() => {
    const userr = localStorage.getItem("user");

    if (userr) {
      const parsedData = JSON.parse(userr);
      setUser(parsedData);
      console.log("IZ JOINA", parsedData);
    }
  }, []);

  const handleCreateMultiplayer = () => {
    setMultiplayer(true);
  };

  //SocketIO functions #####
  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
      setJoinedRoom(true);
      console.log(room);
    }
  };

  const sendMessage = () => {
    socket.emit("send_message", { message, room });
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageRecieved(data.message);
    });
  }, [socket]);

  //#########################

  const handleJoinRoom = () => {
    setMultiplayer(true);
    joinRoom();
  };
  console.log(message);
  console.log(messageRecieved);

  return (
    <>
      <Header />
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
          <input
            placeholder="Message..."
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          <button onClick={sendMessage}>Send Message</button>
          {messageRecieved}
        </>
      )}
    </>
  );
}

export default JoinGame;
