import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import {
  MAX_APK_UPLOAD_BYTES,
  getApkFileDir,
  isSafeApkFilename,
  resolveStoredApkPath,
} from "@/src/server/media/apkFileUpload";

/** Three saved pages plus one unpublished upload. */
export const MAX_APK_STORE_BYTES = MAX_APK_UPLOAD_BYTES * 4;

const APK_PAGE_SETTING_KEYS = [
  "settings:freeFireApkPage",
  "settings:freeFireIndiaApkPage",
  "settings:freeFireMaxApkPage",
] as const;

function hostedNames(value: unknown): string[] {
  const text = JSON.stringify(value ?? null);
  const re = /\/apk-files\/([A-Za-z0-9][A-Za-z0-9._-]*\.(?:xapk|apks|apk|zip))(?![A-Za-z0-9])/gi;
  const names: string[] = [];
  for (const match of text.matchAll(re)) {
    const name = match[1];
    if (name && isSafeApkFilename(name)) names.push(name.toLowerCase());
  }
  return names;
}

function pagePathFromValue(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const pagePath = (value as { path?: unknown }).path;
  if (typeof pagePath !== "string") return "";
  if (!pagePath.startsWith("/") || pagePath.startsWith("//")) return "";
  return pagePath;
}

/** Public page that currently links this file. Null when the database cannot be read. */
export async function publishedPagePathForApk(filename: string): Promise<string | null> {
  const want = filename.toLowerCase();
  if (!isSafeApkFilename(filename)) return null;
  if (!process.env.DATABASE_URL) return null;
  for (const key of APK_PAGE_SETTING_KEYS) {
    const result = await tryPrismaLong(async () => {
      const row = await prisma.siteSetting.findUnique({ where: { key } });
      return { value: row?.value ?? null };
    });
    if (result === null) return null;
    if (!hostedNames(result.value).includes(want)) continue;
    const pagePath = pagePathFromValue(result.value);
    if (pagePath) return pagePath;
  }
  return null;
}
export async function listPublishedApkFilenames(): Promise<Set<string> | null> {
  if (!process.env.DATABASE_URL) return null;
  const names = new Set<string>();
  for (const key of APK_PAGE_SETTING_KEYS) {
    const result = await tryPrismaLong(async () => {
      const row = await prisma.siteSetting.findUnique({ where: { key } });
      return { value: row?.value ?? null };
    });
    if (result === null) return null;
    for (const name of hostedNames(result.value)) names.add(name);
  }
  return names;
}

export async function apkStoreBytes(): Promise<number> {
  let names: string[] = [];
  try {
    names = await readdir(getApkFileDir());
  } catch {
    return 0;
  }
  let total = 0;
  for (const name of names) {
    if (!isSafeApkFilename(name)) continue;
    try {
      const info = await stat(path.join(getApkFileDir(), name));
      if (info.isFile()) total += info.size;
    } catch {
      /* file disappeared */
    }
  }
  return total;
}

/** Delete stored APKs that no saved page links. extraKeep holds the file just uploaded. */
export async function pruneUnreferencedApkFiles(extraKeep: readonly string[] = []): Promise<boolean> {
  const published = await listPublishedApkFilenames();
  if (!published) return false;
  const keep = new Set(published);
  for (const name of extraKeep) {
    if (isSafeApkFilename(name)) keep.add(name.toLowerCase());
  }
  let names: string[] = [];
  try {
    names = await readdir(getApkFileDir());
  } catch {
    return true;
  }
  for (const name of names) {
    if (!isSafeApkFilename(name) || keep.has(name.toLowerCase())) continue;
    await unlink(path.join(getApkFileDir(), name)).catch(() => undefined);
  }
  return true;
}

/** After a page save, delete hosted files that page stopped linking. */
export async function releaseReplacedApkFiles(previous: unknown, next: unknown): Promise<void> {
  const before = new Set(hostedNames(previous));
  const after = new Set(hostedNames(next));
  const removed = [...before].filter((name) => !after.has(name));
  if (removed.length === 0) return;
  const published = await listPublishedApkFilenames();
  if (!published) return;
  for (const name of removed) {
    if (published.has(name)) continue;
    const full = resolveStoredApkPath(name);
    if (full) await unlink(full).catch(() => undefined);
  }
}

export async function assertApkStoreWithinQuota(newestFilename: string): Promise<void> {
  const total = await apkStoreBytes();
  if (total <= MAX_APK_STORE_BYTES) return;
  const published = await listPublishedApkFilenames();
  if (!published?.has(newestFilename.toLowerCase())) {
    await unlink(path.join(getApkFileDir(), newestFilename)).catch(() => undefined);
  }
  throw new Error("QUOTA");
}
