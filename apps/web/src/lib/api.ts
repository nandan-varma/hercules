import type { Issue, PullRequest, Repository, User } from "@hercules/contracts";
import { headers } from "next/headers";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookie = (await headers()).get("cookie");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface HomeData {
  repositories: Repository[];
  currentUser: User | null;
}

export async function getHomeData(): Promise<HomeData> {
  const [repositoriesResponse, authResponse] = await Promise.all([
    apiFetch<{ repositories: Repository[] }>("/api/repositories"),
    apiFetch<{ user: User | null }>("/api/auth/me")
  ]);

  return {
    repositories: repositoriesResponse.repositories,
    currentUser: authResponse.user
  };
}

export async function getRepositoryData(owner: string, name: string) {
  return apiFetch<{
    repository: Repository;
    issues: Issue[];
    pullRequests: PullRequest[];
  }>(`/api/repositories/${owner}/${name}`);
}
