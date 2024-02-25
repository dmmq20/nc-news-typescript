import { Comment } from "../types";

const db = require("../db/connection");

function selectCommentById(id: number) {
  return db
    .query(
      `
    SELECT * FROM comments WHERE comment_id = $1
    `,
      [id]
    )
    .then(({ rows }: { rows: Comment[] }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
      return rows;
    });
}

function deleteComment(id: number) {
  return db.query(
    `
    DELETE FROM comments WHERE comment_id = $1;
    `,
    [id]
  );
}

function updateComment(id: number, inc_votes: number) {
  return db
    .query(
      `
    UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;
    `,
      [inc_votes, id]
    )
    .then(({ rows }: { rows: Comment[] }) => rows[0]);
}

module.exports = { deleteComment, selectCommentById, updateComment };
