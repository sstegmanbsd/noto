import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/gh",
        destination: "https://github.com/snelusha/noto",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
