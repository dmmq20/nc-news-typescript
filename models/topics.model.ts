import { Topic } from "../types";

const db = require("../db/connection");

function selectTopics() {
  return db
    .query(`SELECT * FROM topics;`)
    .then(({ rows }: { rows: Topic[] }) => rows);
}

function insertTopic(slug: string, description: string) {
  if (!slug || !description) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  return db
    .query(
      `
    INSERT INTO topics (slug, description)
    VALUES ($1, $2)
    RETURNING *;
    `,
      [slug, description]
    )
    .then(({ rows }: { rows: Topic[] }) => rows[0]);
}

module.exports = { selectTopics, insertTopic };
