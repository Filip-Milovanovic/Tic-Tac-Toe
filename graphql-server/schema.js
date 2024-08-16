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

  type Query{
    users: [User]
    user(id: ID!): User
    logUserOut(user: LogUserOutInput!): LogoutResponse
  }

  type Mutation {
    addUser(user: AddUserInput!): User
    logUser(user: LogUserInput!): LoginResponse
    createNewGame(player1: String!, type: String!): Game!
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
