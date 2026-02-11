import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/trabajo/pezon-sinblur.webp",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noimageindex, noindex, nosnippet",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
