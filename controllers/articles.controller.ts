import { NextFunction, Request, Response } from "express";
import { ArticleWithId, Comment } from "../types";

const {
  selectArticleById,
  selectArticles,
  selectArticleCommentsById,
  insertComment,
  updateArticle,
  insertArticle,
  deleteArticle,
} = require("../models/articles.model");
const { checkExists } = require("../utils/checkExists");

function getArticleById(req: Request, res: Response, next: NextFunction) {
  const { article_id } = req.params;
  return selectArticleById(article_id)
    .then((article: ArticleWithId) => {
      res.status(200).send({ article });
    })
    .catch(next);
}

function getAllArticles(req: Request, res: Response, next: NextFunction) {
  const { order, sort_by, topic, p, limit } = req.query;
  const promises = [selectArticles(topic, sort_by, order, p, limit)];
  if (topic) {
    promises.push(checkExists("topics", "slug", topic));
  }
  return Promise.all(promises)
    .then(([articles, _]) => {
      res.status(200).send(articles);
    })
    .catch(next);
}

function getArticleCommentsById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { article_id } = req.params;
  const { p, limit } = req.query;
  return Promise.all([
    checkExists("articles", "article_id", article_id),
    selectArticleCommentsById(article_id, p, limit),
  ])
    .then(([_, comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
}

function addComment(req: Request, res: Response, next: NextFunction) {
  const { article_id } = req.params;
  const { body, username } = req.body;
  return checkExists("articles", "article_id", article_id)
    .then(() => {
      return insertComment(body, username, article_id);
    })
    .then((comment: Comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
}

function editArticle(req: Request, res: Response, next: NextFunction) {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  return Promise.all([
    checkExists("articles", "article_id", article_id),
    updateArticle(article_id, inc_votes),
  ])
    .then(([_, article]) => {
      res.status(200).send({ article });
    })
    .catch(next);
}

function addArticle(req: Request, res: Response, next: NextFunction) {
  return insertArticle(req.body)
    .then(({ article_id }: { article_id: number }) => {
      return selectArticleById(article_id);
    })
    .then((article: ArticleWithId) => {
      res.status(201).send({ article });
    })
    .catch(next);
}

function removeArticle(req: Request, res: Response, next: NextFunction) {
  const { article_id } = req.params;
  return Promise.all([
    checkExists("articles", "article_id", article_id),
    deleteArticle(article_id),
  ])
    .then(() => {
      res.status(200).send();
    })
    .catch(next);
}

module.exports = {
  getArticleById,
  getAllArticles,
  getArticleCommentsById,
  addComment,
  editArticle,
  addArticle,
  removeArticle,
};
