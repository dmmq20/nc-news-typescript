import { NextFunction, Request, Response } from "express";

const { deleteComment, updateComment } = require("../models/comments.model");
const { checkExists } = require("./utils");

function removeComment(req: Request, res: Response, next: NextFunction) {
  const { comment_id } = req.params;
  return Promise.all([
    checkExists("comments", "comment_id", comment_id),
    deleteComment(comment_id),
  ])
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
}

function editComment(req: Request, res: Response, next: NextFunction) {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  return Promise.all([
    checkExists("comments", "comment_id", comment_id),
    updateComment(comment_id, inc_votes),
  ])
    .then(([_, comment]) => {
      res.status(200).send({ comment });
    })
    .catch(next);
}

module.exports = { removeComment, editComment };
