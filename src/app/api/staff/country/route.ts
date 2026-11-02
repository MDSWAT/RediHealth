import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseCountry } from "@/lib/countries";
import { STAFF_COUNTRY_COOKIE, getUserWorkerContext, getWorkerMemberships } from "@/lib/worker-auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function describe(
  active: string | null,
  memberships: Awaited<ReturnType<typeof getWorkerMemberships>>["memberships"],
) {
  return {
    active,
    available: memberships.map(({ country, role }) => ({ country, role })),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [context, { memberships }] = await Promise.all([
    getUserWorkerContext(session.user.email),
    getWorkerMemberships(session.user.email),
  ]);
  return NextResponse.json(describe(context.workerId ? context.country : null, memberships));
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { country?: unknown } | null;
  const country = parseCountry(body?.country);
  if (!country) {
    return NextResponse.json({ error: "Unknown country." }, { status: 400 });
  }

  const { memberships } = await getWorkerMemberships(session.user.email);
  if (!memberships.some((membership) => membership.country === country)) {
    return NextResponse.json({ error: "You do not have access to that country." }, { status: 403 });
  }

  const response = NextResponse.json(describe(country, memberships));
  response.cookies.set(STAFF_COUNTRY_COOKIE, country, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}
