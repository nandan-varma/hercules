import { createDatabaseClient, DrizzleIssueRepository, DrizzlePullRequestRepository, DrizzleRepositoryRepository, DrizzleSessionRepository, DrizzleUserRepository } from "@hercules/db";
import { createIssueService, createPullRequestService, createRepositoryService, createSearchService } from "@hercules/domain";
import { createR2StorageService, type StorageService } from "@hercules/storage";
import {
  InMemoryIssueRepository,
  InMemoryPullRequestRepository,
  InMemoryRepositoryRepository,
  InMemorySessionRepository,
  InMemoryUserRepository
} from "@hercules/test-utils";

import { getEnv } from "./env";

export interface AppContainer {
  issueService: ReturnType<typeof createIssueService>;
  pullRequestService: ReturnType<typeof createPullRequestService>;
  repositoryService: ReturnType<typeof createRepositoryService>;
  searchService: ReturnType<typeof createSearchService>;
  sessionRepository: DrizzleSessionRepository | InMemorySessionRepository;
  userRepository: DrizzleUserRepository | InMemoryUserRepository;
  storageService: StorageService | null;
}

export function createContainer(): AppContainer {
  const env = getEnv();

  if (env.DATABASE_URL) {
    const db = createDatabaseClient(env.DATABASE_URL);
    const userRepository = new DrizzleUserRepository(db);
    const sessionRepository = new DrizzleSessionRepository(db);
    const repositoryRepository = new DrizzleRepositoryRepository(db);
    const issueRepository = new DrizzleIssueRepository(db);
    const pullRequestRepository = new DrizzlePullRequestRepository(db);

    return {
      issueService: createIssueService(issueRepository),
      pullRequestService: createPullRequestService(pullRequestRepository),
      repositoryService: createRepositoryService(repositoryRepository),
      searchService: createSearchService(repositoryRepository),
      sessionRepository,
      userRepository,
      storageService:
        env.R2_ACCOUNT_ID &&
        env.R2_BUCKET &&
        env.R2_ACCESS_KEY_ID &&
        env.R2_SECRET_ACCESS_KEY &&
        env.R2_PUBLIC_BASE_URL
          ? createR2StorageService({
              accountId: env.R2_ACCOUNT_ID,
              bucket: env.R2_BUCKET,
              accessKeyId: env.R2_ACCESS_KEY_ID,
              secretAccessKey: env.R2_SECRET_ACCESS_KEY,
              publicBaseUrl: env.R2_PUBLIC_BASE_URL
            })
          : null
    };
  }

  const userRepository = new InMemoryUserRepository();
  const sessionRepository = new InMemorySessionRepository(userRepository);
  const repositoryRepository = new InMemoryRepositoryRepository();
  const issueRepository = new InMemoryIssueRepository();
  const pullRequestRepository = new InMemoryPullRequestRepository();

  return {
    issueService: createIssueService(issueRepository),
    pullRequestService: createPullRequestService(pullRequestRepository),
    repositoryService: createRepositoryService(repositoryRepository),
    searchService: createSearchService(repositoryRepository),
    sessionRepository,
    userRepository,
    storageService: null
  };
}
