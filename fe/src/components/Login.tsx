import React, { useState } from "react";
import Axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

// Definišemo tip za korisnika
interface User {
  accessToken: string;
  refreshToken: string;
}

// Tipiziramo deo stanja koji se koristi za prijavu
const Login: React.FC = () => {
  let navigate = useNavigate();

  // Stanja za prijavu
  const [usernameLogin, setUsernameLogin] = useState<string>("");
  const [passwordLogin, setPasswordLogin] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const refreshToken = async () => {
    try {
      const response = await Axios.post(
        "http://localhost:5000/refresh/refresh",
        {
          token: user?.refreshToken,
        }
      );
      setUser({
        ...user!,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
      return response.data;
    } catch (err) {
      console.log(err);
    }
  };

  // Nova instanca axios-a pri prijavi
  const axiosJWT = Axios.create();

  // Automatsko osvežavanje tokena
  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentData = new Date();
      const decodedToken: any = jwtDecode(user?.accessToken || "");
      if (decodedToken.exp * 1000 < currentData.getTime()) {
        const data = await refreshToken();
        if (data) {
          config.headers["authorization"] = "Bearer " + data.accessToken;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = `
    mutation LogUser($user: LogUserInput!) {
      logUser(user: $user) {
        id
        username
        accessToken
        refreshToken
      }
    }
  `;

    const variables = {
      user: {
        username: usernameLogin,
        password: passwordLogin,
      },
    };

    try {
      const response = await Axios.post(
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
      console.log(response);
      if (response.data.data.logUser.username !== "") {
        setUser(response.data.data.logUser);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.data.logUser)
        );
        navigate("/joingame");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="login">
      <h1 className="login-heading">Login</h1>
      <form className="inputs--login" onSubmit={login}>
        <input
          className="input-login"
          type="text"
          placeholder="Username..."
          value={usernameLogin}
          onChange={(e) => setUsernameLogin(e.target.value)}
        />
        <input
          className="input-login"
          type="password"
          placeholder="Password..."
          value={passwordLogin}
          onChange={(e) => setPasswordLogin(e.target.value)}
        />
        <button className="btn--log_log" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
