import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blue Sass | بلو ساس",
    short_name: "Blue Sass",
    description: "تصميم وتطوير المواقع والتطبيقات والمنتجات الرقمية.",
    start_url: "/ar",
    display: "standalone",
    background_color: "#050608",
    theme_color: "#050608",
    dir: "auto",
    lang: "ar",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
