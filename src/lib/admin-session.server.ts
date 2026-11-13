import { createHash } from "node:crypto";
import { getRequestHeader, useSession as openSession } from "@tanstack/react-start/server";

type AdminSession = { unlocked?: boolean };

function sessionConfig() {
  const password = process.env["ADMIN_SESSION_SECRET"];
  if (!password) throw new Error("ADMIN_SESSION_SECRET is not set");
  return {
    password,
    name: "ph-admin",
    maxAge: 60 * 60 * 12, // stay unlocked for 12 hours
    // SameSite=None + Partitioned so the gate also works inside the editor preview frame.
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, partitioned: true, path: "/" },
  };
}

export const getAdminSession = () => openSession<AdminSession>(sessionConfig());

export async function isAdminUnlocked(): Promise<boolean> {
  const session = await getAdminSession();
  return session.data.unlocked === true;
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminUnlocked())) throw new Error("Dashboard is locked. Enter your PIN again.");
}

/** Hashed caller IP, used only to limit PIN guesses. */
export function clientKey(): string {
  const ip =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
