import React from "react";
import Axios from "axios";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

function Login() {
  //Login states
  const [usernameLogin, setUsernameLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [user, setUser] = useState(null);

  const refreshToken = () => {
    try {
      Axios.post("http://localhost:5000/refresh/refresh", {
        token: user.refreshToken,
      }).then((response) => {
        setUser({
          ...user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        return response.data;
      });
    } catch (err) {
      console.log(err);
    }
  };

  //New axios instance when we log in
  const axiosJWT = Axios.create();

  //Automaticly refresh tokens
  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentData = new Date();
      const decodedToken = jwtDecode(user.accessToken);
      if (decodedToken.exp * 1000 < currentData.getTime()) {
        const data = refreshToken();
        config.headers["authorization"] = "Bearer" + data.accessToken;
      }
      return config;
    },
    (error) => {
      return;
    }
  );

  const login = async (e) => {
    e.preventDefault();
    await Axios.post("http://localhost:5000/refresh/login", {
      username: usernameLogin,
      password: passwordLogin,
    }).then((response) => {
      setUser(response.data);
      console.log(response.data);
    });
  };

  const logout = async (e) => {
    try {
      e.preventDefault();
      await axiosJWT
        .post(
          "http://localhost:5000/refresh/logout",
          { token: user.refreshToken },
          {
            headers: { authorization: "Bearer " + user.accessToken },
          }
        )
        .then((response) => {
          setUser(null);
        });
    } catch (err) {
      console.log(err);
    }
  };

  // TEST PURPOSES ####################
  const deleteUser = async (id) => {
    try {
      await axiosJWT.delete("http://localhost:5000/delete/register/" + id, {
        headers: { authorization: "Bearer " + user.accessToken },
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="login">
      <h1 className="login-heading">Login</h1>
      <div className="inputs--login">
        <input
          className="input-login"
          type="text"
          placeholder="Username..."
          onChange={(e) => {
            setUsernameLogin(e.target.value);
          }}
        />
        <input
          className="input-login"
          type="password"
          placeholder="Password..."
          onChange={(e) => {
            setPasswordLogin(e.target.value);
          }}
        />
      </div>
      <button className="btn--log_log" onClick={login}>
        Login
      </button>
      {/* TEST PURPOSES */}
      <button onClick={() => deleteUser(28)}>DELETE ME</button>
      {user ? (
        <button className="btn--log_log" onClick={logout}>
          LOGOUT
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Login;
