"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialSignIn = { email: "", password: "" };
const initialSignUp = { username: "", displayName: "", email: "", password: "" };

async function submit(path: string, payload: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }
}

export function AuthPanel() {
  const router = useRouter();
  const [signInForm, setSignInForm] = useState(initialSignIn);
  const [signUpForm, setSignUpForm] = useState(initialSignUp);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            setError(null);
            await submit("/api/auth/signin", signInForm);
            router.refresh();
          } catch {
            setError("Could not sign in");
          }
        }}
      >
        <h2 className="text-xl font-semibold">Sign in</h2>
        <div className="mt-4 grid gap-3">
          <input
            className="rounded-2xl border border-[var(--border)] px-4 py-3"
            placeholder="Email"
            type="email"
            value={signInForm.email}
            onChange={(event) => setSignInForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-[var(--border)] px-4 py-3"
            placeholder="Password"
            type="password"
            value={signInForm.password}
            onChange={(event) => setSignInForm((current) => ({ ...current, password: event.target.value }))}
          />
          <button className="rounded-2xl bg-[var(--accent)] px-4 py-3 font-medium text-[var(--accent-foreground)]" type="submit">
            Continue
          </button>
        </div>
      </form>

      <form
        className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            setError(null);
            await submit("/api/auth/signup", signUpForm);
            router.refresh();
          } catch {
            setError("Could not create account");
          }
        }}
      >
        <h2 className="text-xl font-semibold">Create account</h2>
        <div className="mt-4 grid gap-3">
          <input
            className="rounded-2xl border border-[var(--border)] px-4 py-3"
            placeholder="Username"
            value={signUpForm.username}
            onChange={(event) => setSignUpForm((current) => ({ ...current, username: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-[var(--border)] px-4 py-3"
            placeholder="Display name"
            value={signUpForm.displayName}
            onChange={(event) => setSignUpForm((current) => ({ ...current, displayName: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-[var(--border)] px-4 py-3"
            placeholder="Email"
            type="email"
            value={signUpForm.email}
            onChange={(event) => setSignUpForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-[var(--border)] px-4 py-3"
            placeholder="Password"
            type="password"
            value={signUpForm.password}
            onChange={(event) => setSignUpForm((current) => ({ ...current, password: event.target.value }))}
          />
          <button className="rounded-2xl bg-black px-4 py-3 font-medium text-white" type="submit">
            Sign up
          </button>
        </div>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
