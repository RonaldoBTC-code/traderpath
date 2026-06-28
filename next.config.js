/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep `next dev` and `next build` from corrupting each other's webpack chunks
  // when validation runs while the local preview remains open.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

module.exports = nextConfig;
