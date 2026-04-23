import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            width: 180,
            height: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FFFFFF",
            borderRadius: 40,
          }}
        >
          <img
            src="https://framerusercontent.com/images/8ziC1H7zLZIh36Br3ZlUaplUabg.png"
            width="132"
            height="132"
            alt=""
          />
        </div>
      </div>
    ),
    size,
  );
}
