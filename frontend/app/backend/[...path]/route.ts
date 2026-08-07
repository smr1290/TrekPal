import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin API proxy → Railway.
 * Reads API_PROXY_TARGET at request time (more reliable than next.config rewrites).
 */
const TARGET = (process.env.API_PROXY_TARGET || "").replace(/\/$/, "");

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
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);

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

  // Follow one HTTPS redirect on the server so the browser never leaves Vercel.
  if ([301, 302, 307, 308].includes(upstream.status)) {
    const loc = upstream.headers.get("location");
    if (loc) {
      const absolute = new URL(loc, dest);
      if (absolute.href.startsWith(TARGET) || absolute.href.startsWith(TARGET.replace("https://", "http://"))) {
        const httpsDest = absolute.href.replace(/^http:\/\//i, "https://");
        upstream = await fetch(httpsDest, init);
      }
    }
  }

  const outHeaders = new Headers();
  const pass = ["content-type", "cache-control"];
  for (const key of pass) {
    const value = upstream.headers.get(key);
    if (value) outHeaders.set(key, value);
  }

  // Forward Set-Cookie so the session sticks on the Vercel domain (first-party).
  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  if (setCookies.length > 0) {
    for (const c of setCookies) {
      outHeaders.append("set-cookie", c);
    }
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) outHeaders.append("set-cookie", single);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

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
