import { Pool } from 'pg';

// Definiši konfiguraciju za bazu podataka
const poolConfig = {
    user: "postgres",
    password: "123321",
    host: "db",
    port: 5432,
    database: "tictactoe"
};

// Kreiraj instancu Pool-a sa konfiguracijom
const pool = new Pool(poolConfig);

// Eksportuj pool kao default export
export default pool;
