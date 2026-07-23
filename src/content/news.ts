export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  imageClass: string;
};

/** Static dummy list removed — live news comes from the admin/DB only. */
export const newsItems: NewsItem[] = [];
