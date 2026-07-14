"use client";

import { useState, useEffect, useRef } from "react";

export interface GalleryChapter {
  title: string;
  images: string[];
}

interface ChapterGalleryProps {
  chapters: GalleryChapter[];
  initialChapter: number;
  initialImage: number;
  onClose: () => void;
}

interface FlatImage {
  src: string;
  chapterIdx: number;
  imageIdx: number;
}

export default function ChapterGallery({
  chapters,
  initialChapter,
  initialImage,
  onClose,
}: ChapterGalleryProps) {
  // Flatten all images with chapter attribution
  const allImages: FlatImage[] = chapters.flatMap((ch, ci) =>
    ch.images.map((src, ii) => ({ src, chapterIdx: ci, imageIdx: ii }))
  );

  const findGlobalIdx = (chIdx: number, imgIdx: number) =>
    allImages.findIndex((img) => img.chapterIdx === chIdx && img.imageIdx === imgIdx);

  const [currentIdx, setCurrentIdx] = useState(() =>
    Math.max(0, findGlobalIdx(initialChapter, initialImage))
  );

  const current = allImages[currentIdx];
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Scroll active thumbnail into view
  useEffect(() => {
    const el = thumbnailsRef.current?.querySelector<HTMLButtonElement>(
      `[data-thumb-idx="${currentIdx}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentIdx]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setCurrentIdx((i) => Math.max(0, i - 1));
      else if (e.key === "ArrowRight")
        setCurrentIdx((i) => Math.min(allImages.length - 1, i + 1));
      else if (e.key === "Escape")
        onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [allImages.length, onClose]);

  // Trap body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const goToChapterFirst = (chIdx: number) => {
    const firstGlobal = allImages.findIndex((img) => img.chapterIdx === chIdx);
    if (firstGlobal >= 0) setCurrentIdx(firstGlobal);
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: '"Futura PT", var(--font-futura), sans-serif',
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
    borderBottom: active ? "1px solid rgba(255,255,255,0.7)" : "1px solid transparent",
    paddingBottom: 4,
    transition: "color 0.2s ease, border-color 0.2s ease",
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px 0",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {chapters.map((ch, i) => (
            <button
              key={i}
              onClick={() => goToChapterFirst(i)}
              style={btnStyle(current?.chapterIdx === i)}
            >
              {ch.title}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            fontSize: 28,
            lineHeight: 1,
            padding: "4px 8px",
            transition: "color 0.2s ease",
            fontFamily: "sans-serif",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.9)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)")
          }
        >
          ×
        </button>
      </div>

      {/* ── Counter ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "8px 40px 0",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: '"Futura PT", var(--font-futura), sans-serif',
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          {currentIdx + 1} / {allImages.length}
        </span>
      </div>

      {/* ── Main image ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "20px 80px",
          minHeight: 0,
        }}
      >
        {/* Prev */}
        {currentIdx > 0 && (
          <button
            onClick={() => setCurrentIdx((i) => i - 1)}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%",
              width: 48,
              height: 48,
              color: "rgba(255,255,255,0.7)",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s ease",
              zIndex: 1,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)")
            }
          >
            ‹
          </button>
        )}

        {current && (
          <img loading="lazy" decoding="async"
            key={current.src}
            src={current.src}
            alt=""
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 8,
              animation: "galleryFadeIn 0.25s ease",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = "0.15";
            }}
          />
        )}

        {/* Next */}
        {currentIdx < allImages.length - 1 && (
          <button
            onClick={() => setCurrentIdx((i) => i + 1)}
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%",
              width: 48,
              height: 48,
              color: "rgba(255,255,255,0.7)",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s ease",
              zIndex: 1,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)")
            }
          >
            ›
          </button>
        )}
      </div>

      {/* ── Thumbnails ── */}
      <div
        ref={thumbnailsRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 40px 28px",
          overflowX: "auto",
          flexShrink: 0,
          scrollbarWidth: "none",
        }}
      >
        {allImages.map((img, i) => (
          <button
            key={i}
            data-thumb-idx={i}
            onClick={() => setCurrentIdx(i)}
            style={{
              border: i === currentIdx ? "2px solid rgba(255,255,255,0.8)" : "2px solid rgba(255,255,255,0.1)",
              borderRadius: 4,
              padding: 0,
              cursor: "pointer",
              opacity: i === currentIdx ? 1 : 0.45,
              transition: "opacity 0.2s ease, border-color 0.2s ease",
              flexShrink: 0,
              background: "none",
            }}
          >
            <img loading="lazy" decoding="async"
              src={img.src}
              alt=""
              style={{
                width: 72,
                height: 45,
                objectFit: "cover",
                borderRadius: 2,
                display: "block",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).parentElement!.style.opacity = "0.1";
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
