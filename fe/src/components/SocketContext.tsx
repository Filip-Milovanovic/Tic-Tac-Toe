// SocketContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import io, { Socket } from "socket.io-client";

// Kreirajte context
const SocketContext = createContext<Socket | undefined>(undefined);

// Kreirajte provider komponentu
export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Kreirajte socket instancu
  const socket = io("http://localhost:5000");

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

// Kreirajte custom hook za korišćenje socketa
export const useSocket = (): Socket => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};
