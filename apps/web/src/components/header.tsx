import Link from "next/link";
import type { User } from "@hercules/contracts";

export function Header({ currentUser }: { currentUser: User | null }) {
  return (
    <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link className="text-lg font-semibold tracking-tight" href="/">
          hercules
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/">Explore</Link>
          {currentUser ? <span>{currentUser.username}</span> : <span className="text-[var(--muted)]">Guest</span>}
        </div>
      </div>
    </header>
  );
}
