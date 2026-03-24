import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export function createDatabaseClient(connectionString: string) {
  const sql = postgres(connectionString, {
    prepare: false,
    max: 5
  });

  return drizzle(sql, { schema });
}
