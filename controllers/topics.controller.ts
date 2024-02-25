import { NextFunction, Request, Response } from "express";
import { Topic } from "../types";

const { selectTopics, insertTopic } = require("../models/topics.model");

function getTopics(_req: Request, res: Response, next: NextFunction) {
  return selectTopics()
    .then((topics: Topic[]) => {
      res.status(200).send({ topics });
    })
    .catch(next);
}

function addTopic(req: Request, res: Response, next: NextFunction) {
  const { slug, description } = req.body;
  return insertTopic(slug, description)
    .then((topic: Topic) => {
      res.status(201).send({ topic });
    })
    .catch(next);
}

module.exports = { getTopics, addTopic };
