import React from "react";
import "../App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import JoinGamePage from "../pages/JoinGamePage";

const App: React.FC = () => {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/joingame" element={<JoinGamePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
