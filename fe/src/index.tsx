import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";

const rootElement = document.getElementById("root");

// Dodajemo proveru da li je rootElement definisan
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
