import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function loadDotEnv(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(".env");
loadDotEnv(".env.local");

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "1234";
  if (password.length < 6 && password !== "1234") {
    throw new Error("ADMIN_PASSWORD must be at least 6 characters");
  }
  const passwordHash = await bcrypt.hash(password, 10);

  const existingByEmail = await prisma.adminUser.findUnique({ where: { email } });
  if (existingByEmail) {
    await prisma.adminUser.update({
      where: { id: existingByEmail.id },
      data: { passwordHash, isActive: true, role: "superadmin", permissions: [] },
    });
    console.log(`Updated password for ${email}`);
    return;
  }

  const primary = await prisma.adminUser.findFirst({ orderBy: { createdAt: "asc" } });
  if (primary) {
    await prisma.adminUser.update({
      where: { id: primary.id },
      data: {
        email,
        passwordHash,
        isActive: true,
        role: "superadmin",
        permissions: [],
        name: primary.name || "Primary Admin",
      },
    });
    console.log(`Updated primary admin → ${email}`);
    return;
  }

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: "Primary Admin",
      role: "superadmin",
      permissions: [],
      isActive: true,
    },
  });
  console.log(`Created admin ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
