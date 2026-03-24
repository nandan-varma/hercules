import { Hono } from "hono";
import { cors } from "hono/cors";

import { createContainer, type AppContainer } from "./lib/container";
import { getEnv } from "./lib/env";
import { createRouter } from "./routes";

export function createApp(container: AppContainer = createContainer()) {
  const env = getEnv();
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: env.APP_ORIGIN,
      allowHeaders: ["Content-Type"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      credentials: true
    })
  );

  app.route("/api", createRouter(container));

  app.onError((error, c) => {
    console.error(error);
    return c.json({ code: "INTERNAL_SERVER_ERROR", message: error.message }, 500);
  });

  return app;
}
