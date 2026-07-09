"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { JournalPost } from "@/lib/notion";

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* Travel photosets are image-first (they have covers); field notes
   (úvahy) are small text posts without one. */
const isPhotoset = (p: JournalPost) => Boolean(p.cover);

/* ── Scroll-reveal wrapper ──────────────────────────────────── */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`journal-reveal${visible ? " visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Cards ──────────────────────────────────────────────────── */

function PhotoCard({ post, hero = false }: { post: JournalPost; hero?: boolean }) {
  return (
    <Link href={`/journal/${post.slug}`} className="journal-card">
      <div className="journal-card-img">
        {post.cover && (
          <Image
            src={post.cover}
            alt=""
            fill
            sizes={hero ? "100vw" : "(max-width: 840px) 100vw, 50vw"}
          />
        )}
      </div>
      <div className="journal-card-meta">
        <span className="type">Photoset</span>
        <span>{formatDate(post.date)}</span>
        <span className="read">{post.readingMinutes} min read</span>
        {post.tags.length > 0 && <span className="tags">{post.tags.join(" · ")}</span>}
      </div>
      <h2 className="journal-card-title font-caslon">{post.title}</h2>
      {post.excerpt && <p className="journal-card-excerpt">{post.excerpt}</p>}
    </Link>
  );
}

function NoteCard({ post }: { post: JournalPost }) {
  return (
    <Link href={`/journal/${post.slug}`} className="journal-card journal-note">
      <div className="journal-card-meta">
        <span className="type">Field note</span>
        <span>{formatDate(post.date)}</span>
        <span className="read">{post.readingMinutes} min read</span>
        {post.tags.length > 0 && <span className="tags">{post.tags.join(" · ")}</span>}
      </div>
      <h2 className="journal-card-title font-caslon">{post.title}</h2>
      {post.excerpt && <p className="journal-note-excerpt">{post.excerpt}</p>}
      <span className="journal-note-more">Read the note →</span>
    </Link>
  );
}

/* ── Listing ────────────────────────────────────────────────── */

type Filter = "all" | "photo" | "note" | { tag: string };

export default function JournalListing({ posts }: { posts: JournalPost[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    if (filter === "all") return posts;
    if (filter === "photo") return posts.filter(isPhotoset);
    if (filter === "note") return posts.filter((p) => !isPhotoset(p));
    return posts.filter((p) => p.tags.includes(filter.tag));
  }, [posts, filter]);

  const isActive = (f: Filter) =>
    typeof f === "string"
      ? filter === f
      : typeof filter !== "string" && filter.tag === f.tag;

  const filterKey = typeof filter === "string" ? filter : `tag-${filter.tag}`;

  // Hero: the newest photoset in the current selection (notes stay in the grid)
  const hero = filtered.find(isPhotoset);
  const rest = filtered.filter((p) => p !== hero);

  return (
    <main>
      <header className="journal-header">
        <p className="journal-kicker font-futura">Field Notes &amp; Travel Signals</p>
        <h1 className="journal-title font-caslon">Journal</h1>
        <p className="journal-sub">
          Photosets from the road and small thoughts in between — written
          after dark.
        </p>
      </header>

      <nav className="journal-chips" aria-label="Filter journal entries">
        <button
          className="journal-chip"
          aria-pressed={isActive("all")}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className="journal-chip"
          aria-pressed={isActive("photo")}
          onClick={() => setFilter("photo")}
        >
          Photosets
        </button>
        <button
          className="journal-chip"
          aria-pressed={isActive("note")}
          onClick={() => setFilter("note")}
        >
          Field notes
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className="journal-chip"
            aria-pressed={isActive({ tag })}
            onClick={() => setFilter(isActive({ tag }) ? "all" : { tag })}
          >
            {tag}
          </button>
        ))}
      </nav>

      <p className="journal-sr-only" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "entry" : "entries"} shown
      </p>

      {filtered.length === 0 ? (
        <div className="journal-empty">
          <p className="font-caslon">The pages are still blank.</p>
          <p>Nothing published here yet — come back after dark.</p>
        </div>
      ) : (
        /* key remounts the feed on filter change → entrance animations replay */
        <div className="journal-feed" key={filterKey}>
          {hero && (
            <Reveal className="journal-hero">
              <PhotoCard post={hero} hero />
            </Reveal>
          )}

          {rest.length > 0 && (
            <div className="journal-grid">
              {rest.map((post, i) => (
                <Reveal key={post.id} delay={(i % 4) * 110}>
                  {isPhotoset(post) ? (
                    <PhotoCard post={post} />
                  ) : (
                    <NoteCard post={post} />
                  )}
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
