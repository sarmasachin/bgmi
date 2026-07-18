import fs from "fs";

for (const file of [".env", ".env.local"]) {
  if (!fs.existsSync(file)) continue;
  const line = fs.readFileSync(file, "utf8").split("\n").find((l) => l.startsWith("DATABASE_URL="));
  if (!line) {
    console.log(`${file}: no DATABASE_URL`);
    continue;
  }
  const raw = line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
  const url = new URL(raw);
  console.log(
    `${file}: host=${url.hostname} port=${url.port || "5432"} db=${url.pathname.slice(1)} user=${url.username}`,
  );
}
