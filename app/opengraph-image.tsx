import { ImageResponse } from "next/og";

export const alt =
  "Hanjing Lin - software engineering, embedded systems, and computer vision";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#efefec",
          color: "#1d1d1f",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid rgba(29, 29, 31, 0.16)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: "64px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: "0.08em" }}>
            HANJING.DEV
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 92, fontWeight: 600 }}>
              Hanjing Lin
            </div>
            <div
              style={{
                color: "#555",
                display: "flex",
                fontSize: 34,
                marginTop: 18,
              }}
            >
              Software engineering · Embedded systems · Computer vision
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
