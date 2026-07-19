/**
 * E2E without direct DB: prove create count via API response ids.
 * Usage: node scripts/e2e-testimonial-api.mjs [baseUrl]
 */
const BASE = process.argv[2] || process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const marker = `e2e-api-${Date.now()}`;

async function post(payload) {
  const res = await fetch(`${BASE}/api/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json, id: json?.id ?? null };
}

async function main() {
  console.log("BASE", BASE);
  console.log("marker", marker);

  // A: single
  const msgA = `${marker}-single`;
  const a = await post({
    name: "E2E Single",
    rating: 5,
    message: msgA,
    game: "bgmi",
    phoneModel: "E2E",
    showName: true,
  });
  console.log("\n=== A single ===");
  console.log(a);

  // B: parallel double-click
  const msgB = `${marker}-double`;
  const payloadB = {
    name: "E2E Double",
    rating: 4,
    message: msgB,
    game: "bgmi",
    phoneModel: null,
    showName: true,
  };
  const [b1, b2] = await Promise.all([post(payloadB), post(payloadB)]);
  console.log("\n=== B parallel double ===");
  console.log("b1", b1);
  console.log("b2", b2);
  console.log("same id?", b1.id && b1.id === b2.id);
  console.log("unique ids", new Set([b1.id, b2.id]).size);

  // C: sequential immediate retry
  const msgC = `${marker}-seq`;
  const payloadC = {
    name: "E2E Seq",
    rating: 3,
    message: msgC,
    game: "pubg",
    phoneModel: "X",
    showName: false,
  };
  const c1 = await post(payloadC);
  const c2 = await post(payloadC);
  console.log("\n=== C sequential ===");
  console.log("c1", c1);
  console.log("c2", c2);
  console.log("same id?", c1.id && c1.id === c2.id);

  const passB = b1.status < 300 && b2.status < 300 && b1.id && b1.id === b2.id;
  const passC = c1.status < 300 && c2.status < 300 && c1.id && c1.id === c2.id;
  const passA = a.status < 300 && Boolean(a.id);

  console.log("\n=== SUMMARY ===");
  console.log({
    passA_singleOk: passA,
    passB_parallelSameId: passB,
    passC_sequentialSameId: passC,
    verdict: passA && passB && passC ? "PASS" : "FAIL",
  });

  process.exit(passA && passB && passC ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
