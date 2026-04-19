import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

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
        }}
      >
        <img
          src="https://framerusercontent.com/images/8ziC1H7zLZIh36Br3ZlUaplUabg.png"
          width="64"
          height="64"
          alt=""
        />
      </div>
    ),
    size,
  );
}
