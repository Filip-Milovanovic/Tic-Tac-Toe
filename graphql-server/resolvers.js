import pkg from "pg";
import jwt from "jsonwebtoken";
import axios from "axios";

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ttt2",
  password: "123321",
  port: 5432,
});

const Patterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

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
    addMove: async (_, { player, move, sign, id }) => {
      const column = sign === "X" ? "player1moves" : "player2moves";

      const result = await pool.query(
        `UPDATE game 
           SET ${column} = array_append(${column}, $1) 
           WHERE id = $2 
           RETURNING *`,
        [move, id]
      );

      return { player: result.rows[0].player1 };
    },
    cpuPlays: async (_, { id, gameFinished, square, board }) => {
      if (!gameFinished) {
        let randomNumber;

        do {
          randomNumber = Math.floor(Math.random() * 9);
        } while (board[randomNumber] !== "" || randomNumber === square);

        const cpu = "CPU";
        const signCpu = "O";

        //Dodajemo novi potez u bazu
        const query = `
      mutation makeMove($player: String!, $move: Int!, $id:ID!, $sign: String!){
        addMove(player:$player, sign:$sign, move:$move, id: $id ) {
          player
        }
      }
     `;

        const variables = {
          player: cpu,
          move: randomNumber,
          sign: signCpu,
          id: id,
        };

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

        return { move: randomNumber };
      }
    },
    addPlayer2: async (_, { id, player }) => {
      const result = await pool.query(
        "UPDATE game SET player2 = $1 WHERE id = $2 RETURNING *",
        [player, id]
      );

      return { playerJoined: true };
    },
    setWinner: async (_, { id, winner }) => {
      let w;
      if (winner !== "tie") {
        w = winner === "X" ? "Player 1" : "Player 2";
      } else {
        w = "tie";
      }

      const result = await pool.query(
        "UPDATE game SET winner = $1, finished = TRUE WHERE id = $2 RETURNING *",
        [w, id]
      );

      return { winner: w };
    },
    checkTie: async (_, { myId, multiplayer, board }) => {
      let finished = false,
        winner = "";
      let filled = true;
      board.forEach((square) => {
        if (square === "") {
          filled = false;
        }
      });
      if (filled) {
        finished = true;
        winner = "tie";

        if (multiplayer) {
          const query = `
            mutation setwinner($id: ID!, $winner: String!){
              setWinner(id: $id, winner: $winner) {
                winner
              }
            }
          `;

          const variables = {
            id: myId,
            winner: "tie",
          };

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
        } else {
          const query = `
          mutation setwinner($id: ID!, $winner: String!){
            setWinner(id: $id, winner: $winner) {
              winner
            }
          }
        `;

          const variables = {
            id: myId,
            winner: "tie",
          };

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
        }
      }
      return { finished: finished, winner: winner };
    },
    updateBoard: (_, { prevBoard, move, sign }) => {
      let board = [...prevBoard];
      board[move] = sign;
      return { newBoard: board };
    },
    checkWin: async (
      _,
      { updatedBoard, Patterns, multiplayer, singleplayer, myId }
    ) => {
      let finished = false,
        winner = "",
        gameFinished = false;

      for (const currPattern of Patterns) {
        const firstPlayer = updatedBoard[currPattern[0]];
        if (firstPlayer === "") continue;

        let foundWinningPattern = true;
        for (const i of currPattern) {
          if (updatedBoard[i] !== firstPlayer) {
            foundWinningPattern = false;
            break;
          }
        }

        if (foundWinningPattern) {
          finished = true;
          gameFinished = true;
          winner = updatedBoard[currPattern[0]];

          if (multiplayer) {
            const query = `
            mutation setWinner($id: ID!, $winner: String!){
              setWinner(id: $id, winner: $winner) {
                winner
              }
            }
          `;

            const variables = {
              id: myId,
              winner: winner,
            };

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
          } else if (singleplayer) {
            const query = `
              mutation setWinner($id: ID!, $winner: String!){
                setWinner(id: $id, winner: $winner) {
                  winner
                }
              }
            `;

            const variables = {
              id: myId,
              winner: winner,
            };

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
          }
        }
      }
      return { finished: finished, gameFinished: gameFinished, winner: winner };
    },
  },
};
