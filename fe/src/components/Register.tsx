import React, { useState } from "react";
import Axios from "axios";

const Register: React.FC = () => {
  // Stanja za registraciju
  const [usernameReg, setUsernameReg] = useState<string>("");
  const [passwordReg, setPasswordReg] = useState<string>("");

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await Axios.post("http://localhost:5000/register", {
        username: usernameReg,
        password: passwordReg,
      });
      console.log(response);
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
