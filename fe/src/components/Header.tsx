import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Definišemo tip za korisnika
interface User {
  id: string;
  accessToken: string;
  refreshToken: string;
}

const Header: React.FC = () => {
  let navigate = useNavigate();

  // Definišemo stanje korisnika kao User ili null
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userr = localStorage.getItem("user");

    if (userr) {
      const parsedData = JSON.parse(userr) as User;
      setUser(parsedData);
    }
  }, []);

  const reload = () => {
    window.location.reload();
  };

  const logout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const query = `
      query GetUserLogoutStatus($user: LogUserOutInput!) {
        logUserOut(user: $user) {
          loggedOut
        }
      }`;

    const variables = {
      user: {
        refreshToken: user?.refreshToken,
      },
    };

    try {
      e.preventDefault();
      if (user) {
        const response = await axios.post(
          "http://localhost:4000",
          {
            query: query,
            variables: variables,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);

        if (response.data.data.logUserOut.loggedOut) {
          setUser(null);
          navigate("/login");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="navbar">
      <button className="navbar-button" onClick={logout}>
        LOG OUT
      </button>
      <button className="navbar-button" onClick={reload}>
        CREATE NEW GAME
      </button>
    </nav>
  );
};

export default Header;
