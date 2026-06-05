import type { RenderInput, RenderResult } from "../frontend/entry-server";

// The built Vite SSR bundle. Produced by `vite build --ssr` (npm script
// `build:client+ssr`) BEFORE the worker is bundled — see package.json. It ships
// no type declarations and lives under the tsconfig-excluded `dist/` dir, so the
// import is typed via RenderInput/RenderResult below rather than from the file.
// @ts-ignore — generated artifact, present at build time
import { render } from "../../dist/server/entry-server.js";

export type { RenderInput, RenderResult };

/**
 * Single typed boundary over the built SSR bundle, so the build-artifact
 * coupling lives in exactly one place. Throws if the bundle is missing/broken —
 * callers wrap this in try/catch and fall back to the head-only shell.
 */
export function renderApp(input: RenderInput): Promise<RenderResult> {
	return (render as (i: RenderInput) => Promise<RenderResult>)(input);
}
