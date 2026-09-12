import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/session",
        destination: "http://127.0.0.1:8000/api/session/",
      },
      {
        source: "/api/session/",
        destination: "http://127.0.0.1:8000/api/session/",
      },
      {
        source: "/api/login",
        destination: "http://127.0.0.1:8000/api/login/",
      },
      {
        source: "/api/login/",
        destination: "http://127.0.0.1:8000/api/login/",
      },
      {
        source: "/api/signup",
        destination: "http://127.0.0.1:8000/api/signup/",
      },
      {
        source: "/api/signup/",
        destination: "http://127.0.0.1:8000/api/signup/",
      },
    ];
  },
};

export default nextConfig;
