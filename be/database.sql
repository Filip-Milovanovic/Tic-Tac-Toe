CREATE DATABASE ttt2;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(15),
    password VARCHAR(500)
);