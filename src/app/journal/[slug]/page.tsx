import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getJournalPost, getJournalPosts, renderBlocks } from "@/lib/notion";
import ScrollProgress from "./ScrollProgress";
import PostRail from "./PostRail";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) return { title: "Journal — Daniel Gratza" };
  return {
    title: `${post.title} — Journal — Daniel Gratza`,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      ...(post.cover ? { images: [{ url: post.cover }] } : {}),
    },
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([
    getJournalPost(slug),
    getJournalPosts(),
  ]);
  if (!post) notFound();

  // Next post: the one after this in the date-desc feed, wrapping around.
  const idx = posts.findIndex((p) => p.slug === post.slug);
  const nextPost =
    posts.length > 1 && idx !== -1 ? posts[(idx + 1) % posts.length] : null;

  const kicker = (
    <p className="journal-post-kicker font-futura">
      <span>{formatDate(post.date)}</span>
      <span>{post.readingMinutes} min read</span>
      {post.tags.length > 0 && <span>{post.tags.join(" · ")}</span>}
    </p>
  );

  return (
    <main>
      <ScrollProgress />
      <PostRail />

      {post.cover ? (
        <section className="journal-cover">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            priority
            sizes="100vw"
          />
          <div className="journal-cover-shade" aria-hidden />
          <div className="journal-cover-inner">
            {kicker}
            <h1 className="journal-post-title font-caslon">{post.title}</h1>
          </div>
        </section>
      ) : (
        <header className="journal-post-header">
          {kicker}
          <h1 className="journal-post-title font-caslon">{post.title}</h1>
        </header>
      )}

      <article className="journal-article">{renderBlocks(post.blocks)}</article>

      <footer className="journal-post-footer">
        {post.tags.length > 0 && (
          <div className="journal-post-tags">
            {post.tags.map((tag) => (
              <Link key={tag} href="/journal" className="journal-chip">
                {tag}
              </Link>
            ))}
          </div>
        )}

        {nextPost && (
          <Link href={`/journal/${nextPost.slug}`} className="journal-next">
            <p className="journal-next-label font-futura">Next entry</p>
            <div className="journal-next-row">
              <p className="journal-next-title font-caslon">{nextPost.title}</p>
              {nextPost.cover && (
                <div className="journal-next-thumb">
                  <Image
                    src={nextPost.cover}
                    alt={nextPost.title}
                    fill
                    sizes="120px"
                  />
                </div>
              )}
            </div>
          </Link>
        )}
      </footer>
    </main>
  );
}
