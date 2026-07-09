/**
 * Notion integration for the Journal.
 *
 * Env vars:
 *   NOTION_TOKEN          — Notion internal integration secret
 *   NOTION_JOURNAL_DB_ID  — database ID of the Journal database
 *
 * Database schema: Title (title), Slug (rich_text), Date (date),
 * Tags (multi_select), Excerpt (rich_text), Published (checkbox).
 *
 * NOTE: this file is .tsx (not .ts) because renderBlock returns JSX.
 */

import React from "react";
import Image from "next/image";
import { Client } from "@notionhq/client";

/* ── Types ──────────────────────────────────────────────────── */

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  date: string; // ISO date
  tags: string[];
  excerpt: string;
  cover: string | null;
  readingMinutes: number;
}

export interface JournalPostWithBlocks extends JournalPost {
  blocks: NotionBlock[];
}

/* Minimal structural types — kept loose on purpose so SDK version
   bumps don't break the build. */
interface RichText {
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
  };
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/* ── Client ─────────────────────────────────────────────────── */

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_JOURNAL_DB_ID;

const configured = () => Boolean(process.env.NOTION_TOKEN && DB_ID);

/* ── Helpers ────────────────────────────────────────────────── */

function plain(rich: RichText[] | undefined): string {
  return (rich ?? []).map((t) => t.plain_text).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fileUrl(obj: any): string | null {
  if (!obj) return null;
  if (obj.type === "external") return obj.external?.url ?? null;
  if (obj.type === "file") return obj.file?.url ?? null;
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPage(page: any): JournalPost {
  const p = page.properties ?? {};
  return {
    id: page.id,
    title: plain(p.Title?.title ?? p.Name?.title),
    slug: plain(p.Slug?.rich_text),
    date: p.Date?.date?.start ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tags: (p.Tags?.multi_select ?? []).map((t: any) => t.name),
    excerpt: plain(p.Excerpt?.rich_text),
    cover: fileUrl(page.cover),
    readingMinutes: 1, // filled in from block content below
  };
}

/* ── Reading time ───────────────────────────────────────────── */

/** ~200 wpm for text, plus ~10s per image (photoset-friendly). */
export function estimateReadingMinutes(blocks: NotionBlock[]): number {
  let words = 0;
  let images = 0;
  const walk = (bs: NotionBlock[]) => {
    for (const b of bs) {
      if (b.type === "image") images++;
      const v = b[b.type];
      if (v?.rich_text) {
        words += plain(v.rich_text).split(/\s+/).filter(Boolean).length;
      }
      if (b.children) walk(b.children);
    }
  };
  walk(blocks);
  return Math.max(1, Math.round(words / 200 + (images * 10) / 60));
}

/* ── Fetching ───────────────────────────────────────────────── */

export async function getJournalPosts(): Promise<JournalPost[]> {
  if (!configured()) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];
    let cursor: string | undefined;
    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await notion.databases.query({
        database_id: DB_ID as string,
        filter: { property: "Published", checkbox: { equals: true } },
        sorts: [{ property: "Date", direction: "descending" }],
        start_cursor: cursor,
        page_size: 100,
      });
      results.push(...res.results);
      cursor = res.has_more ? (res.next_cursor as string) : undefined;
    } while (cursor);
    const posts = results.map(mapPage).filter((p) => p.slug && p.title);
    // Reading time needs the body content; fetched in parallel and
    // cached by ISR alongside the listing.
    await Promise.all(
      posts.map(async (p) => {
        try {
          p.readingMinutes = estimateReadingMinutes(await fetchBlocks(p.id, 1));
        } catch {
          p.readingMinutes = 1;
        }
      })
    );
    return posts;
  } catch (err) {
    console.warn("[journal] Failed to fetch posts from Notion:", err);
    return [];
  }
}

const NESTABLE = new Set([
  "bulleted_list_item",
  "numbered_list_item",
  "quote",
  "callout",
  "toggle",
]);

async function fetchBlocks(blockId: string, depth = 0): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...res.results);
    cursor = res.has_more ? (res.next_cursor as string) : undefined;
  } while (cursor);

  if (depth < 2) {
    await Promise.all(
      blocks
        .filter((b) => b.has_children && NESTABLE.has(b.type))
        .map(async (b) => {
          b.children = await fetchBlocks(b.id, depth + 1);
        })
    );
  }
  return blocks;
}

