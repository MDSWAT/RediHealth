/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import fs from "fs";
import type { NextConfig } from "next";

function patchFsReadlink() {
  const origReadlink = fs.readlink;
  const origReadlinkSync = fs.readlinkSync;
  const origPromisesReadlink = fs.promises?.readlink;

  // @ts-ignore
  fs.readlink = function (path: any, ...args: any[]) {
    const callback = typeof args[args.length - 1] === "function" ? args.pop() : null;

    return origReadlink.call(this, path, (err: any, linkString: any) => {
      if (err && err.code === "EISDIR") {
        const einval: any = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        einval.code = "EINVAL";
        einval.errno = -22;
        einval.syscall = "readlink";
        einval.path = path;
        if (callback) return callback(einval);
      }
      if (callback) return callback(err, linkString);
    });
  };

  // @ts-ignore
  fs.readlinkSync = function (path: any, options: any) {
    try {
      return origReadlinkSync.call(this, path, options);
    } catch (err: any) {
      if (err && err.code === "EISDIR") {
        const einval: any = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        einval.code = "EINVAL";
        einval.errno = -22;
        einval.syscall = "readlink";
        einval.path = path;
        throw einval;
      }
      throw err;
    }
  };

  if (origPromisesReadlink) {
    // @ts-ignore
    fs.promises.readlink = async function (path: any, options: any) {
      try {
        return await origPromisesReadlink.call(this, path, options);
      } catch (err: any) {
        if (err && err.code === "EISDIR") {
          const einval: any = new Error(`EINVAL: invalid argument, readlink '${path}'`);
          einval.code = "EINVAL";
          einval.errno = -22;
          einval.syscall = "readlink";
          einval.path = path;
          throw einval;
        }
        throw err;
      }
    };
  }
}

patchFsReadlink();

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2"],
  webpack: (config) => {
    config.resolve.symlinks = false;
    config.cache = false;
    return config;
  },
};

export default nextConfig;
