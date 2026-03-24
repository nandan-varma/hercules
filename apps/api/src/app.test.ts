import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import { InMemoryIssueRepository, InMemoryPullRequestRepository, InMemoryRepositoryRepository, InMemorySessionRepository, InMemoryUserRepository } from "@hercules/test-utils";
import { createIssueService, createPullRequestService, createRepositoryService, createSearchService } from "@hercules/domain";

function createTestApp() {
  const userRepository = new InMemoryUserRepository();
  const sessionRepository = new InMemorySessionRepository(userRepository);
  const repositoryRepository = new InMemoryRepositoryRepository();
  const issueRepository = new InMemoryIssueRepository();
  const pullRequestRepository = new InMemoryPullRequestRepository();

  return createApp({
    issueService: createIssueService(issueRepository),
    pullRequestService: createPullRequestService(pullRequestRepository),
    repositoryService: createRepositoryService(repositoryRepository),
    searchService: createSearchService(repositoryRepository),
    sessionRepository,
    userRepository,
    storageService: null
  });
}

describe("api", () => {
  it("creates a user and repository", async () => {
    const app = createTestApp();

    const signUpResponse = await app.request("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "alice",
        displayName: "Alice",
        email: "alice@example.com",
        password: "password123"
      })
    });

    expect(signUpResponse.status).toBe(201);
    const cookie = signUpResponse.headers.get("set-cookie");
    expect(cookie).toContain("hercules_session");

    const repositoryResponse = await app.request("/api/repositories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookie ?? ""
      },
      body: JSON.stringify({
        name: "demo",
        description: "Demo repository",
        visibility: "public"
      })
    });

    expect(repositoryResponse.status).toBe(201);
    const repositoryBody = await repositoryResponse.json();
    expect(repositoryBody.repository.slug).toBe("alice/demo");
  });
});