export async function getJournalPost(
  slug: string
): Promise<JournalPostWithBlocks | null> {
  if (!configured()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await notion.databases.query({
      database_id: DB_ID as string,
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Slug", rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    });
    const page = res.results[0];
    if (!page) return null;
    const blocks = await fetchBlocks(page.id);
    return {
      ...mapPage(page),
      blocks,
      readingMinutes: estimateReadingMinutes(blocks),
    };
  } catch (err) {
    console.warn(`[journal] Failed to fetch post "${slug}":`, err);
    return null;
  }
}

/* ── Rich text rendering ────────────────────────────────────── */

export function renderRichText(rich: RichText[] | undefined): React.ReactNode {
  return (rich ?? []).map((t, i) => {
    let node: React.ReactNode = t.plain_text;
    const a = t.annotations;
    if (a?.code) node = <code className="journal-inline-code">{node}</code>;
    if (a?.bold) node = <strong>{node}</strong>;
    if (a?.italic) node = <em>{node}</em>;
    if (a?.strikethrough) node = <s>{node}</s>;
    if (a?.underline) node = <u>{node}</u>;
    if (t.href) {
      node = (
        <a
          className="journal-link"
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {node}
        </a>
      );
    }
    return <React.Fragment key={i}>{node}</React.Fragment>;
  });
}

/* ── Block rendering ────────────────────────────────────────── */

export function renderBlock(block: NotionBlock): React.ReactNode {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph": {
      if (!value.rich_text?.length)
        return <div key={id} className="journal-spacer" aria-hidden />;
      return (
        <p key={id} className="journal-p">
          {renderRichText(value.rich_text)}
        </p>
      );
    }
    case "heading_1":
      return (
        <h2 key={id} className="journal-h journal-h1">
          {renderRichText(value.rich_text)}
        </h2>
      );
    case "heading_2":
      return (
        <h3 key={id} className="journal-h journal-h2">
          {renderRichText(value.rich_text)}
        </h3>
      );
    case "heading_3":
      return (
        <h4 key={id} className="journal-h journal-h3">
          {renderRichText(value.rich_text)}
        </h4>
      );
    case "quote":
      return (
        <blockquote key={id} className="journal-pullquote font-caslon">
          {renderRichText(value.rich_text)}
          {block.children?.length ? (
            <span className="journal-pullquote-attrib">
              {block.children.map((c) => plain(c[c.type]?.rich_text)).join(" ")}
            </span>
          ) : null}
        </blockquote>
      );
    case "image": {
      const url = fileUrl(value);
      if (!url) return null;
      const caption = plain(value.caption);
      return (
        <figure key={id} className="journal-figure">
          <Image
            src={url}
            alt={caption || "Journal image"}
            width={1456}
            height={816}
            sizes="(max-width: 1100px) 100vw, 1100px"
            style={{ width: "100%", height: "auto" }}
          />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }
    case "divider":
      return (
        <div key={id} className="journal-divider" aria-hidden>
          ⁂
        </div>
      );
    case "code":
      return (
        <pre key={id} className="journal-code">
          <code>{plain(value.rich_text)}</code>
        </pre>
      );
    case "callout":
      return (
        <aside key={id} className="journal-callout">
          {value.icon?.emoji && (
            <span className="journal-callout-icon">{value.icon.emoji}</span>
          )}
          <div>
            {renderRichText(value.rich_text)}
            {block.children?.map((c) => renderBlock(c))}
          </div>
        </aside>
      );
    case "bulleted_list_item":
    case "numbered_list_item":
      return (
        <li key={id}>
          {renderRichText(value.rich_text)}
          {block.children?.length ? (
            <ul className="journal-list">
              {block.children.map((c) => renderBlock(c))}
            </ul>
          ) : null}
        </li>
      );
    case "to_do":
      return (
        <p key={id} className="journal-p journal-todo">
          <span aria-hidden>{value.checked ? "☑" : "☐"}</span>{" "}
          {renderRichText(value.rich_text)}
        </p>
      );
    case "video":
    case "embed":
    case "bookmark": {
      const href = value.url ?? fileUrl(value);
      if (!href) return null;
      return (
        <p key={id} className="journal-p">
          <a
            className="journal-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {plain(value.caption) || href}
          </a>
        </p>
      );
    }
    default:
      return null;
  }
}

/** Renders a block array, grouping consecutive list items into ul/ol. */
export function renderBlocks(blocks: NotionBlock[]): React.ReactNode {
  const out: React.ReactNode[] = [];
  let list: NotionBlock[] = [];
  let listType: string | null = null;

  const flush = () => {
    if (!list.length) return;
    const items = list.map((b) => renderBlock(b));
    out.push(
      listType === "numbered_list_item" ? (
        <ol key={`list-${list[0].id}`} className="journal-list">
          {items}
        </ol>
      ) : (
        <ul key={`list-${list[0].id}`} className="journal-list">
          {items}
        </ul>
      )
    );
    list = [];
    listType = null;
  };

  for (const block of blocks) {
    if (
      block.type === "bulleted_list_item" ||
      block.type === "numbered_list_item"
    ) {
      if (listType && listType !== block.type) flush();
      listType = block.type;
      list.push(block);
    } else {
      flush();
      out.push(renderBlock(block));
    }
  }
  flush();
  return out;
}
