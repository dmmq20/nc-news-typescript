import { Article, ArticleWithId, CommentWithId } from "../types";

const db = require("../db/connection");

function selectArticleById(id: number) {
  return db
    .query(
      `
      SELECT articles.*, 
        CAST(COUNT(comment_id) AS INTEGER) AS comment_count 
      FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;
      `,
      [id]
    )
    .then(({ rows }: { rows: ArticleWithId[] }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
}

function selectArticles(
  topic: string,
  sort_by = "created_at",
  order = "DESC",
  p = 1,
  limit = 10
) {
  let query = `
      SELECT a.author, title, a.article_id, a.topic, 
          a.created_at, a.votes, a.article_img_url, 
          CAST(COUNT(comment_id) AS INTEGER) AS comment_count 
      FROM articles AS a
      LEFT JOIN comments ON a.article_id = comments.article_id`;
  let queryWithTotalCount = `
      SELECT CAST(COUNT(*) AS INTEGER) AS total_count 
      FROM articles AS a`;
  const queryVals = [];
  if (topic) {
    query += ` WHERE a.topic = $1`;
    queryWithTotalCount += ` WHERE a.topic = $1`;
    queryVals.push(topic);
  }
  query += ` GROUP BY a.article_id`;
  if (
    !isNaN(p) &&
    !isNaN(limit) &&
    [
      "title",
      "created_at",
      "author",
      "article_id",
      "votes",
      "comment_count",
    ].includes(sort_by) &&
    ["ASC", "DESC"].includes(order.toUpperCase())
  ) {
    query += ` ORDER BY ${sort_by} ${order}`;
    query += ` LIMIT ${limit} OFFSET ${(p - 1) * limit};`;
  } else {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  return Promise.all([
    db.query(queryWithTotalCount, queryVals),
    db.query(query, queryVals),
  ]).then(([count, { rows }]) => {
    const total_count = count.rows[0];
    return { ...total_count, articles: rows };
  });
}

function selectArticleCommentsById(id: number, p = 1, limit = 10) {
  if (isNaN(p) || isNaN(limit)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  const query = `
      SELECT * FROM comments
      WHERE article_id = $1
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${(p - 1) * limit}
      `;
  return db
    .query(query, [id])
    .then(({ rows }: { rows: CommentWithId[] }) => rows);
}

function insertComment(body: string, author: string, id: number) {
  return db
    .query(
      `
      INSERT INTO comments (body, author, article_id) 
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [body, author, id]
    )
    .then(({ rows }: { rows: CommentWithId[] }) => {
      return rows[0];
    });
}

function updateArticle(id: number, inc_votes: number) {
  return db
    .query(
      `
      UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;
      `,
      [inc_votes, id]
    )
    .then(({ rows }: { rows: ArticleWithId[] }) => {
      return rows[0];
    });
}

function insertArticle(article: Article) {
  const votes = 0;
  const fmtArticle = [
    article.title,
    article.topic,
    article.author,
    article.body,
    votes,
    article.article_img_url ||
      "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
  ];
  return db
    .query(
      `
      INSERT INTO articles
        (title, topic, author, body, votes, article_img_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      fmtArticle
    )
    .then(({ rows }: { rows: ArticleWithId[] }) => rows[0]);
}

function deleteArticle(id: number) {
  return db
    .query(
      `
      DELETE FROM comments WHERE article_id = $1;
      `,
      [id]
    )
    .then(() => {
      return db.query(
        `
        DELETE FROM articles WHERE article_id = $1;
        `,
        [id]
      );
    });
}

module.exports = {
  selectArticleById,
  selectArticles,
  selectArticleCommentsById,
  insertComment,
  updateArticle,
  insertArticle,
  deleteArticle,
};
