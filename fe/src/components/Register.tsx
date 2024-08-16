import React, { useState } from "react";
import Axios from "axios";

const Register: React.FC = () => {
  // Stanja za registraciju
  const [usernameReg, setUsernameReg] = useState<string>("");
  const [passwordReg, setPasswordReg] = useState<string>("");

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = `
      mutation addUser($user: AddUserInput!) {
        addUser(user: $user) {
          username
          password
        }
      }
  `;

    const variables = {
      user: {
        username: usernameReg,
        password: passwordReg,
      },
    };

    try {
      await Axios.post(
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
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="registration">
      <h1 className="registration-heading">Registration</h1>
      <form className="inputs--reg" onSubmit={register}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={usernameReg}
            onChange={(e) => setUsernameReg(e.target.value)}
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={passwordReg}
            onChange={(e) => setPasswordReg(e.target.value)}
          />
        </div>
        <button className="btn--reg_reg" type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
