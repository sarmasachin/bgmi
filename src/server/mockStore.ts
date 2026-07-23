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
  topic?: string;
  status: string;
  etaHours?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type LegalPage = {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type MockRoleDefinition = {
  id: string;
  name: string;
  permissions: unknown;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

type MockStore = {
  news: News[];
  pages: PageClone[];
  comments: Array<{ id: string; name: string; message: string; status: string; newsId: string }>;
  contactMessages: ContactMessage[];
  legalPages: LegalPage[];
  ads: AdSlot[];
  users: Array<{
    id: string;
    email: string;
    role: string;
    active: boolean;
    name?: string | null;
    passwordHash?: string;
    permissions?: unknown;
    roleDefinitionId?: string | null;
  }>;
  roleDefinitions: MockRoleDefinition[];
};

function createMockStore(): MockStore {
  const now = new Date().toISOString();
  return {
    news: [],
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
    ],
    comments: [],
    contactMessages: [],
    legalPages: [],
    ads: [
      { id: "a1", slotKey: "home_above_calculator", enabled: false, code: "" },
      { id: "a2", slotKey: "home_between_tool_and_article", enabled: false, code: "" },
      { id: "a3", slotKey: "news_list_top", enabled: false, code: "" },
      { id: "a4", slotKey: "news_list_bottom", enabled: false, code: "" },
      { id: "a5", slotKey: "news_detail_top", enabled: false, code: "" },
      { id: "a6", slotKey: "news_detail_mid", enabled: false, code: "" },
      { id: "a7", slotKey: "news_detail_bottom", enabled: false, code: "" },
    ],
    users: [
      {
        id: "u1",
        email: "admin@example.com",
        role: "superadmin",
        active: true,
        permissions: [],
        roleDefinitionId: "role-superadmin",
      },
    ],
    roleDefinitions: [
      {
        id: "role-superadmin",
        name: "superadmin",
        permissions: [],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "role-subadmin",
        name: "subadmin",
        permissions: ["dashboard.view", "contact.view", "contact.reply"],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

const globalForMock = globalThis as typeof globalThis & {
  __bgmiMockStore?: MockStore;
  __bgmiNewsSeedVersion?: number;
};

/** Shared across Next.js route module instances when DB is unavailable. */
export const mockStore = globalForMock.__bgmiMockStore ?? createMockStore();
if (!globalForMock.__bgmiMockStore) globalForMock.__bgmiMockStore = mockStore;
if (!Array.isArray(mockStore.legalPages)) mockStore.legalPages = [];
/** Bump to wipe legacy in-memory seed news (home hub stays hidden until real posts). */
const NEWS_SEED_VERSION = 2;
if (globalForMock.__bgmiNewsSeedVersion !== NEWS_SEED_VERSION) {
  mockStore.news = [];
  mockStore.comments = [];
  globalForMock.__bgmiNewsSeedVersion = NEWS_SEED_VERSION;
}
if (!Array.isArray(mockStore.roleDefinitions) || mockStore.roleDefinitions.length === 0) {
  const now = new Date().toISOString();
  mockStore.roleDefinitions = [
    {
      id: "role-superadmin",
      name: "superadmin",
      permissions: [],
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "role-subadmin",
      name: "subadmin",
      permissions: ["dashboard.view", "contact.view", "contact.reply"],
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function exportMockBackup() {
  return JSON.parse(JSON.stringify(mockStore));
}

export function restoreMockBackup(payload: typeof mockStore) {
  mockStore.news = payload.news ?? [];
  mockStore.pages = payload.pages ?? [];
  mockStore.comments = payload.comments ?? [];
  mockStore.contactMessages = payload.contactMessages ?? [];
  mockStore.legalPages = payload.legalPages ?? [];
  mockStore.ads = payload.ads ?? [];
  mockStore.users = payload.users ?? [];
  mockStore.roleDefinitions = payload.roleDefinitions ?? mockStore.roleDefinitions;
}

