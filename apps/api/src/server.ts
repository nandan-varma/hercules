import { serve } from "@hono/node-server";

import { createApp } from "./app";
import { getEnv } from "./lib/env";

const env = getEnv();

serve(
  {
    fetch: createApp().fetch,
    port: env.API_PORT
  },
  (info) => {
    console.log(`API running on http://localhost:${info.port}`);
  }
);
