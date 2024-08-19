export const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    password: String!
  }

  type Game {
    id: ID!
    player1: String!
    player2: String
    player1Moves: [Int]
    player2Moves: [Int]
    type: String!
    winner: String
    finished: Boolean!
  }

  type LoginResponse {
    id: ID!
    username: String!
    accessToken: String
    refreshToken: String
  }

  type LogoutResponse{
    loggedOut: Boolean!
  }

  type AddMoveResponse {
    player: String!
  }

  type CpuPlaysResponse{
    move: Int!
  }

  type AddPlayer2Response{
    playerJoined: Boolean!
  }

  type SetWinnerResponse{
    winner: String!
  }

  type CheckTieResponse{
    finished: Boolean!
    winner: String!
  }

  type UpdateBoardResponse{
    newBoard: [String!]!
  }

  type CheckWinResponse{
    finished: Boolean!
    gameFinished: Boolean!
    winner: String!
  }

  type Query{
    users: [User]
    user(id: ID!): User
    logUserOut(user: LogUserOutInput!): LogoutResponse
  }

  type Mutation {
    addUser(user: AddUserInput!): User
    logUser(user: LogUserInput!): LoginResponse
    createNewGame(player1: String!, type: String!): Game!
    addMove(id: ID!, player: String!, move: Int!, sign: String!): AddMoveResponse!
    cpuPlays(id:ID!, gameFinished: Boolean!, square: Int!, board:[String!]!): CpuPlaysResponse!
    addPlayer2(id:ID!, player:String!): AddPlayer2Response!
    setWinner(id:ID!, winner: String!): SetWinnerResponse!
    checkTie(board:[String!]!, multiplayer:Boolean!, myId:ID!): CheckTieResponse!
    updateBoard(prevBoard:[String!]!, move: Int!, sign: String!): UpdateBoardResponse!
    checkWin(updatedBoard:[String!]!, Patterns:[[Int!]!]!, multiplayer:Boolean!, singleplayer:Boolean!,myId:ID!): CheckWinResponse!
    }

  input AddUserInput{
    username: String!
    password: String!
  }

  input LogUserInput{
    username: String!
    password: String!
  }

  input LogUserOutInput{
    refreshToken: String!
  }
`;
