import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/descargables/cap-presentacion.pdf",
        destination: "/descargables/CAP%20INFO%20Y%20VALORES.pdf",
        permanent: false,
      },
    ];
  },
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
