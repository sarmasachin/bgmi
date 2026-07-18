import { randomUUID } from "crypto";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

/** Hard cap for publicly shown / approved testimonials (FIFO on approve). */
export const MAX_APPROVED_TESTIMONIALS = 20;

export type TestimonialGame = "bgmi" | "pubg";
export type TestimonialStatus = "pending" | "approved" | "rejected";

export type TestimonialRecord = {
  id: string;
  name: string;
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

function isGame(value: string): value is TestimonialGame {
  return value === "bgmi" || value === "pubg";
}

function isStatus(value: string): value is TestimonialStatus {
  return value === "pending" || value === "approved" || value === "rejected";
}

function mapRow(row: {
  id: string;
  name: string;
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
    rating: input.rating,
    message: input.message.trim().slice(0, 300),
    game: input.game,
    phoneModel: input.phoneModel?.trim() ? input.phoneModel.trim().slice(0, 80) : null,
    showName: input.showName,
    status: "pending" as const,
  };

  const dbRow = await tryPrisma(async () =>
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
): Promise<{ item: TestimonialRecord; trimmed: number } | null> {
  const now = new Date();

  const dbResult = await tryPrisma(async () => {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return null;

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
    if (!mapped) return null;
    return { item: mapped, trimmed };
  });

  if (dbResult) return dbResult;

  const item = mockTestimonials.find((row) => row.id === id);
  if (!item) return null;
  item.status = status;
  item.approvedAt = status === "approved" ? now : null;
  const trimmed = status === "approved" ? trimApprovedOverflowMock() : 0;
  return { item: { ...item }, trimmed };
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
