import { cache } from "react";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

const HEAD_SNIPPETS_KEY = "settings:headSnippets";

export type HeadSnippets = {
  googleVerificationMeta?: string;
  analyticsScript?: string;
  adsenseScript?: string;
};

export const getHeadSnippets = cache(async function getHeadSnippets(): Promise<HeadSnippets> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: HEAD_SNIPPETS_KEY } }),
  );
  return (
    (row?.value as HeadSnippets | undefined) ?? {
      googleVerificationMeta: "",
      analyticsScript: "",
      adsenseScript: "",
    }
  );
});

export async function saveHeadSnippets(payload: HeadSnippets) {
  await tryPrisma(async () =>
    prisma.siteSetting.upsert({
      where: { key: HEAD_SNIPPETS_KEY },
      create: { key: HEAD_SNIPPETS_KEY, value: payload },
      update: { value: payload },
    }),
  );
}
