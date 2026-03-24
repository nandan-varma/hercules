import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { signInInputSchema, signUpInputSchema } from "@hercules/contracts";
import type { AppContainer } from "./container";
import { getEnv } from "./env";

export async function hashPassword(password: string) {
  const { hash } = await import("bcryptjs");
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  const { compare } = await import("bcryptjs");
  return compare(password, passwordHash);
}

export async function signUp(container: AppContainer, payload: unknown) {
  const input = signUpInputSchema.parse(payload);
  const existingUser = await container.userRepository.findByEmail(input.email);
  if (existingUser) {
    throw new Error("Email already exists");
  }
  return container.userRepository.create({
    ...input,
    passwordHash: await hashPassword(input.password)
  });
}

export async function signIn(container: AppContainer, payload: unknown) {
  const input = signInInputSchema.parse(payload);
  const user = await container.userRepository.findByEmail(input.email);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }
  const token = crypto.randomUUID();
  await container.sessionRepository.create({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
  });
  return { token, user };
}

export async function getSessionUser(c: Context, container: AppContainer) {
  const env = getEnv();
  const token = getCookie(c, env.SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }
  return container.sessionRepository.findUserByToken(token);
}

export function writeSessionCookie(c: Context, token: string) {
  const env = getEnv();
  setCookie(c, env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14
  });
}

export function clearSessionCookie(c: Context) {
  const env = getEnv();
  deleteCookie(c, env.SESSION_COOKIE_NAME, {
    path: "/"
  });
}
