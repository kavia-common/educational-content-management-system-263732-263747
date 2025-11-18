import React from "react";

/**
 * PUBLIC_INTERFACE
 * VideoPlayer
 * Simple HTML5 video player.
 *
 * @param {object} props
 * @param {string} props.url - Video file URL
 */
export default function VideoPlayer({ url }) {
  if (!url) {
    return (
      <div className="card" style={{ borderColor: "var(--color-border)" }}>
        No video selected.
      </div>
    );
  }
  return (
    <video
      key={url}
      controls
      style={{
        width: "100%",
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        background: "black",
      }}
      src={url}
    />
  );
}
