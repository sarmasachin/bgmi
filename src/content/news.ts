export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  imageClass: string;
};

export const newsItems: NewsItem[] = [
  {
    id: "rtx-5090-benchmark-results",
    title: "RTX 5090 Benchmark Results Leaked",
    excerpt:
      "New leaks suggest the RTX 5090 could be 2x faster than its predecessor in ray-tracing tasks.",
    category: "PC FEATURED",
    publishedAt: "MARCH 26, 2026 · 10:30 AM",
    imageClass: "news-image-1",
  },
  {
    id: "steam-spring-sale-top-10-deals",
    title: "Steam Spring Sale: Top 10 Deals",
    excerpt:
      "Grab your favorite titles with up to 90% discount before the sale ends this weekend.",
    category: "PC",
    publishedAt: "25 MAR · 04:15 PM",
    imageClass: "news-image-2",
  },
  {
    id: "cyberpunk-2077-new-patch-notes",
    title: "Cyberpunk 2077 New Patch Notes",
    excerpt:
      "CD Projekt Red releases a surprise stability update for high-end PC configurations.",
    category: "PC",
    publishedAt: "24 MAR · 11:20 AM",
    imageClass: "news-image-3",
  },
  {
    id: "valorant-new-agent-abilities",
    title: "Valorant New Agent Abilities",
    excerpt:
      "Leaked footage reveals a teleportation mechanic that could change the meta forever.",
    category: "PC",
    publishedAt: "23 MAR · 09:00 AM",
    imageClass: "news-image-4",
  },
  {
    id: "best-gaming-keyboards-2026",
    title: "Best Gaming Keyboards of 2026",
    excerpt:
      "We tested over 50 mechanical keyboards to find the best switches for pro gamers.",
    category: "PC",
    publishedAt: "22 MAR · 06:45 PM",
    imageClass: "news-image-5",
  },
];
