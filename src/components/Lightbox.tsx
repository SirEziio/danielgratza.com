"use client";

import { useEffect, useCallback } from "react";

interface Props {
  images: string[];
  startIndex: number;
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  images,
  startIndex,
  current,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const src = images[current];

  return (
    <div
      className="lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          background: "none",
          border: "1.5px solid rgba(255,255,255,0.4)",
          borderRadius: "999px",
          color: "#fff",
          padding: "0.4em 1em",
          cursor: "pointer",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "inherit",
          zIndex: 201,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.15)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "none")
        }
      >
        Close ✕
      </button>

      {/* Prev */}
      {current > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          style={arrowStyle("left")}
        >
          ←
        </button>
      )}

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "85vh",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {src.startsWith("/") || src.startsWith("http") ? (
          <img
            src={src}
            alt={`Image ${current + 1} of ${images.length}`}
            style={{
              maxWidth: "100%",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: "4px",
            }}
          />
        ) : (
          <div
            style={{
              width: "80vw",
              height: "60vh",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.85rem",
            }}
          >
            Image {current + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Next */}
      {current < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={arrowStyle("right")}
        >
          →
        </button>
      )}

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
        }}
      >
        {current + 1} / {images.length}
      </div>
    </div>
  );
}

function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: "1.5rem",
    transform: "translateY(-50%)",
    background: "none",
    border: "1.5px solid rgba(255,255,255,0.3)",
    borderRadius: "999px",
    color: "#fff",
    width: "3rem",
    height: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1.2rem",
    zIndex: 201,
    transition: "background 0.2s, border-color 0.2s",
  };
}
