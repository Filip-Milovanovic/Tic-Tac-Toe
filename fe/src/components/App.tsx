import React from "react";
import "../App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./SocketContext";

// Pages
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import JoinGamePage from "../pages/JoinGamePage";
import GameHistoryPage from "../pages/GameHistoryPage";
import GamePage from "../pages/GamePage";

const App: React.FC = () => {
  return (
    <div className="container">
      <BrowserRouter>
        <SocketProvider>
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/joingame" element={<JoinGamePage />} />
            <Route path="/gameHistory" element={<GameHistoryPage />} />
            <Route path="/game" element={<GamePage />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;
