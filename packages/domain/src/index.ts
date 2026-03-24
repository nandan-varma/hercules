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

export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export type AuthUser = Pick<User, "id" | "email" | "username" | "displayName">;

export interface UserRepository {
  create(input: SignUpInput & { passwordHash: string }): Promise<User>;
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  findById(id: string): Promise<User | null>;
  list(): Promise<User[]>;
}

export interface SessionRepository {
  create(input: { userId: string; token: string; expiresAt: Date }): Promise<void>;
  findUserByToken(token: string): Promise<User | null>;
  delete(token: string): Promise<void>;
}

export interface RepositoryRepository {
  create(input: {
    ownerId: string;
    ownerUsername: string;
    payload: CreateRepositoryInput;
  }): Promise<Repository>;
  listVisibleForUser(userId?: string): Promise<Repository[]>;
  findBySlug(slug: string, userId?: string): Promise<Repository | null>;
  star(slug: string, userId: string): Promise<void>;
  unstar(slug: string, userId: string): Promise<void>;
}

export interface IssueRepository {
  create(input: {
    repositoryId: string;
    authorId: string;
    payload: CreateIssueInput;
  }): Promise<Issue>;
  listByRepository(repositoryId: string): Promise<Issue[]>;
}

export interface PullRequestRepository {
  create(input: {
    repositoryId: string;
    authorId: string;
    payload: CreatePullRequestInput;
  }): Promise<PullRequest>;
  listByRepository(repositoryId: string): Promise<PullRequest[]>;
}

export interface SearchRepository {
  search(query: string, userId?: string): Promise<{
    users: User[];
    repositories: Repository[];
    issues: Issue[];
  }>;
}

export function createRepositorySlug(ownerUsername: string, repositoryName: string) {
  return `${ownerUsername}/${repositoryName}`;
}

export function createRepositoryService(repositoryRepository: RepositoryRepository) {
  return {
    async create(owner: AuthUser, payload: CreateRepositoryInput) {
      const repository = await repositoryRepository.create({
        ownerId: owner.id,
        ownerUsername: owner.username,
        payload
      });
      if (repository.slug !== createRepositorySlug(owner.username, payload.name)) {
        throw new DomainError("INVALID_REPOSITORY_SLUG", "Repository slug mismatch");
      }
      return repository;
    },
    listVisibleForUser(userId?: string) {
      return repositoryRepository.listVisibleForUser(userId);
    },
    findBySlug(slug: string, userId?: string) {
      return repositoryRepository.findBySlug(slug, userId);
    },
    async toggleStar(slug: string, userId: string, starred: boolean) {
      if (starred) {
        await repositoryRepository.unstar(slug, userId);
        return { starred: false };
      }
      await repositoryRepository.star(slug, userId);
      return { starred: true };
    }
  };
}

export function createIssueService(issueRepository: IssueRepository) {
  return {
    create(repositoryId: string, authorId: string, payload: CreateIssueInput) {
      return issueRepository.create({ repositoryId, authorId, payload });
    },
    listByRepository(repositoryId: string) {
      return issueRepository.listByRepository(repositoryId);
    }
  };
}

export function createPullRequestService(pullRequestRepository: PullRequestRepository) {
  return {
    create(repositoryId: string, authorId: string, payload: CreatePullRequestInput) {
      return pullRequestRepository.create({ repositoryId, authorId, payload });
    },
    listByRepository(repositoryId: string) {
      return pullRequestRepository.listByRepository(repositoryId);
    }
  };
}

export function createSearchService(searchRepository: SearchRepository) {
  return {
    search(query: string, userId?: string) {
      return searchRepository.search(query.trim(), userId);
    }
  };
}
