import { randomUUID } from "crypto";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";

/** Hard cap for publicly shown / approved testimonials (FIFO on approve). */
export const MAX_APPROVED_TESTIMONIALS = 20;

export type TestimonialGame = "bgmi" | "pubg" | "freefire" | "freefire-max";
export type TestimonialStatus = "pending" | "approved" | "rejected";

export type TestimonialRecord = {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  message: string;
  game: TestimonialGame;
  phoneModel: string | null;
  showName: boolean;
  status: TestimonialStatus;
  createdAt: Date;
  approvedAt: Date | null;
};

export type CreateTestimonialInput = {
  name: string;
  email: string;
  rating: number;
  message: string;
  game: TestimonialGame;
  phoneModel?: string | null;
  showName: boolean;
};

/** Public-safe shape (never exposes rejected/pending). */
export type PublicTestimonial = {
  id: string;
  name: string;
  rating: number;
  message: string;
  game: TestimonialGame;
  phoneModel: string | null;
  createdAt: string;
};

type MockRow = TestimonialRecord;

const mockTestimonials: MockRow[] = [];

/** Coalesce concurrent identical submits in the same process (double-click race). */
const inflightCreates = new Map<string, Promise<TestimonialRecord | null>>();

function fingerprint(input: {
  name: string;
  rating: number;
  message: string;
  game: string;
}) {
  return `${input.name}|${input.rating}|${input.message}|${input.game}`;
}

function isGame(value: string): value is TestimonialGame {
  return (
    value === "bgmi" ||
    value === "pubg" ||
    value === "freefire" ||
    value === "freefire-max"
  );
}

function isStatus(value: string): value is TestimonialStatus {
  return value === "pending" || value === "approved" || value === "rejected";
}

function mapRow(row: {
  id: string;
  name: string;
  email?: string | null;
  rating: number;
  message: string;
  game: string;
  phoneModel: string | null;
  showName: boolean;
  status: string;
  createdAt: Date;
  approvedAt: Date | null;
}): TestimonialRecord | null {
  if (!isGame(row.game) || !isStatus(row.status)) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email?.trim() ? row.email.trim().toLowerCase() : null,
    rating: row.rating,
    message: row.message,
    game: row.game,
    phoneModel: row.phoneModel,
    showName: row.showName,
    status: row.status,
    createdAt: row.createdAt,
    approvedAt: row.approvedAt,
  };
}

function toPublic(row: TestimonialRecord): PublicTestimonial {
  return {
    id: row.id,
    name: row.showName ? row.name : "Anonymous",
    rating: row.rating,
    message: row.message,
    game: row.game,
    phoneModel: row.phoneModel,
    createdAt: row.createdAt.toISOString(),
  };
}

function displayNameForCreate(name: string) {
  return name.trim().slice(0, 80);
}

/**
 * Keep only the newest MAX_APPROVED_TESTIMONIALS approved rows.
 * Deletes oldest by approvedAt (fallback createdAt).
 */
