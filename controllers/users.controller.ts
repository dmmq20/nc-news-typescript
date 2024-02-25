import { NextFunction, Request, Response } from "express";
import { User } from "../types";

const {
  selectAllUsers,
  selectUserByUsername,
} = require("../models/users.model");
const { checkExists } = require("./utils");

function getAllUsers(_req: Request, res: Response, next: NextFunction) {
  return selectAllUsers()
    .then((users: User[]) => res.status(200).send({ users }))
    .catch(next);
}

function getUserByUsername(req: Request, res: Response, next: NextFunction) {
  const { username } = req.params;
  return Promise.all([
    checkExists("users", "username", username),
    selectUserByUsername(username),
  ])
    .then(([_, user]) => {
      res.status(200).send({ user });
    })
    .catch(next);
}

module.exports = { getAllUsers, getUserByUsername };
