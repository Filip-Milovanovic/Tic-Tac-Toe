import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <h1 className="home-heading">Tic-Tac-Toe Multiplayer</h1>
      <a href="/register">
        <button className="btn-home btn--reg_home">REGISTER</button>
      </a>
      <a href="/login">
        <button className="btn-home btn--log_home">LOGIN</button>
      </a>
    </div>
  );
};

export default HomePage;
