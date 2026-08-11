import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin API proxy → Railway (BFF).
 *
 * Phones block cross-site cookies. We set `trekpal_access` on the Vercel
 * host from the JSON `access_token`, and send it upstream as Bearer.
 */
const TARGET = (process.env.API_PROXY_TARGET || "").replace(/\/$/, "");
const COOKIE_NAME = "trekpal_access";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day (matches typical ACCESS_TOKEN_EXPIRE)

type Ctx = { params: Promise<{ path: string[] }> };

function isAuthSessionPath(path: string[]) {
  return (
    path.length === 2 &&
    path[0] === "auth" &&
    (path[1] === "signup" || path[1] === "login" || path[1] === "logout")
  );
}

async function proxy(req: NextRequest, pathSegments: string[]) {
  if (!TARGET) {
    return NextResponse.json(
      {
        detail:
          "Server misconfigured: set API_PROXY_TARGET on Vercel to your Railway API URL, then redeploy.",
      },
      { status: 502 }
    );
  }

  const incoming = new URL(req.url);
  const upstreamPath = pathSegments.map(encodeURIComponent).join("/");
  const dest = `${TARGET}/${upstreamPath}${incoming.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);

  // Prefer our first-party session cookie as Bearer (Railway accepts either).
  const session = req.cookies.get(COOKIE_NAME)?.value;
  if (session) {
    headers.set("Authorization", `Bearer ${session}`);
    headers.set("Cookie", `${COOKIE_NAME}=${session}`);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(dest, init);
  } catch {
    return NextResponse.json(
      { detail: "Could not reach the TrekPal API. Try again in a moment." },
      { status: 502 }
    );
  }

  if ([301, 302, 307, 308].includes(upstream.status)) {
    const loc = upstream.headers.get("location");
    if (loc) {
      const absolute = new URL(loc, dest);
      const httpTarget = TARGET.replace(/^https:\/\//i, "http://");
      if (absolute.href.startsWith(TARGET) || absolute.href.startsWith(httpTarget)) {
        const httpsDest = absolute.href.replace(/^http:\/\//i, "https://");
        upstream = await fetch(httpsDest, init);
      }
    }
  }

  const pathKey = pathSegments.join("/");
  const authSession = isAuthSessionPath(pathSegments);

  // Auth signup/login/logout: buffer JSON so we can set/clear our cookie.
  if (authSession || pathKey === "auth/me") {
    const text = await upstream.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    const res = NextResponse.json(data ?? { detail: text || "Empty response" }, {
      status: upstream.status,
    });

    if (
      upstream.ok &&
      pathSegments[1] !== "logout" &&
      data &&
      typeof data === "object" &&
      "access_token" in data &&
      typeof (data as { access_token: unknown }).access_token === "string"
    ) {
      res.cookies.set({
        name: COOKIE_NAME,
        value: (data as { access_token: string }).access_token,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }

    if (pathSegments[1] === "logout" || (pathKey === "auth/me" && upstream.status === 401)) {
      res.cookies.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }

    return res;
  }

  const outHeaders = new Headers();
  const contentTypeOut = upstream.headers.get("content-type");
  if (contentTypeOut) outHeaders.set("content-type", contentTypeOut);
  const cacheControl = upstream.headers.get("cache-control");
  if (cacheControl) outHeaders.set("cache-control", cacheControl);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
