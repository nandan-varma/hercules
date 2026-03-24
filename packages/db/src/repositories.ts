import type {
  CreateIssueInput,
  CreatePullRequestInput,
  CreateRepositoryInput,
  Issue,
  PullRequest,
  Repository,
  User,
  Visibility
} from "@hercules/contracts";
import type {
  IssueRepository,
  PullRequestRepository,
  RepositoryRepository,
  SearchRepository,
  SessionRepository,
  UserRepository
} from "@hercules/domain";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import type { DatabaseClient } from "./client";
import { issues, pullRequests, repositories, sessions, stars, users } from "./schema";

function assertDefined<T>(value: T | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function mapUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    email: row.email,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt
  };
}

function mapRepository(row: typeof repositories.$inferSelect): Repository {
  return {
    ...row,
    visibility: row.visibility as Visibility
  };
}

function mapIssue(row: typeof issues.$inferSelect): Issue {
  return {
    ...row,
    state: row.state as Issue["state"]
  };
}

function mapPullRequest(row: typeof pullRequests.$inferSelect): PullRequest {
  return {
    ...row,
    state: row.state as PullRequest["state"]
  };
}

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(input: { username: string; displayName: string; email: string; passwordHash: string }) {
    const [row] = await this.db
      .insert(users)
      .values(input)
      .returning();
    const inserted = assertDefined(row, "User insert failed");
    return {
      ...mapUser(inserted),
      passwordHash: inserted.passwordHash
    };
  }

  async findByEmail(email: string) {
    const row = await this.db.query.users.findFirst({
      where: eq(users.email, email)
    });
    return row ? { ...mapUser(row), passwordHash: row.passwordHash } : null;
  }

  async findById(id: string) {
    const row = await this.db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return row ? mapUser(row) : null;
  }

  async list() {
    const rows = await this.db.select().from(users).orderBy(desc(users.createdAt));
    return rows.map(mapUser);
  }
}

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(input: { userId: string; token: string; expiresAt: Date }) {
    await this.db.insert(sessions).values(input);
  }

  async findUserByToken(token: string) {
    const row = await this.db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.token, token), sql`${sessions.expiresAt} > now()`))
      .limit(1);
    return row[0] ? mapUser(row[0].user) : null;
  }

  async delete(token: string) {
    await this.db.delete(sessions).where(eq(sessions.token, token));
  }
}

export class DrizzleRepositoryRepository implements RepositoryRepository, SearchRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(input: { ownerId: string; ownerUsername: string; payload: CreateRepositoryInput }) {
    const [row] = await this.db
      .insert(repositories)
      .values({
        ownerId: input.ownerId,
        ownerUsername: input.ownerUsername,
        name: input.payload.name,
        slug: `${input.ownerUsername}/${input.payload.name}`,
        description: input.payload.description ?? null,
        visibility: input.payload.visibility
      })
      .returning();
    return mapRepository(assertDefined(row, "Repository insert failed"));
  }

  async listVisibleForUser(userId?: string) {
    const rows = await this.db
      .select()
      .from(repositories)
      .where(userId ? or(eq(repositories.visibility, "public"), eq(repositories.ownerId, userId)) : eq(repositories.visibility, "public"))
      .orderBy(desc(repositories.updatedAt));
    return rows.map(mapRepository);
  }

  async findBySlug(slug: string, userId?: string) {
    const row = await this.db.query.repositories.findFirst({
      where: and(
        eq(repositories.slug, slug),
        userId ? or(eq(repositories.visibility, "public"), eq(repositories.ownerId, userId)) : eq(repositories.visibility, "public")
      )
    });
    return row ? mapRepository(row) : null;
  }

  async star(slug: string, userId: string) {
    const repository = await this.findBySlug(slug, userId);
    if (!repository) {
      return;
    }
    await this.db.insert(stars).values({ repositoryId: repository.id, userId }).onConflictDoNothing();
    await this.db
      .update(repositories)
      .set({ starCount: repository.starCount + 1, updatedAt: new Date() })
      .where(eq(repositories.id, repository.id));
  }

  async unstar(slug: string, userId: string) {
    const repository = await this.findBySlug(slug, userId);
    if (!repository) {
      return;
    }
    await this.db.delete(stars).where(and(eq(stars.repositoryId, repository.id), eq(stars.userId, userId)));
    await this.db
      .update(repositories)
      .set({ starCount: Math.max(0, repository.starCount - 1), updatedAt: new Date() })
      .where(eq(repositories.id, repository.id));
  }

  async search(query: string, userId?: string) {
    const [matchedUsers, matchedRepositories, matchedIssues] = await Promise.all([
      this.db.select().from(users).where(ilike(users.username, `%${query}%`)).limit(10),
      this.db
        .select()
        .from(repositories)
        .where(
          and(
            ilike(repositories.slug, `%${query}%`),
            userId ? or(eq(repositories.visibility, "public"), eq(repositories.ownerId, userId)) : eq(repositories.visibility, "public")
          )
        )
        .limit(10),
      this.db.select().from(issues).where(ilike(issues.title, `%${query}%`)).limit(10)
    ]);

    return {
      users: matchedUsers.map(mapUser),
      repositories: matchedRepositories.map(mapRepository),
      issues: matchedIssues.map(mapIssue)
    };
  }
}

export class DrizzleIssueRepository implements IssueRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(input: { repositoryId: string; authorId: string; payload: CreateIssueInput }) {
    const [count] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(issues)
      .where(eq(issues.repositoryId, input.repositoryId));
    const [row] = await this.db
      .insert(issues)
      .values({
        repositoryId: input.repositoryId,
        authorId: input.authorId,
        number: (count?.count ?? 0) + 1,
        title: input.payload.title,
        body: input.payload.body
      })
      .returning();
    return mapIssue(assertDefined(row, "Issue insert failed"));
  }

  async listByRepository(repositoryId: string) {
    const rows = await this.db.select().from(issues).where(eq(issues.repositoryId, repositoryId)).orderBy(desc(issues.number));
    return rows.map(mapIssue);
  }
}

export class DrizzlePullRequestRepository implements PullRequestRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(input: { repositoryId: string; authorId: string; payload: CreatePullRequestInput }) {
    const [count] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(pullRequests)
      .where(eq(pullRequests.repositoryId, input.repositoryId));
    const [row] = await this.db
      .insert(pullRequests)
      .values({
        repositoryId: input.repositoryId,
        authorId: input.authorId,
        number: (count?.count ?? 0) + 1,
        title: input.payload.title,
        body: input.payload.body,
        baseBranch: input.payload.baseBranch,
        headBranch: input.payload.headBranch
      })
      .returning();
    return mapPullRequest(assertDefined(row, "Pull request insert failed"));
  }

  async listByRepository(repositoryId: string) {
    const rows = await this.db
      .select()
      .from(pullRequests)
      .where(eq(pullRequests.repositoryId, repositoryId))
      .orderBy(desc(pullRequests.number));
    return rows.map(mapPullRequest);
  }
}
