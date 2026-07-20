const base = "https://sensitivitysettings.com";

async function check(path) {
  const r = await fetch(base + path, { redirect: "follow", cache: "no-store" });
  const t = await r.text();
  return {
    path,
    status: r.status,
    crash: t.includes("This page hit a problem"),
    loginNew: t.includes("admin-login-submit"),
  };
}

async function main() {
  for (const p of ["/", "/pubg", "/news", "/contact", "/admin/login"]) {
    console.log(JSON.stringify(await check(p)));
  }
  const home = await (await fetch(base + "/", { cache: "no-store" })).text();
  const idx = home.indexOf("phoneModels");
  let n = 0;
  let moto = 0;
  if (idx >= 0) {
    const slice = home.slice(idx, idx + 200000);
    const m = slice.match(/phoneModels\\?":(\[[\s\S]*?\])/);
    if (m) {
      try {
        const arr = JSON.parse(m[1].replace(/\\"/g, '"'));
        n = arr.length;
        moto = arr.filter((x) => /moto|motorola/i.test(String(x))).length;
      } catch {
        /* ignore */
      }
    }
  }
  console.log(JSON.stringify({ phoneModelsOnHome: n, motorola: moto }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