async function trimApprovedOverflowDb() {
  const approved = await prisma.testimonial.findMany({
    where: { status: "approved" },
    orderBy: [{ approvedAt: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  if (approved.length <= MAX_APPROVED_TESTIMONIALS) return 0;
  const excess = approved.length - MAX_APPROVED_TESTIMONIALS;
  const toDelete = approved.slice(0, excess).map((row) => row.id);
  await prisma.testimonial.deleteMany({ where: { id: { in: toDelete } } });
  return toDelete.length;
}

function trimApprovedOverflowMock() {
  const approved = mockTestimonials
    .filter((row) => row.status === "approved")
    .sort((a, b) => {
      const aTime = (a.approvedAt ?? a.createdAt).getTime();
      const bTime = (b.approvedAt ?? b.createdAt).getTime();
      return aTime - bTime;
    });
  if (approved.length <= MAX_APPROVED_TESTIMONIALS) return 0;
  const excess = approved.length - MAX_APPROVED_TESTIMONIALS;
  const removeIds = new Set(approved.slice(0, excess).map((row) => row.id));
  for (let i = mockTestimonials.length - 1; i >= 0; i--) {
    if (removeIds.has(mockTestimonials[i].id)) {
      mockTestimonials.splice(i, 1);
    }
  }
  return excess;
}

export async function createTestimonial(
  input: CreateTestimonialInput,
): Promise<TestimonialRecord | null> {
  const data = {
    name: displayNameForCreate(input.name),
    email: input.email.trim().toLowerCase().slice(0, 200),
    rating: input.rating,
    message: input.message.trim().slice(0, 300),
    game: input.game,
    phoneModel: input.phoneModel?.trim() ? input.phoneModel.trim().slice(0, 80) : null,
    showName: input.showName,
    status: "pending" as const,
  };

  const key = fingerprint(data);
  const existingInflight = inflightCreates.get(key);
  if (existingInflight) {
    return existingInflight;
  }

  const run = (async (): Promise<TestimonialRecord | null> => {
    // Deduplicate rapid double-submits (double-click / retry before response).
    const since = new Date(Date.now() - 120_000);
    const existing = await tryPrismaLong(async () =>
      prisma.testimonial.findFirst({
        where: {
          name: data.name,
          rating: data.rating,
          message: data.message,
          game: data.game,
          status: "pending",
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
      }),
    );
    if (existing) {
      const mapped = mapRow(existing);
      if (mapped) return mapped;
    }

    // Use long timeout — short tryPrisma can time out after create already committed.
    const dbRow = await tryPrismaLong(async () =>
      prisma.testimonial.create({
        data,
      }),
    );

    if (dbRow) {
      return mapRow(dbRow);
    }

    // Dev fallback when DB is down — still accept submissions in-memory.
    if (process.env.NODE_ENV === "production") {
      return null;
    }

    const mockDup = mockTestimonials.find(
      (row) =>
        row.status === "pending" &&
        row.name === data.name &&
        row.rating === data.rating &&
        row.message === data.message &&
        row.game === data.game &&
        row.createdAt.getTime() >= since.getTime(),
    );
    if (mockDup) return { ...mockDup };

    const now = new Date();
    const row: MockRow = {
      id: randomUUID(),
      ...data,
      phoneModel: data.phoneModel,
      createdAt: now,
      approvedAt: null,
    };
    mockTestimonials.unshift(row);
    return row;
  })();

  inflightCreates.set(key, run);
  try {
    return await run;
  } finally {
    // Keep briefly so a sequential immediate retry still coalesces.
    setTimeout(() => {
      if (inflightCreates.get(key) === run) inflightCreates.delete(key);
    }, 2000);
  }
}

/** Public list: approved only, newest first, hard-capped at 20. */
export async function listApprovedTestimonials(options?: {
  game?: TestimonialGame;
}): Promise<PublicTestimonial[]> {
  const game = options?.game;

  const dbRows = await tryPrisma(async () =>
    prisma.testimonial.findMany({
      where: {
        status: "approved",
        ...(game ? { game } : {}),
      },
      orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
      take: MAX_APPROVED_TESTIMONIALS,
    }),
  );

  if (dbRows) {
    return dbRows
      .map(mapRow)
      .filter((row): row is TestimonialRecord => row != null)
      .map(toPublic);
  }

  return mockTestimonials
    .filter((row) => row.status === "approved" && (!game || row.game === game))
    .sort((a, b) => {
      const aTime = (a.approvedAt ?? a.createdAt).getTime();
      const bTime = (b.approvedAt ?? b.createdAt).getTime();
      return bTime - aTime;
    })
    .slice(0, MAX_APPROVED_TESTIMONIALS)
    .map(toPublic);
}

export async function listAdminTestimonials(options?: {
  status?: TestimonialStatus;
}): Promise<TestimonialRecord[]> {
  const status = options?.status;

  const dbRows = await tryPrisma(async () =>
    prisma.testimonial.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  );

  if (dbRows) {
    return dbRows
      .map(mapRow)
      .filter((row): row is TestimonialRecord => row != null);
  }

  return mockTestimonials
    .filter((row) => !status || row.status === status)
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function countApprovedTestimonials(): Promise<number | null> {
  const count = await tryPrisma(async () =>
    prisma.testimonial.count({ where: { status: "approved" } }),
  );
  if (count !== null) return count;
  if (process.env.NODE_ENV === "production") return null;
  return mockTestimonials.filter((row) => row.status === "approved").length;
}

export async function setTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Promise<
  | { ok: true; item: TestimonialRecord; trimmed: number }
  | { ok: false; error: "not_found" | "unavailable" }
> {
  const now = new Date();

  const dbResult = await tryPrismaLong(async () => {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return { kind: "missing" as const };

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        status,
        approvedAt: status === "approved" ? now : null,
      },
    });

    let trimmed = 0;
    if (status === "approved") {
      trimmed = await trimApprovedOverflowDb();
    }

    const mapped = mapRow(updated);
    if (!mapped) return { kind: "missing" as const };
    return { kind: "ok" as const, item: mapped, trimmed };
  });

  if (dbResult?.kind === "ok") {
    return { ok: true, item: dbResult.item, trimmed: dbResult.trimmed };
  }
  if (dbResult?.kind === "missing") {
    return { ok: false, error: "not_found" };
  }

  // DB timed out / unavailable — never pretend mock approve succeeded in production.
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: "unavailable" };
  }

  const item = mockTestimonials.find((row) => row.id === id);
  if (!item) return { ok: false, error: "not_found" };
  item.status = status;
  item.approvedAt = status === "approved" ? now : null;
  const trimmed = status === "approved" ? trimApprovedOverflowMock() : 0;
  return { ok: true, item: { ...item }, trimmed };
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const dbOk = await tryPrisma(async () => {
    await prisma.testimonial.delete({ where: { id } });
    return true;
  });
  if (dbOk) return true;

  if (process.env.NODE_ENV === "production") return false;

  const index = mockTestimonials.findIndex((row) => row.id === id);
  if (index === -1) return false;
  mockTestimonials.splice(index, 1);
  return true;
}
