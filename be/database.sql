CREATE DATABASE ttt2;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(15),
    password VARCHAR(500)
);

CREATE TABLE loggedUsers(
    id INTEGER PRIMARY KEY,
    username VARCHAR(15)
);

CREATE TABLE game(
    id SERIAL PRIMARY KEY,
    player1 VARCHAR(50),
    player2 VARCHAR(50) DEFAULT NULL,
    player1Moves INTEGER[] DEFAULT '{}',
    player2Moves INTEGER[] DEFAULT '{}',
    type VARCHAR(50),
    winner VARCHAR(50) DEFAULT NULL,
    finished BOOLEAN DEFAULT FALSE
);