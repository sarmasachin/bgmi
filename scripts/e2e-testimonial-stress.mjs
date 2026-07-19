/** Stress: 5 rounds of 5 parallel identical POSTs. Expect 1 unique id per round. */
const BASE = process.argv[2] || "http://127.0.0.1:3000";

async function post(payload) {
  const res = await fetch(`${BASE}/api/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, id: json?.id ?? null };
}

async function main() {
  let fail = 0;
  for (let round = 1; round <= 5; round++) {
    const message = `e2e-stress-${Date.now()}-r${round}`;
    const payload = {
      name: "Stress",
      rating: 5,
      message,
      game: "bgmi",
      phoneModel: null,
      showName: true,
    };
    const results = await Promise.all(Array.from({ length: 5 }, () => post(payload)));
    const ids = results.map((r) => r.id).filter(Boolean);
    const unique = new Set(ids);
    const ok = unique.size === 1 && ids.length === 5 && results.every((r) => r.status === 200);
    console.log(`round ${round}`, { statuses: results.map((r) => r.status), uniqueIds: [...unique], ok });
    if (!ok) fail += 1;
  }
  console.log(fail === 0 ? "STRESS PASS" : `STRESS FAIL (${fail}/5)`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
