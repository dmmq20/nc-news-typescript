const { getTopics, addTopic } = require("../controllers/topics.controller");

const topicRouter = require("express").Router();

topicRouter.route("/").get(getTopics).post(addTopic);

module.exports = topicRouter;
