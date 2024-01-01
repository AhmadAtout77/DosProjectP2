const cache = require("memory-cache");

const cacheMiddleware = async (req, res, next) => {
  const key = req.originalUrl;
  const cachedBody = cache.get(key);

  if (cachedBody) {
    res.setHeader("Content-Type", "application/json");
    res.send(cachedBody);
  }

  next();
};

module.exports = cacheMiddleware;
