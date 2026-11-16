import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserWorkerContext, type UserWorkerContext } from "@/lib/worker-auth";

type StaffAccess =
  | { error: NextResponse }
  | { worker: UserWorkerContext & { workerId: string }; email: string; name: string | null };

/** Signed-in, active staff member. Access is re-checked against the worker table on every request. */
export async function requireStaff(): Promise<StaffAccess> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  const worker = await getUserWorkerContext(session.user.email);
  if (!worker.workerId) {
    return { error: NextResponse.json({ error: "Staff access is required." }, { status: 403 }) };
  }
  return {
    worker: { ...worker, workerId: worker.workerId },
    email: session.user.email,
    name: session.user.name ?? null,
  };
}
