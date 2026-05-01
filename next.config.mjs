import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Fix Turbopack root issue
  turbopack: {
    root: path.resolve(process.cwd()),
  },

  // ✅ Keep your existing config (DO NOT REMOVE)
  allowedDevOrigins: [
    "http://10.38.107.33:3000",
    "http://10.176.95.112:3000",
  ],
};

export default nextConfig;