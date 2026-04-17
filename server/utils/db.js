const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("PostgreSQL connection error:", err.message);
  process.exit(-1);
});

module.exports = pool;