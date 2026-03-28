import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";

export async function verifyAdminCredentials(email: string, password: string) {
  const dbUser = await tryPrisma(async () =>
    prisma.adminUser.findFirst({
      where: { email, isActive: true },
    }),
  );

  if (dbUser) {
    const valid = await bcrypt.compare(password, dbUser.passwordHash);
    return valid ? dbUser : null;
  }

  const allowDevFallback = process.env.NODE_ENV !== "production";
  if (allowDevFallback) {
    type MockUser = (typeof mockStore.users)[number] & { passwordHash?: string };
    const mockUser = mockStore.users.find(
      (u) => (u as MockUser).email.toLowerCase() === email.toLowerCase(),
    ) as MockUser | undefined;
    if (mockUser?.passwordHash && mockUser.active !== false) {
      const valid = await bcrypt.compare(password, mockUser.passwordHash);
      if (valid) return mockUser;
    }
    if (email === "admin@example.com" && password === "1234") {
      return mockStore.users[0];
    }
  }
  return null;
}

export async function requestResetToken(email: string) {
  const dbUser = await tryPrisma(async () =>
    prisma.adminUser.findFirst({
      where: { email, isActive: true },
    }),
  );
  if (!dbUser) return { sent: false };

  const rawToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await tryPrisma(async () =>
    prisma.passwordResetToken.create({
      data: {
        userId: dbUser.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    }),
  );

  return { sent: true, token: rawToken };
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const token = await tryPrisma(async () =>
    prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    }),
  );
  if (!token) return false;

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({
    where: { id: token.userId },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  });
  return true;
}
