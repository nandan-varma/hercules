"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RepositoryCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  return (
    <form
      className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        const response = await fetch("/api/repositories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, description, visibility })
        });
        if (response.ok) {
          setName("");
          setDescription("");
          setVisibility("public");
          router.refresh();
        }
      }}
    >
      <h2 className="text-xl font-semibold">New repository</h2>
      <div className="mt-4 grid gap-3">
        <input
          className="rounded-2xl border border-[var(--border)] px-4 py-3"
          placeholder="repository-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <textarea
          className="min-h-24 rounded-2xl border border-[var(--border)] px-4 py-3"
          placeholder="Short description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <select
          className="rounded-2xl border border-[var(--border)] px-4 py-3"
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as "public" | "private")}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <button className="rounded-2xl bg-[var(--accent)] px-4 py-3 font-medium text-[var(--accent-foreground)]" type="submit">
          Create
        </button>
      </div>
    </form>
  );
}
