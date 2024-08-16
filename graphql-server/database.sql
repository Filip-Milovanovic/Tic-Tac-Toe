CREATE DATABASE ttt3;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(15),
    password VARCHAR(500)
);