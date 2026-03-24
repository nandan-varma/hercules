# Hercules

Production-oriented GitHub-style monorepo built with Turborepo, Next.js, Hono, PostgreSQL, Drizzle, Zod, and Cloudflare R2.

## Apps

- `apps/web`: Next.js frontend
- `apps/api`: Hono API

## Packages

- `@hercules/contracts`: shared schemas and types
- `@hercules/domain`: framework-agnostic business logic
- `@hercules/db`: Drizzle schema and PostgreSQL repositories
- `@hercules/storage`: Cloudflare R2 storage adapter
- `@hercules/test-utils`: in-memory repositories and factories

## Features

- email/password auth with session cookies
- repository creation and listing
- repository details with README surface
- issues and pull requests
- repository search
- signed R2 upload URLs

## Run

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Start the API and web apps with the workspace scripts.
