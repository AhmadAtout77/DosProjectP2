const { createProxyMiddleware } = require("http-proxy-middleware");

const proxy = (target, pathRewrite, onProxyRes) => {
  return createProxyMiddleware({
    target: target,
    pathRewrite: pathRewrite,
    onProxyRes: onProxyRes,
  });
};

module.exports = proxy;
