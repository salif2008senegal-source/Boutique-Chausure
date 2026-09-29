import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.137.1"],
  experimental: {
    serverActions: {
      // Par défaut Next.js refuse tout envoi de plus de 1 Mo : trop petit pour une photo de téléphone
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
