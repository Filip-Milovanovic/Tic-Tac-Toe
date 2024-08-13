import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Header() {
  let navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userr = localStorage.getItem("user");

    if (userr) {
      const parsedData = JSON.parse(userr);
      setUser(parsedData);
    }
  }, []);

  const reload = () => {
    window.location.reload();
  };

  const logout = async (e) => {
    try {
      e.preventDefault();
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
    } catch (err) {
      console.log(err);
    }
  };

  const deleteLoggedOutUser = async (id) => {
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
      <button className="navbar-button" onClick={reload}>
        CREATE NEW GAME
      </button>
    </nav>
  );
}

export default Header;
