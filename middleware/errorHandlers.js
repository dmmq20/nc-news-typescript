function psqlErrors(err, req, res, next) {
  if (err.code === "23502" || err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  }
  if (err.code === "23503") {
    res.status(404).send({ msg: "Not found" });
  }
  if (err.code === "23505") {
    res.status(404).send({ msg: "Value already exists" });
  }
  next(err);
}

function customErrors(err, req, res, next) {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
}

function serverError(err, req, res, next) {
  res.status(500).send("Server Error!");
}

function invalidRoute(req, res, next) {
  res.status(404).send({ msg: "Invalid url" });
  next();
}

module.exports = { psqlErrors, customErrors, serverError, invalidRoute };
