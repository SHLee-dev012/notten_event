import type { NextConfig } from "next";

// Each service role uses its own build dir so the participant (3000) and
// organizer (3001) `next dev`/`next start` processes can run at the same time
// off the single codebase. Set via NOTTEN_DIST_DIR in the npm scripts.
const nextConfig: NextConfig = {
  distDir: process.env.NOTTEN_DIST_DIR || ".next",
};

export default nextConfig;