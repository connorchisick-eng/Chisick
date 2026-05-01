import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon for Chrome / Safari tabs. We bake rounded corners directly into
// the PNG (transparent outer corners + ink squircle background + centered
// logo) so the tab shows a rounded chip instead of a flat square.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FFFFFF",
            borderRadius: 18,
          }}
        >
          <img
            src="https://framerusercontent.com/images/8ziC1H7zLZIh36Br3ZlUaplUabg.png"
            width={48}
            height={48}
            alt=""
          />
        </div>
      </div>
    ),
    size,
  );
}
