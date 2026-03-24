import Link from "next/link";
import type { Repository } from "@hercules/contracts";

export function RepositoryList({ repositories }: { repositories: Repository[] }) {
  return (
    <div className="grid gap-4">
      {repositories.map((repository) => (
        <Link
          key={repository.id}
          className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5"
          href={`/repositories/${repository.ownerUsername}/${repository.name}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{repository.slug}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{repository.description ?? "No description yet."}</p>
            </div>
            <div className="text-right text-sm">
              <div>{repository.visibility}</div>
              <div className="text-[var(--muted)]">{repository.starCount} stars</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
