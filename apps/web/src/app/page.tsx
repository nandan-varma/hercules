import { AuthPanel } from "@/components/auth-panel";
import { Header } from "@/components/header";
import { RepositoryCreateForm } from "@/components/repository-create-form";
import { RepositoryList } from "@/components/repository-list";
import { getHomeData } from "@/lib/api";

export default async function HomePage() {
  const { repositories, currentUser } = await getHomeData();

  return (
    <main className="min-h-screen pb-16">
      <Header currentUser={currentUser} />

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border border-[var(--border)] bg-white/85 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Code hosting</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight">
              A GitHub-style platform with a modular monorepo backbone.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
              Public repositories, authentication, issues, pull requests, search, and R2-ready uploads.
            </p>
          </div>

          {currentUser ? <RepositoryCreateForm /> : <AuthPanel />}
        </div>

        <section className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Repositories</h2>
            <span className="text-sm text-[var(--muted)]">{repositories.length} total</span>
          </div>
          <RepositoryList repositories={repositories} />
        </section>
      </section>
    </main>
  );
}
