import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@tiptap/react", "@tiptap/starter-kit", "@tiptap/pm", "lowlight", "tippy.js"],
};

export default nextConfig;
