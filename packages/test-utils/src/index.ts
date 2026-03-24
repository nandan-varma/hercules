import type {
  CreateIssueInput,
  CreatePullRequestInput,
  CreateRepositoryInput,
  Issue,
  PullRequest,
  Repository,
  SignUpInput,
  User
} from "@hercules/contracts";
import type {
  IssueRepository,
  PullRequestRepository,
  RepositoryRepository,
  SearchRepository,
  SessionRepository,
  UserRepository
} from "@hercules/domain";

function now() {
  return new Date();
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    username: "alice",
    displayName: "Alice",
    email: "alice@example.com",
    bio: null,
    avatarUrl: null,
    createdAt: now(),
    ...overrides
  };
}

export function makeRepository(overrides: Partial<Repository> = {}): Repository {
  return {
    id: crypto.randomUUID(),
    ownerId: crypto.randomUUID(),
    ownerUsername: "alice",
    name: "demo",
    slug: "alice/demo",
    description: "Repository description",
    visibility: "public",
    defaultBranch: "main",
    readme: "# Demo",
    starCount: 0,
    createdAt: now(),
    updatedAt: now(),
    ...overrides
  };
}

export class InMemoryUserRepository implements UserRepository {
  readonly users = new Map<string, User & { passwordHash: string }>();

  async create(input: SignUpInput & { passwordHash: string }) {
    const user = {
      ...makeUser({
        username: input.username,
        displayName: input.displayName,
        email: input.email
      }),
      passwordHash: input.passwordHash
    };
    this.users.set(user.id, user);
    return user;
  }

  async findByEmail(email: string) {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async findById(id: string) {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async list() {
    return [...this.users.values()].map(({ passwordHash: _passwordHash, ...user }) => user);
  }
}

export class InMemorySessionRepository implements SessionRepository {
  readonly sessions = new Map<string, string>();
  constructor(private readonly users: InMemoryUserRepository) {}

  async create(input: { userId: string; token: string; expiresAt: Date }) {
    this.sessions.set(input.token, input.userId);
  }

  async findUserByToken(token: string) {
    const userId = this.sessions.get(token);
    return userId ? this.users.findById(userId) : null;
  }

  async delete(token: string) {
    this.sessions.delete(token);
  }
}

export class InMemoryRepositoryRepository implements RepositoryRepository, SearchRepository {
  readonly repositories = new Map<string, Repository>();
  readonly stars = new Set<string>();

  async create(input: { ownerId: string; ownerUsername: string; payload: CreateRepositoryInput }) {
    const repository = makeRepository({
      ownerId: input.ownerId,
      ownerUsername: input.ownerUsername,
      name: input.payload.name,
      slug: `${input.ownerUsername}/${input.payload.name}`,
      description: input.payload.description ?? null,
      visibility: input.payload.visibility
    });
    this.repositories.set(repository.slug, repository);
    return repository;
  }

  async listVisibleForUser() {
    return [...this.repositories.values()];
  }

  async findBySlug(slug: string) {
    return this.repositories.get(slug) ?? null;
  }

  async star(slug: string, userId: string) {
    const repository = this.repositories.get(slug);
    if (!repository) {
      return;
    }
    const key = `${slug}:${userId}`;
    if (!this.stars.has(key)) {
      this.stars.add(key);
      repository.starCount += 1;
    }
  }

  async unstar(slug: string, userId: string) {
    const repository = this.repositories.get(slug);
    if (!repository) {
      return;
    }
    const key = `${slug}:${userId}`;
    if (this.stars.delete(key) && repository.starCount > 0) {
      repository.starCount -= 1;
    }
  }

  async search(query: string) {
    const repositories = [...this.repositories.values()].filter((repository) =>
      repository.slug.toLowerCase().includes(query.toLowerCase())
    );
    return { users: [], repositories, issues: [] };
  }
}

export class InMemoryIssueRepository implements IssueRepository {
  readonly issues = new Map<string, Issue[]>();

  async create(input: { repositoryId: string; authorId: string; payload: CreateIssueInput }) {
    const existing = this.issues.get(input.repositoryId) ?? [];
    const issue: Issue = {
      id: crypto.randomUUID(),
      repositoryId: input.repositoryId,
      number: existing.length + 1,
      title: input.payload.title,
      body: input.payload.body,
      authorId: input.authorId,
      state: "open",
      createdAt: now(),
      updatedAt: now()
    };
    existing.push(issue);
    this.issues.set(input.repositoryId, existing);
    return issue;
  }

  async listByRepository(repositoryId: string) {
    return this.issues.get(repositoryId) ?? [];
  }
}

export class InMemoryPullRequestRepository implements PullRequestRepository {
  readonly pullRequests = new Map<string, PullRequest[]>();

  async create(input: { repositoryId: string; authorId: string; payload: CreatePullRequestInput }) {
    const existing = this.pullRequests.get(input.repositoryId) ?? [];
    const pullRequest: PullRequest = {
      id: crypto.randomUUID(),
      repositoryId: input.repositoryId,
      number: existing.length + 1,
      title: input.payload.title,
      body: input.payload.body,
      authorId: input.authorId,
      baseBranch: input.payload.baseBranch,
      headBranch: input.payload.headBranch,
      state: "open",
      createdAt: now(),
      updatedAt: now()
    };
    existing.push(pullRequest);
    this.pullRequests.set(input.repositoryId, existing);
    return pullRequest;
  }

  async listByRepository(repositoryId: string) {
    return this.pullRequests.get(repositoryId) ?? [];
  }
}
