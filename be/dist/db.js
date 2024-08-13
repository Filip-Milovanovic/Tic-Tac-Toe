"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// Definiši konfiguraciju za bazu podataka
const poolConfig = {
    user: "postgres",
    password: "123321",
    host: "localhost",
    port: 5432,
    database: "ttt2"
};
// Kreiraj instancu Pool-a sa konfiguracijom
const pool = new pg_1.Pool(poolConfig);
// Eksportuj pool kao default export
exports.default = pool;
