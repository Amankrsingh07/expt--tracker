/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the development origin (network IP) to access Next dev resources
  // This resolves the Turbopack cross-origin dev resource warning seen in the logs.
  allowedDevOrigins: ["http://10.38.107.33:3000", "http://10.176.95.112:3000"],
};

export default nextConfig;
