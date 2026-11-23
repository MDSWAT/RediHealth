import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  USER_COUNTY_COOKIE,
  USER_COUNTY_HEADER,
  REDIHEALTH_COUNTY_HEADER,
  resolveCountyFromHeaders,
} from "@/lib/geo-ip-server";
import { isRomanianCounty } from "@/lib/romanian-counties";

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const county = resolveCountyFromHeaders(request.headers, cookieHeader);
  const cookieVal = request.cookies.get(USER_COUNTY_COOKIE)?.value;
  const isOverride = Boolean(cookieVal && isRomanianCounty(cookieVal));

  return NextResponse.json({
    county,
    isOverride,
  });
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    const { county } = rawBody as { county?: unknown };

    if (typeof county !== "string" || !county || !isRomanianCounty(county)) {
      return NextResponse.json(
        { error: "Choose a county." },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      county,
    });

    response.cookies.set(USER_COUNTY_COOKIE, county, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });

    const encodedCounty = encodeURIComponent(county);
    response.headers.set(USER_COUNTY_HEADER, encodedCounty);
    response.headers.set(REDIHEALTH_COUNTY_HEADER, encodedCounty);

    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not change the location." },
      { status: 500 }
    );
  }
}
