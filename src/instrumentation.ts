import type { Instrumentation } from "next";

export async function register() {
  // The reporter only exists in the Node.js runtime; this branch is removed from the Edge bundle.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerNode } = await import("./instrumentation-node");
    registerNode();
  }
}

/** Errors Next.js catches while rendering a page or running a route handler, action or the proxy. */
export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { onRequestErrorNode } = await import("./instrumentation-node");
    await onRequestErrorNode(...args);
  }
};
