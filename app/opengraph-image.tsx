import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tabby — Enjoy the meal, not the math.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "#0E0E0E",
          color: "#F8F4F0",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 85% 18%, rgba(255,124,97,0.40), transparent 55%), radial-gradient(circle at 12% 110%, rgba(255,124,97,0.22), transparent 50%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(248,244,240,0.55)",
            fontWeight: 600,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#FF7C61",
            }}
          />
          Tabby · Launching Q4 2026
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 128,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 0.95,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span>Enjoy the meal,</span>
          </div>
          <div
            style={{
              fontSize: 128,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 0.95,
              fontStyle: "italic",
              color: "#FF7C61",
            }}
          >
            not the math.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            color: "rgba(248,244,240,0.70)",
            zIndex: 1,
          }}
        >
          <div style={{ maxWidth: 720, lineHeight: 1.35 }}>
            Scan the receipt. Claim your items. Settle up before you leave.
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#FF7C61",
              fontWeight: 700,
            }}
          >
            tabby.app
          </div>
        </div>
      </div>
    ),
    size,
  );
}
