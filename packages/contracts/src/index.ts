import { z } from "zod";

export const visibilitySchema = z.enum(["public", "private"]);
export type Visibility = z.infer<typeof visibilitySchema>;

export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(32).regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(1).max(80),
  email: z.email(),
  bio: z.string().max(160).nullable(),
  avatarUrl: z.url().nullable(),
  createdAt: z.date()
});
export type User = z.infer<typeof userSchema>;

export const repositorySchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  ownerUsername: z.string().min(3).max(32),
  name: z.string().min(1).max(100).regex(/^[A-Za-z0-9._-]+$/),
  slug: z.string().min(3).max(140),
  description: z.string().max(280).nullable(),
  visibility: visibilitySchema,
  defaultBranch: z.string().min(1).max(64),
  readme: z.string().max(100_000).nullable(),
  starCount: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date()
});
export type Repository = z.infer<typeof repositorySchema>;

export const issueSchema = z.object({
  id: z.string().uuid(),
  repositoryId: z.string().uuid(),
  number: z.number().int().positive(),
  title: z.string().min(1).max(120),
  body: z.string().max(20_000),
  authorId: z.string().uuid(),
  state: z.enum(["open", "closed"]),
  createdAt: z.date(),
  updatedAt: z.date()
});
export type Issue = z.infer<typeof issueSchema>;

export const pullRequestSchema = z.object({
  id: z.string().uuid(),
  repositoryId: z.string().uuid(),
  number: z.number().int().positive(),
  title: z.string().min(1).max(120),
  body: z.string().max(20_000),
  authorId: z.string().uuid(),
  baseBranch: z.string().min(1).max(64),
  headBranch: z.string().min(1).max(64),
  state: z.enum(["open", "closed", "merged"]),
  createdAt: z.date(),
  updatedAt: z.date()
});
export type PullRequest = z.infer<typeof pullRequestSchema>;

export const commentSchema = z.object({
  id: z.string().uuid(),
  body: z.string().min(1).max(20_000),
  authorId: z.string().uuid(),
  createdAt: z.date()
});
export type Comment = z.infer<typeof commentSchema>;

export const signUpInputSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(1).max(80),
  email: z.email(),
  password: z.string().min(8).max(128)
});
export type SignUpInput = z.infer<typeof signUpInputSchema>;

export const signInInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128)
});
export type SignInInput = z.infer<typeof signInInputSchema>;

export const createRepositoryInputSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[A-Za-z0-9._-]+$/),
  description: z.string().max(280).optional(),
  visibility: visibilitySchema.default("public")
});
export type CreateRepositoryInput = z.infer<typeof createRepositoryInputSchema>;

export const createIssueInputSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(20_000).default("")
});
export type CreateIssueInput = z.infer<typeof createIssueInputSchema>;

export const createPullRequestInputSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(20_000).default(""),
  baseBranch: z.string().min(1).max(64),
  headBranch: z.string().min(1).max(64)
});
export type CreatePullRequestInput = z.infer<typeof createPullRequestInputSchema>;

export const searchResultSchema = z.object({
  users: z.array(userSchema),
  repositories: z.array(repositorySchema),
  issues: z.array(issueSchema)
});
export type SearchResult = z.infer<typeof searchResultSchema>;

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string()
});
export type ApiError = z.infer<typeof apiErrorSchema>;
