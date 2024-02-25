const {
  removeComment,
  editComment,
} = require("../controllers/comments.controller");

const commentRouter = require("express").Router();

commentRouter.route("/:comment_id").delete(removeComment).patch(editComment);

module.exports = commentRouter;
