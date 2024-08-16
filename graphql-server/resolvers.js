import pkg from "pg";
import jwt from "jsonwebtoken";

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ttt2",
  password: "123321",
  port: 5432,
});

const generateAccessToken = (user = { id }) => {
  return jwt.sign({ id: user.id }, "secret key", {
    expiresIn: "3000m",
  });
};

const generateRefreshToken = (user = { id }) => {
  return jwt.sign({ id: user.id }, "refresh secret key", {
    expiresIn: "3000m",
  });
};

const refreshTokens = [];

export const resolvers = {
  Query: {
    users: async () => {
      const users = await pool.query("SELECT * FROM users;");
      console.log(users.rows[0]);
      return users.rows;
    },
    logUserOut(_, { user }) {
      return { loggedOut: true };
    },
  },

  Mutation: {
    addUser: async (_, { user }) => {
      const sameNameUser = await pool.query(
        "SELECT * FROM users WHERE username=$1",
        [user.username]
      );

      if (sameNameUser.rows.length === 0) {
        const result = await pool.query(
          "INSERT INTO users (username, password) VALUES($1, $2) RETURNING *",
          [user.username, user.password]
        );
        return result.rows[0];
      }
    },
    logUser: async (_, { user }) => {
      const { username, password } = user;

      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1 AND password = $2",
        [username, password]
      );

      const userr = result.rows[0];
      if (userr) {
        const accessToken = generateAccessToken({ id: userr.id });
        const refreshToken = generateRefreshToken({ id: userr.id });

        refreshTokens.push(refreshToken);

        return {
          id: userr.id,
          username: username,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      }
    },
    createNewGame: async (_, { player1, type }) => {
      let result;
      if (type === "multiplayer") {
        result = await pool.query(
          "INSERT INTO game (player1, type) VALUES ($1, $2) RETURNING *",
          [player1, type]
        );
      } else {
        result = await pool.query(
          "INSERT INTO game (player1, player2, type) VALUES ($1, $2, $3) RETURNING *",
          [player1, "CPU", type]
        );
      }
      return result.rows[0];
    },
  },
};
