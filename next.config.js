/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep `next dev` and `next build` from corrupting each other's webpack chunks
  // when validation runs while the local preview remains open.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    // The game never uses next/image: art is CSS backgrounds and Phaser
    // textures served straight from public/. Turning the optimizer off makes
    // /_next/image answer 404, which closes the Image Optimization API RCE
    // (GHSA-2xp9-vwfh-vxw4) that Next 14 has no patch for. Remove once the app
    // is on a patched Next (>= 15.5.24) — and only if next/image is adopted.
    unoptimized: true,
  },
};

module.exports = nextConfig;
