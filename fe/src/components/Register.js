import React from "react";
import Axios from "axios";
import { useState } from "react";

function Register() {
  //Register states
  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");

  const register = () => {
    Axios.post("http://localhost:5000/register", {
      username: usernameReg,
      password: passwordReg,
    }).then((response) => {
      console.log(response);
    });
  };

  return (
    <div className="registration">
      <h1 className="registration-heading">Registration</h1>
      <div className="inputs--reg">
        <label>Username:</label>
        <input
          type="text"
          onChange={(e) => {
            setUsernameReg(e.target.value);
          }}
        />
      </div>
      <div className="inputs--reg">
        <label>Password: </label>
        <input
          type="password"
          onChange={(e) => {
            setPasswordReg(e.target.value);
          }}
        />
      </div>
      <button className="btn--reg_reg" onClick={register}>
        Register
      </button>
    </div>
  );
}

export default Register;
