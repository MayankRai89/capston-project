import { Express } from "express";
import morgan, { Morgan } from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(morgan("combined"));

app.use((req, res, next) => {
  const host = req.headers.host;
  const sandboxId = host.split(".")[0];
  //check if it starts with router
  if (sandboxId === "router") {
    next();
    return;
  }
  // check if it starts with localhost
  if (sandboxId.startsWith("localhost")) {
    next();
    return;
  }
  const target = "http://sandbox-service-${sandboxId}";
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
  })(req, res, next);
});

export default app;
