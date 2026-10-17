import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { mockTestimonials } from "@/src/server/repositories/testimonialsDummy";
import {
  MAX_APPROVED_TESTIMONIALS,
  type PublicTestimonial,
  type TestimonialGame,
  type TestimonialRecord,
} from "@/src/server/repositories/testimonialsTypes";

const ALL_TESTIMONIAL_GAMES: TestimonialGame[] = [
  "bgmi",
  "bgmi-lite",
  "pubg",
  "pubg-mobile-lite",
  "freefire",
  "freefire-max",
];

function sortApprovedNewest(a: TestimonialRecord, b: TestimonialRecord) {
  const aTime = (a.approvedAt ?? a.createdAt).getTime();
  const bTime = (b.approvedAt ?? b.createdAt).getTime();
  return bTime - aTime;
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

function isGame(value: string): value is TestimonialGame {
  return (
    value === "bgmi" ||
    value === "bgmi-lite" ||
    value === "pubg" ||
    value === "pubg-mobile-lite" ||
    value === "freefire" ||
    value === "freefire-max"
  );
}

function mapApprovedRow(row: {
  id: string;
  name: string;
  rating: number;
  message: string;
  game: string;
  phoneModel: string | null;
  showName: boolean;
  createdAt: Date;
  approvedAt: Date | null;
}): TestimonialRecord | null {
  if (!isGame(row.game)) return null;
  return {
    id: row.id,
    name: row.name,
    email: null,
    rating: row.rating,
    message: row.message,
    game: row.game,
    phoneModel: row.phoneModel,
    showName: row.showName,
    status: "approved",
    createdAt: row.createdAt,
    approvedAt: row.approvedAt,
  };
}

/** Public list: approved only, newest first. Hard-capped at 20 per game. */
export async function listApprovedTestimonials(options?: {
  game?: TestimonialGame;
}): Promise<PublicTestimonial[]> {
  const game = options?.game;

  const dbRows = await tryPrisma(async () => {
    if (game) {
      return prisma.testimonial.findMany({
        where: { status: "approved", game },
        orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
        take: MAX_APPROVED_TESTIMONIALS,
      });
    }
    // Unscoped: up to 20 newest approved from each game.
    const chunks = await Promise.all(
      ALL_TESTIMONIAL_GAMES.map((g) =>
        prisma.testimonial.findMany({
          where: { status: "approved", game: g },
          orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
          take: MAX_APPROVED_TESTIMONIALS,
        }),
      ),
    );
    return chunks.flat();
  });

  if (dbRows) {
    return dbRows
      .map(mapApprovedRow)
      .filter((row): row is TestimonialRecord => row != null)
      .sort(sortApprovedNewest)
      .map(toPublic);
  }

  const fromMock = mockTestimonials
    .filter((row) => row.status === "approved" && (!game || row.game === game))
    .sort(sortApprovedNewest);

  if (game) {
    return fromMock.slice(0, MAX_APPROVED_TESTIMONIALS).map(toPublic);
  }

  const perGame: TestimonialRecord[] = [];
  for (const g of ALL_TESTIMONIAL_GAMES) {
    perGame.push(
      ...fromMock.filter((row) => row.game === g).slice(0, MAX_APPROVED_TESTIMONIALS),
    );
  }
  return perGame.sort(sortApprovedNewest).map(toPublic);
}
