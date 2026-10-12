import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserWorkerContext, type UserWorkerContext } from "@/lib/worker-auth";

type SuperAdminAccess =
  | { error: NextResponse }
  | { worker: UserWorkerContext; email: string };

export async function requireSuperAdmin(): Promise<SuperAdminAccess> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  const worker = await getUserWorkerContext(session.user.email);
  if (!worker.isSuperAdmin) {
    return { error: NextResponse.json({ error: "Super admin access is required." }, { status: 403 }) };
  }
  return { worker, email: session.user.email };
}
