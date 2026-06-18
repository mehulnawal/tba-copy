const sanitize = require("mongo-sanitize");

const sanitizeRequest = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }
  next();
};

module.exports = sanitizeRequest;
