import { Hono } from "hono";
import { createIssueInputSchema, createPullRequestInputSchema, createRepositoryInputSchema } from "@hercules/contracts";

import { clearSessionCookie, getSessionUser, signIn, signUp, writeSessionCookie } from "../lib/auth";
import type { AppContainer } from "../lib/container";

export function createRouter(container: AppContainer) {
  const app = new Hono();

  app.get("/health", (c) => c.json({ ok: true }));

  app.get("/auth/me", async (c) => {
    const user = await getSessionUser(c, container);
    return c.json({ user });
  });

  app.post("/auth/signup", async (c) => {
    const body = await c.req.json();
    const user = await signUp(container, body);
    const { token } = await signIn(container, body);
    writeSessionCookie(c, token);
    return c.json({ user }, 201);
  });

  app.post("/auth/signin", async (c) => {
    const body = await c.req.json();
    const result = await signIn(container, body);
    writeSessionCookie(c, result.token);
    return c.json({ user: result.user });
  });

  app.post("/auth/signout", async (c) => {
    clearSessionCookie(c);
    return c.json({ ok: true });
  });

  app.get("/repositories", async (c) => {
    const user = await getSessionUser(c, container);
    const repositories = await container.repositoryService.listVisibleForUser(user?.id);
    return c.json({ repositories });
  });

  app.post("/repositories", async (c) => {
    const user = await getSessionUser(c, container);
    if (!user) {
      return c.json({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
    }
    const body = createRepositoryInputSchema.parse(await c.req.json());
    const repository = await container.repositoryService.create(user, body);
    return c.json({ repository }, 201);
  });

  app.get("/repositories/:owner/:name", async (c) => {
    const user = await getSessionUser(c, container);
    const repository = await container.repositoryService.findBySlug(
      `${c.req.param("owner")}/${c.req.param("name")}`,
      user?.id
    );
    if (!repository) {
      return c.json({ code: "NOT_FOUND", message: "Repository not found" }, 404);
    }
    const [issues, pullRequests] = await Promise.all([
      container.issueService.listByRepository(repository.id),
      container.pullRequestService.listByRepository(repository.id)
    ]);
    return c.json({ repository, issues, pullRequests });
  });

  app.post("/repositories/:owner/:name/star", async (c) => {
    const user = await getSessionUser(c, container);
    if (!user) {
      return c.json({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
    }
    const slug = `${c.req.param("owner")}/${c.req.param("name")}`;
    const repository = await container.repositoryService.findBySlug(slug, user.id);
    if (!repository) {
      return c.json({ code: "NOT_FOUND", message: "Repository not found" }, 404);
    }
    const result = await container.repositoryService.toggleStar(slug, user.id, false);
    return c.json(result);
  });

  app.get("/repositories/:owner/:name/issues", async (c) => {
    const repository = await container.repositoryService.findBySlug(
      `${c.req.param("owner")}/${c.req.param("name")}`
    );
    if (!repository) {
      return c.json({ code: "NOT_FOUND", message: "Repository not found" }, 404);
    }
    const issues = await container.issueService.listByRepository(repository.id);
    return c.json({ issues });
  });

  app.post("/repositories/:owner/:name/issues", async (c) => {
    const user = await getSessionUser(c, container);
    if (!user) {
      return c.json({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
    }
    const repository = await container.repositoryService.findBySlug(
      `${c.req.param("owner")}/${c.req.param("name")}`,
      user.id
    );
    if (!repository) {
      return c.json({ code: "NOT_FOUND", message: "Repository not found" }, 404);
    }
    const body = createIssueInputSchema.parse(await c.req.json());
    const issue = await container.issueService.create(repository.id, user.id, body);
    return c.json({ issue }, 201);
  });

  app.get("/repositories/:owner/:name/pulls", async (c) => {
    const repository = await container.repositoryService.findBySlug(
      `${c.req.param("owner")}/${c.req.param("name")}`
    );
    if (!repository) {
      return c.json({ code: "NOT_FOUND", message: "Repository not found" }, 404);
    }
    const pullRequests = await container.pullRequestService.listByRepository(repository.id);
    return c.json({ pullRequests });
  });

  app.post("/repositories/:owner/:name/pulls", async (c) => {
    const user = await getSessionUser(c, container);
    if (!user) {
      return c.json({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
    }
    const repository = await container.repositoryService.findBySlug(
      `${c.req.param("owner")}/${c.req.param("name")}`,
      user.id
    );
    if (!repository) {
      return c.json({ code: "NOT_FOUND", message: "Repository not found" }, 404);
    }
    const body = createPullRequestInputSchema.parse(await c.req.json());
    const pullRequest = await container.pullRequestService.create(repository.id, user.id, body);
    return c.json({ pullRequest }, 201);
  });

  app.get("/search", async (c) => {
    const user = await getSessionUser(c, container);
    const query = c.req.query("q") ?? "";
    const results = await container.searchService.search(query, user?.id);
    return c.json(results);
  });

  app.post("/uploads/sign", async (c) => {
    const user = await getSessionUser(c, container);
    if (!user) {
      return c.json({ code: "UNAUTHORIZED", message: "Authentication required" }, 401);
    }
    if (!container.storageService) {
      return c.json({ code: "STORAGE_DISABLED", message: "Storage is not configured" }, 503);
    }
    const body = await c.req.json<{ contentType: string; filename: string }>();
    const key = `${user.id}/${Date.now()}-${body.filename}`;
    const upload = await container.storageService.createUploadUrl({
      key,
      contentType: body.contentType
    });
    return c.json({
      ...upload,
      publicUrl: container.storageService.getPublicUrl(key)
    });
  });

  return app;
}
