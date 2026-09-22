import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(morgan("combined"));

app.get(["/api/router/health", "/api/status/health"], (req, res) => {
  res.status(200).json({
    message: "Router is healthy",
    status: "ok",
  });
});

app.get(["/api/router/ready", "/api/status/ready"], (req, res) => {
  res.status(200).json({
    status: "ready",
  });
});

const proxies = {};

function getProxy(sandboxId) {
  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-service-${sandboxId}`,
      changeOrigin: true,
      ws: true,
    });
  }
  return proxies[sandboxId];
}

app.use((req, res, next) => {
  const host = req.headers.host;
  if (!host) {
    return next();
  }
  const sandboxId = host.split(".")[0];
  // check if it starts with router
  if (sandboxId === "router") {
    return next();
  }
  // check if it starts with localhost
  if (sandboxId.startsWith("localhost")) {
    return next();
  }
  return getProxy(sandboxId)(req, res, next);
});

export default app;
