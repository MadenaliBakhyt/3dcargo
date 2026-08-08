/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  eslint: {
    dirs: ["app", "components", "features", "hooks", "lib", "stores", "types"],
  },
};

export default nextConfig;
