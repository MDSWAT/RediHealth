import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "RediHealth",
    short_name: "RediHealth",
    description:
      "Free, clear health information, symptom guidance, nearby clinics and pharmacies, and health mediator support.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#fcfbf9",
    theme_color: "#fcfbf9",
    categories: ["health", "medical"],
    icons: [
      {
        src: "/pwa/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/pwa-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa/pwa-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Check symptoms",
        short_name: "Symptoms",
        description: "Check symptoms and get clear next steps",
        url: "/health-check",
        icons: [
          {
            src: "/pwa/shortcut-symptoms-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Health assistant",
        short_name: "Assistant",
        description: "Talk with the guided health assistant",
        url: "/health-assistant",
        icons: [
          {
            src: "/pwa/shortcut-assistant-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Find clinics and pharmacies",
        short_name: "Find care",
        description: "Find nearby clinics and pharmacies",
        url: "/find-help",
        icons: [
          {
            src: "/pwa/shortcut-clinics-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Online doctor",
        short_name: "Doctor",
        description: "Request an online medical consultation",
        url: "/medic-online",
        icons: [
          {
            src: "/pwa/shortcut-doctor-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],
    screenshots: [
      {
        src: "/pwa/screenshot-mobile.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "RediHealth mobile symptom guidance and care finder",
      },
      {
        src: "/pwa/screenshot-desktop.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
        label: "RediHealth health information and clinic directory",
      },
    ],
  };
}
