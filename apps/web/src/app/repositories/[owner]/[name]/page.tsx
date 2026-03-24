import { Header } from "@/components/header";
import { RepositoryDetail } from "@/components/repository-detail";
import { apiFetch, getRepositoryData } from "@/lib/api";
import type { User } from "@hercules/contracts";

export default async function RepositoryPage({
  params
}: {
  params: Promise<{ owner: string; name: string }>;
}) {
  const { owner, name } = await params;
  const [{ user }, repositoryData] = await Promise.all([
    apiFetch<{ user: User | null }>("/api/auth/me"),
    getRepositoryData(owner, name)
  ]);

  return (
    <main className="min-h-screen pb-16">
      <Header currentUser={user} />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <RepositoryDetail
          repository={repositoryData.repository}
          issues={repositoryData.issues}
          pullRequests={repositoryData.pullRequests}
        />
      </section>
    </main>
  );
}
