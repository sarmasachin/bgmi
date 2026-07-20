type News = {
  id: string;
  title: string;
  slug: string;
  status: string;
  excerpt?: string;
  content?: unknown;
  featureImage?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  publishedAt?: string | Date | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

type PageClone = {
  id: string;
  title: string;
  slug: string;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  publishAsNews?: boolean;
  content?: unknown;
};

type AdSlot = {
  id: string;
  slotKey: string;
  enabled: boolean;
  code?: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export const mockStore = {
  news: [
    { id: "n1", title: "RTX 5090 Benchmark Results Leaked", slug: "rtx-5090", status: "published" },
  ] as News[],
  pages: [
    {
      id: "p1",
      title: "BGMI Default Home",
      slug: "/",
      status: "published",
      seoTitle: "Sensitivity Settings",
      seoDescription: "Default homepage template for cloned pages.",
      content: { html: "<h2>Default Home Article</h2><p>Clone pages copy this article content.</p>" },
    },
  ] as PageClone[],
  comments: [{ id: "c1", name: "User", message: "Nice post", status: "pending", newsId: "n1" }],
  contactMessages: [] as ContactMessage[],
  ads: [
    { id: "a1", slotKey: "home_above_calculator", enabled: false, code: "" },
    { id: "a2", slotKey: "home_between_tool_and_article", enabled: false, code: "" },
    { id: "a3", slotKey: "news_list_top", enabled: false, code: "" },
    { id: "a4", slotKey: "news_list_bottom", enabled: false, code: "" },
    { id: "a5", slotKey: "news_detail_top", enabled: false, code: "" },
    { id: "a6", slotKey: "news_detail_mid", enabled: false, code: "" },
    { id: "a7", slotKey: "news_detail_bottom", enabled: false, code: "" },
  ] as AdSlot[],
  users: [{ id: "u1", email: "admin@example.com", role: "admin", active: true }],
};

export function exportMockBackup() {
  return JSON.parse(JSON.stringify(mockStore));
}

export function restoreMockBackup(payload: typeof mockStore) {
  mockStore.news = payload.news ?? [];
  mockStore.pages = payload.pages ?? [];
  mockStore.comments = payload.comments ?? [];
  mockStore.contactMessages = payload.contactMessages ?? [];
  mockStore.ads = payload.ads ?? [];
  mockStore.users = payload.users ?? [];
}
