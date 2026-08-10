/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  eslint: {
    dirs: ["app", "components", "features", "hooks", "lib", "stores", "types"],
  },
  async rewrites() {
    // The browser always calls this app's own origin (`/api/...`), so it works
    // from any host/port/domain without a rebuild. The Next.js server -- not
    // the browser -- forwards those requests to the backend, using a plain
    // (non-NEXT_PUBLIC_) runtime env var: BACKEND_INTERNAL_URL. In
    // docker-compose this is the "backend" service's Docker-internal address;
    // for local `npm run dev` without Docker it defaults to localhost.
    const backendInternalUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";
    return [{ source: "/api/:path*", destination: `${backendInternalUrl}/api/:path*` }];
  },
};

export default nextConfig;
