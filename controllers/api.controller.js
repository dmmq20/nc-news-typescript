const endpointsData = require("../endpoints.json");

const getEndpoints = (req, res, next) => {
  res.status(200).send({ endpoints: endpointsData }).catch(next);
};

module.exports = { getEndpoints };
