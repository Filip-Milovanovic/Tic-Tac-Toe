import React, { useEffect, useState } from "react";
import Header from "./Header";

function JoinGame() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userr = localStorage.getItem("user");

    if (userr) {
      const parsedData = JSON.parse(userr);
      setUser(parsedData);
      console.log("IZ JOINA", parsedData);
    }
  }, []);

  return (
    <>
      <Header />
      <div className="joingame-container">
        <button className="joingame-btn">Create new multiplayer game</button>
        <button className="joingame-btn">Create new single player game</button>
        <div className="joingame-label-div">
          <label>Join multiplayer game by ID</label>
          <input type="text" />
          <button className="joingame-btn-join">Join</button>
        </div>
      </div>
    </>
  );
}

export default JoinGame;
