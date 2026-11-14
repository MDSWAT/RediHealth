import fs from "fs";
import type { NextConfig } from "next";
import { meetingOriginFromEnv } from "./src/lib/security/csp";

const isProduction = process.env.NODE_ENV === "production";
const jitsiOrigin = meetingOriginFromEnv();

// On Windows (notably inside synced folders) readlink() on a regular directory fails with EISDIR,
// which makes webpack abort. Node reports EINVAL for the same case on other platforms, so translate it.
function patchWindowsReadlink() {
  const toEinval = (error: NodeJS.ErrnoException, path: fs.PathLike) => {
    if (error?.code !== "EISDIR") return error;
    return Object.assign(new Error(`EINVAL: invalid argument, readlink '${path}'`), {
      code: "EINVAL",
      errno: -22,
      syscall: "readlink",
      path: String(path),
    });
  };

  const readlink = fs.readlink;
  fs.readlink = ((path: fs.PathLike, ...args: unknown[]) => {
    const callback = args.pop() as (error: NodeJS.ErrnoException | null, link?: string) => void;
    return (readlink as (...a: unknown[]) => void)(path, ...args, (error: NodeJS.ErrnoException | null, link?: string) =>
      callback(error && toEinval(error, path), link),
    );
  }) as typeof fs.readlink;

  const readlinkSync = fs.readlinkSync;
  fs.readlinkSync = ((path: fs.PathLike, options?: fs.EncodingOption) => {
    try {
      return readlinkSync(path, options);
    } catch (error) {
      throw toEinval(error as NodeJS.ErrnoException, path);
    }
  }) as typeof fs.readlinkSync;

  const readlinkPromise = fs.promises.readlink;
  fs.promises.readlink = (async (path: fs.PathLike, options?: fs.EncodingOption) => {
    try {
      return await readlinkPromise(path, options);
    } catch (error) {
      throw toEinval(error as NodeJS.ErrnoException, path);
    }
  }) as typeof fs.promises.readlink;
}

const isWindowsDev = process.platform === "win32" && !isProduction;
if (isWindowsDev) {
  patchWindowsReadlink();
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    proxyClientMaxBodySize: "16mb",
  },
  allowedDevOrigins: (process.env.DEV_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  async headers() {
    return [
      {
        source: "/offline-worker.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Meetings embed Jitsi and record audio for transcription; the Find help map reads the visitor's location.
          // unload=(self) prevents Chromium's unload-deprecation policy from throwing console violations in polyfills.js.
          {
            key: "Permissions-Policy",
            value: `camera=(self "${jitsiOrigin}"), microphone=(self "${jitsiOrigin}"), display-capture=(self "${jitsiOrigin}"), geolocation=(self), unload=(self)`,
          },
          ...(isProduction
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
            : []),
        ],
      },
    ];
  },
  webpack: (config) => {
    if (isWindowsDev) {
      config.resolve.symlinks = false;
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
