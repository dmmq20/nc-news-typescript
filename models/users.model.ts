import { User } from "../types";

const db = require("../db/connection");

function selectAllUsers() {
  return db
    .query(`SELECT * FROM users;`)
    .then(({ rows }: { rows: User[] }) => rows);
}

function selectUserByUsername(username: string) {
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [username])
    .then(({ rows }: { rows: User[] }) => rows[0]);
}

module.exports = { selectAllUsers, selectUserByUsername };
