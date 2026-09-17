/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep `next dev` and `next build` from corrupting each other's webpack chunks
  // when validation runs while the local preview remains open.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    // The game never uses next/image: art is CSS backgrounds and Phaser
    // textures served straight from public/. With the optimizer off,
    // /_next/image answers 404 — less attack surface for an endpoint nothing
    // needs. It was the only defence against GHSA-2xp9-vwfh-vxw4 on Next 14;
    // on 15.5.25 it is patched, so this is kept as hardening. Turn it back on
    // only if next/image is adopted.
    unoptimized: true,
  },
};

module.exports = nextConfig;
