import { ImageResponse } from "next/og";

export const alt = "better-translate";
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200,
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at top, rgba(255,255,255,0.14), transparent 42%), linear-gradient(135deg, #060606 0%, #141414 55%, #1d1d1d 100%)",
          color: "#f5f5f5",
          display: "flex",
          flex: 1,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          height: "100%",
          padding: "56px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "36px",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px",
            position: "relative",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.72)",
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            better-translate
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "900px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 76,
                fontWeight: 700,
                lineHeight: 1.02,
              }}
            >
              Type-safe translations for TypeScript.
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.72)",
                display: "flex",
                fontSize: 30,
                lineHeight: 1.35,
                maxWidth: "760px",
              }}
            >
              One configuration for Next.js, React, Astro, TanStack Router, and
              Node.js.
            </div>
          </div>
          <div
            style={{
              color: "#9ae6b4",
              display: "flex",
              fontSize: 26,
            }}
          >
            Docs, adapters, CLI, and localized routing
          </div>
        </div>
      </div>
    ),
    size,
  );
}
