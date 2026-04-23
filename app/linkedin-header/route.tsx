import { ImageResponse } from "next/og";

export const runtime = "edge";

// LinkedIn company cover: 1584×396. Dark vignette background, massive
// italic "tabby." wordmark with peach→coral gradient fill — matches the
// hero visual the user asked to adapt.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Dark chocolate/ink bg with a soft radial vignette so the
          // wordmark sits on a lit stage rather than a flat black rectangle.
          background:
            "radial-gradient(ellipse 70% 95% at 50% 45%, #3a2519 0%, #1b120d 55%, #0a0605 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 340,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: -14,
            lineHeight: 0.9,
            // Gradient fill on the text — peach at top, coral at bottom —
            // matching the hero screenshot styling.
            backgroundImage:
              "linear-gradient(180deg, #ffb8a1 0%, #ff8c72 55%, #ff6a4a 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          tabby<span style={{ fontStyle: "normal" }}>.</span>
        </div>
      </div>
    ),
    {
      width: 1584,
      height: 396,
    },
  );
}
