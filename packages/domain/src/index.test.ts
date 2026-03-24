import { describe, expect, it } from "vitest";
import { createRepositoryService, type RepositoryRepository } from "./index";
import type { CreateRepositoryInput, Repository } from "@hercules/contracts";

class FakeRepositoryRepository implements RepositoryRepository {
  async create(input: {
    ownerId: string;
    ownerUsername: string;
    payload: CreateRepositoryInput;
  }): Promise<Repository> {
    return {
      id: crypto.randomUUID(),
      ownerId: input.ownerId,
      ownerUsername: input.ownerUsername,
      name: input.payload.name,
      slug: `${input.ownerUsername}/${input.payload.name}`,
      description: input.payload.description ?? null,
      visibility: input.payload.visibility,
      defaultBranch: "main",
      readme: null,
      starCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async listVisibleForUser() {
    return [];
  }

  async findBySlug() {
    return null;
  }

  async star() {}

  async unstar() {}
}

describe("repository service", () => {
  it("creates a repository with a stable owner/name slug", async () => {
    const repositoryService = createRepositoryService(new FakeRepositoryRepository());

    const repository = await repositoryService.create(
      {
        id: crypto.randomUUID(),
        email: "alice@example.com",
        username: "alice",
        displayName: "Alice"
      },
      {
        name: "demo",
        description: "Demo repository",
        visibility: "public"
      }
    );

    expect(repository.slug).toBe("alice/demo");
  });
});
