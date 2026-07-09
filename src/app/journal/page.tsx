import { getJournalPosts } from "@/lib/notion";
import JournalListing from "./JournalListing";

export const revalidate = 3600;

export default async function JournalPage() {
  const posts = await getJournalPosts();
  return <JournalListing posts={posts} />;
}
