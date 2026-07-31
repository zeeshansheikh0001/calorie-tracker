import type { NextConfig } from "next";

/**
 * @huggingface/transformers pulls in onnxruntime-node (~200MB+ native bins).
 * Voice STT only runs in the browser, so those packages must stay out of
 * Vercel Serverless Function traces (250 MB unzipped limit).
 */
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
  outputFileTracingExcludes: {
    "/**": [
      "node_modules/onnxruntime-node/**",
      "node_modules/@huggingface/transformers/**",
      "node_modules/onnxruntime-web/**",
      "node_modules/@img/sharp-libvips-*/**",
      "node_modules/sharp/**",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Never resolve native ONNX into server/SSR bundles.
      config.resolve = config.resolve ?? {};
      config.resolve.alias = {
        ...config.resolve.alias,
        "onnxruntime-node": false,
        "@huggingface/transformers": false,
      };
    }
    return config;
  },
};

export default nextConfig;
