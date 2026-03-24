import type { Issue, PullRequest, Repository } from "@hercules/contracts";

export function RepositoryDetail({
  repository,
  issues,
  pullRequests
}: {
  repository: Repository;
  issues: Issue[];
  pullRequests: PullRequest[];
}) {
  return (
    <div className="grid gap-8">
      <section className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{repository.visibility}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{repository.slug}</h1>
            <p className="mt-4 max-w-2xl text-[var(--muted)]">{repository.description ?? "No description yet."}</p>
          </div>
          <div className="rounded-2xl bg-stone-100 px-4 py-3 text-sm">
            <div>{repository.defaultBranch}</div>
            <div className="text-[var(--muted)]">{repository.starCount} stars</div>
          </div>
        </div>
        <article className="prose prose-stone mt-8 max-w-none">
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-stone-950 p-5 text-sm text-stone-100">
            {repository.readme ?? "# Empty repository"}
          </pre>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Issues</h2>
          <div className="mt-4 grid gap-3">
            {issues.length === 0 ? <p className="text-sm text-[var(--muted)]">No issues yet.</p> : null}
            {issues.map((issue) => (
              <div key={issue.id} className="rounded-2xl border border-[var(--border)] p-4">
                <div className="font-medium">
                  #{issue.number} {issue.title}
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{issue.body || "No description"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Pull requests</h2>
          <div className="mt-4 grid gap-3">
            {pullRequests.length === 0 ? <p className="text-sm text-[var(--muted)]">No pull requests yet.</p> : null}
            {pullRequests.map((pullRequest) => (
              <div key={pullRequest.id} className="rounded-2xl border border-[var(--border)] p-4">
                <div className="font-medium">
                  #{pullRequest.number} {pullRequest.title}
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {pullRequest.headBranch} into {pullRequest.baseBranch}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
