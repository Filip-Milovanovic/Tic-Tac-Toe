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


  const logout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      if (user) {
        await axios
          .post(
            "http://localhost:5000/refresh/logout",
            { token: user.refreshToken },
            {
              headers: { authorization: "Bearer " + user.accessToken },
            }
          )
          .then((response) => {
            if (response.data.loggedOut) {
              deleteLoggedOutUser(user.id);
              setUser(null);
              navigate("/login");
            }
          });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteLoggedOutUser = async (id: string) => {
    try {
      await fetch("http://localhost:5000/delete/login/" + id, {
        method: "DELETE",
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="navbar">
      <button className="navbar-button" onClick={logout}>
        LOG OUT
      </button>
    </nav>
  );
};

export default Header;
