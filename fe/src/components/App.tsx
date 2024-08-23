import React from "react";
import "../App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import JoinGamePage from "../pages/JoinGamePage";
import GameHistoryPage from "../pages/GameHistoryPage";

const App: React.FC = () => {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/joingame" element={<JoinGamePage />} />
          <Route path="/gameHistory" element={<GameHistoryPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
