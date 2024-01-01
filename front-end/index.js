const express = require("express");
const cacheMiddleware = require("./middleware/cache");
const proxyMiddleware = require("./middleware/proxy");
const catalogRoundRobinMiddleware = require("./middleware/catalogRoundRobin");
const ordersRoundRobinMiddleware = require("./middleware/ordersRoundRobin");
const cache = require("memory-cache");
const { performance } = require("perf_hooks");

const catalogTargets = ["http://172.16.0.20:3333", "http://172.16.0.20:3334"];
const ordersTargets = ["http://172.16.0.20:4444", "http://172.16.0.20:4445"];

const app = express();
app.use(express.json());

// Middleware for handling catalog search
app.use(
  "/api/search/:topic",
  cacheMiddleware,
  catalogRoundRobinMiddleware(catalogTargets),
  (req, res, next) => {
    proxyMiddleware(
      req.target,
      {
        "^/api/search": "/api/search",
      },
      (proxyRes) => {
        let body = "";

        proxyRes.on("data", (chunk) => {
          body += chunk;
        });

        proxyRes.on("end", () => {
          // Cache the result and set expiration to 5 minutes
          cache.put(req.url, body, 60 * 5 * 1000);
          next();
        });
      }
    )(req, res, next);
  }
);

// Middleware for handling item information
app.use(
  "/api/info/:itemNumber",
  cacheMiddleware,
  catalogRoundRobinMiddleware(catalogTargets),
  (req, res, next) => {
    const startTime = performance.now();
    console.log("Accessing request:", req.url);

    proxyMiddleware(
      req.target,
      {
        "^/api/info": "/api/info",
      },
      (proxyRes) => {
        let body = "";

        proxyRes.on("data", (chunk) => {
          body += chunk;
        });

        proxyRes.on("end", () => {
          const endTime = performance.now();
          const elapsedTime = endTime - startTime;

          console.log(`Request processed in ${elapsedTime} milliseconds`);

          // Log the content of the cache for debugging
          console.log(cache.get("/api/info/1"));

          // Cache the result and set expiration to 5 minutes
          cache.put(req.url, body, 60 * 5 * 1000);
          next();
        });
      }
    )(req, res, next);
  }
);

// Middleware for handling item purchase
app.use(
  "/api/purchase/:itemNumber",
  ordersRoundRobinMiddleware(ordersTargets),
  (req, res, next) => {
    proxyMiddleware(req.target, {
      "^/api/purchase": "/api/purchase",
    })(req, res, next);
  }
);

// API endpoint to manually update records in the cache
app.get("/api/updatedrecord/:itemNumber", (req, res) => {
  itemNumber = req.params.itemNumber;
  // Delete the cache entry for the specified itemNumber
  cache.del(`/api/info/${itemNumber}`);
  res.send("done");
});

const port = 2222;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
