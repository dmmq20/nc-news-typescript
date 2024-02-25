const {
  getAllArticles,
  getArticleById,
  getArticleCommentsById,
  addComment,
  editArticle,
  addArticle,
  removeArticle,
} = require("../controllers/articles.controller");

const articleRouter = require("express").Router();

articleRouter.route("/").get(getAllArticles).post(addArticle);

articleRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(editArticle)
  .delete(removeArticle);

articleRouter
  .route("/:article_id/comments")
  .get(getArticleCommentsById)
  .post(addComment);

module.exports = articleRouter;
