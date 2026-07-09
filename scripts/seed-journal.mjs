/**
 * Seeds the Notion Journal database with dummy posts.
 *
 * Run from the project root:
 *   node scripts/seed-journal.mjs
 *
 * Reads NOTION_TOKEN and NOTION_JOURNAL_DB_ID from .env.local.
 * Safe to re-run: posts whose slug already exists are skipped.
 */

import { readFileSync } from "node:fs";
import { Client } from "@notionhq/client";

/* ── env ────────────────────────────────────────────────────── */

function loadEnv(path = ".env.local") {
  try {
    const lines = readFileSync(path, "utf8").split("\n");
    for (const line of lines) {
      const i = line.indexOf("=");
      if (i === -1 || line.trim().startsWith("#")) continue;
      const key = line.slice(0, i).trim();
      const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* fall through to process.env */
  }
}
loadEnv();

const { NOTION_TOKEN, NOTION_JOURNAL_DB_ID } = process.env;
if (!NOTION_TOKEN || !NOTION_JOURNAL_DB_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_JOURNAL_DB_ID (.env.local)");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

/* ── helpers ────────────────────────────────────────────────── */

const rt = (text, annotations = {}) => ({
  type: "text",
  text: { content: text },
  annotations,
});

const p = (...parts) => ({
  paragraph: { rich_text: parts.map((x) => (typeof x === "string" ? rt(x) : x)) },
});
const h2 = (text) => ({ heading_1: { rich_text: [rt(text)] } });
const h3 = (text) => ({ heading_2: { rich_text: [rt(text)] } });
const quote = (text) => ({ quote: { rich_text: [rt(text)] } });
const divider = () => ({ divider: {} });
const bullet = (text) => ({ bulleted_list_item: { rich_text: [rt(text)] } });
const img = (url, caption) => ({
  image: {
    type: "external",
    external: { url },
    caption: caption ? [rt(caption)] : [],
  },
});
const code = (text, language = "plain text") => ({
  code: { rich_text: [rt(text)], language },
});

const pic = (id, w = 1600, h = 1000) => `https://picsum.photos/id/${id}/${w}/${h}`;

/* ── content ────────────────────────────────────────────────── */

const posts = [
  {
    title: "The Weight of Empty Space",
    slug: "the-weight-of-empty-space",
    date: "2026-06-21",
    tags: ["Design", "Craft"],
    excerpt:
      "Whitespace isn't the absence of design. It's the part of the room where you're allowed to breathe.",
    cover: pic(1015),
    children: [
      p(
        "There is a moment in every project when someone looks at the layout and says: there's too much empty space here. Can we fill it? And every time, I feel the same small grief — because the emptiness was the point."
      ),
      p(
        "Empty space is not leftover space. It is load-bearing. It tells the eye where to rest, what matters, and — more quietly — what doesn't."
      ),
      quote("Silence is not the absence of music. It is the part the composer wrote last."),
      h2("What the room teaches"),
      p(
        "Walk into a cluttered room and your shoulders rise. Walk into a sparse one and they drop. Interfaces work on the same nervous system. Density is a mood, and most products are furious without knowing it."
      ),
      img(pic(1040, 1600, 900), "A room that knows what to leave out."),
      p(
        "The discipline is not in adding restraint at the end, like garnish. It's in refusing early — cutting the third button, the second headline, the reassuring paragraph nobody will read."
      ),
      divider(),
      h3("Three tests I use"),
      bullet("Squint until the screen blurs. What survives is your actual hierarchy."),
      bullet("Remove one element. If nobody would notice, it was already gone."),
      bullet("Read it aloud. Interfaces that can't be spoken are usually overwritten."),
      p(
        "None of this is new. It's just easy to forget at 11pm, when the deadline is close and filling space feels like progress."
      ),
    ],
  },
  {
    title: "Notes from a Night Train",
    slug: "notes-from-a-night-train",
    date: "2026-05-30",
    tags: ["Travel", "Photography"],
    excerpt:
      "Twelve hours between two cities, one window, and the particular honesty of things seen at 3am.",
    cover: pic(1036),
    children: [
      p(
        "The night train from Vienna leaves at 22:40 and for the first hour everyone pretends they will sleep. Then the lights dim, the carriage settles, and the window becomes a slow cinema of sodium lamps and empty platforms."
      ),
      img(pic(1011, 1600, 1000), "Somewhere after midnight, between stations."),
      p(
        "I photograph badly on trains and I've stopped minding. The blur is the truth of it — nothing at 3am holds still, least of all your own thinking."
      ),
      quote("A window seat at night is the cheapest editing room in the world."),
      h2("What travels with you"),
      p(
        "Problems board the train with you, but they behave differently in motion. The product decision I'd been circling for a week resolved itself somewhere in Moravia, unprompted, while I watched a factory glow past."
      ),
      p(
        "I suspect this is why I keep this journal. Not to publish conclusions, but to give the unfinished thoughts a compartment of their own."
      ),
      divider(),
      p("Arrived at 6:10. Coffee. The city still had its lights on."),
    ],
  },
  {
    title: "On Building Rooms You'll Never See",
    slug: "rooms-youll-never-see",
    date: "2026-05-09",
    tags: ["Process", "Design"],
    excerpt:
      "Most of the work that matters ships invisible: the states nobody hits, the errors nobody triggers, the care nobody notices.",
    cover: pic(1018),
    children: [
      p(
        "A carpenter I once read about finished the backs of drawers — the surfaces no one would ever see — with the same care as the fronts. Asked why, he said: because I'll know."
      ),
      p(
        "Software is mostly backs of drawers. Empty states, error recoveries, the loading skeleton that appears for 400 milliseconds, the focus outline for someone navigating by keyboard at midnight."
      ),
      h2("The unglamorous inventory"),
      bullet("The error message that apologises without grovelling."),
      bullet("The empty state that teaches instead of shrugging."),
      bullet("The offline mode nobody demos on stage."),
      quote("Quality is what remains when the screenshot is cropped."),
      img(pic(1043, 1600, 900), "The back of the drawer."),
      p(
        "None of this shows up in the portfolio hero image. All of it shows up in whether people trust the thing. Trust is accumulated in rooms the user never consciously enters."
      ),
      divider(),
      p("Finish the backs of the drawers. You'll know."),
    ],
  },
  {
    title: "Darkroom Light",
    slug: "darkroom-light",
    date: "2026-04-17",
    tags: ["Photography"],
    excerpt:
      "On red lamps, slow chemistry, and why waiting for an image is different from receiving one.",
    cover: pic(1069),
    children: [
      p(
        "The first time I stood in a real darkroom, what surprised me wasn't the dark. It was the patience. You cannot rush paper in a tray. The image arrives at its own pace, like something surfacing from deep water."
      ),
      img(pic(1050, 1600, 1000), "Everything worth seeing arrives slowly."),
      p(
        "Digital gave us the instant preview and took away the arrival. I don't romanticise film — I like autofocus and I like not paying per mistake — but I miss the ceremony of not knowing yet."
      ),
      quote("Under red light, every photograph is still every photograph it might become."),
      h2("A slower loop"),
      p(
        "I've started imposing artificial darkroom rules on my digital work: shoot all day, look at nothing until the next morning. The photographs are the same. The looking is entirely different."
      ),
      p(
        "The same trick works on design files. Close the laptop. Let the layout develop overnight in the tray of your head. What's wrong with it is usually obvious by breakfast."
      ),
    ],
  },
  {
    title: "A Field Guide to Unfinished Things",
    slug: "field-guide-to-unfinished-things",
    date: "2026-03-28",
    tags: ["Craft", "Life"],
    excerpt:
      "An honest taxonomy of the projects in my drawer: the sleeping, the compost, and the ones that got away.",
    cover: pic(1039),
    children: [
      p(
        "My projects folder is a graveyard, if you ask my inner critic. A garden, if you ask me on a good day. Here is the honest taxonomy."
      ),
      h2("The sleeping"),
      p(
        "Not dead — dormant. They wait for a missing piece: a technology that isn't ready, a skill I haven't earned, a version of me that hasn't shown up yet. Checking on them yearly is enough."
      ),
      h2("The compost"),
      p(
        "Projects that will never ship but feed everything else. The abandoned game taught me animation timing. The dead startup taught me what a real problem smells like. Nothing rots for free."
      ),
      code("mv ~/projects/brilliant-idea ~/compost/\n# not deleted. transformed.", "bash"),
      h2("The ones that got away"),
      p(
        "A small number were genuinely good and genuinely mistimed. It's tempting to grieve these. I try instead to remember that ideas are weather — fronts that pass over everyone, and land where conditions are right."
      ),
      quote("An unfinished thing is only a failure if you finish calling it one."),
      divider(),
      p(
        "This journal is, of course, category one, two, and three at once. We'll see which wins."
      ),
    ],
  },
];

/* ── seed ───────────────────────────────────────────────────── */

async function main() {
  // Detect the title property's actual name (Title vs Name).
  const db = await notion.databases.retrieve({ database_id: NOTION_JOURNAL_DB_ID });
  const titleProp =
    Object.entries(db.properties).find(([, v]) => v.type === "title")?.[0] ?? "Title";
  const propNames = Object.keys(db.properties);
  for (const required of ["Slug", "Date", "Tags", "Excerpt", "Published"]) {
    if (!propNames.includes(required)) {
      console.warn(`⚠ Property "${required}" not found in database (has: ${propNames.join(", ")})`);
    }
  }

  for (const post of posts) {
    const existing = await notion.databases.query({
      database_id: NOTION_JOURNAL_DB_ID,
      filter: { property: "Slug", rich_text: { equals: post.slug } },
      page_size: 1,
    });
    if (existing.results.length) {
      console.log(`↷ Skipping (exists): ${post.title}`);
      continue;
    }

    await notion.pages.create({
      parent: { database_id: NOTION_JOURNAL_DB_ID },
      cover: { type: "external", external: { url: post.cover } },
      properties: {
        [titleProp]: { title: [rt(post.title)] },
        Slug: { rich_text: [rt(post.slug)] },
        Date: { date: { start: post.date } },
        Tags: { multi_select: post.tags.map((name) => ({ name })) },
        Excerpt: { rich_text: [rt(post.excerpt)] },
        Published: { checkbox: true },
      },
      children: post.children,
    });
    console.log(`✔ Created: ${post.title}`);
  }
  console.log("\nDone. Visit /journal — first load may take a moment (ISR).");
}

main().catch((err) => {
  console.error(err.body ?? err);
  process.exit(1);
});
