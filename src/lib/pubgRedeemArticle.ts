/** SEO guide HTML for /pubg-redeem-code — fan-made; redeem only in official client. */
export const PUBG_REDEEM_ARTICLE_HTML = `
<h2>PUBG Mobile Redeem Codes Guide: How to Redeem Safely</h2>
<p>
  <strong>PUBG Mobile redeem codes</strong> are short promo strings for crates, cosmetics, or
  limited rewards. This page lists working and expired codes for tracking — it is a fan-made
  helper, not an official Krafton / Level Infinite store.
</p>
<p>
  Always redeem inside the official <strong>PUBG Mobile</strong> client or the publisher’s
  official redeem page. We never ask for your password, OTP, UC payment, or account takeover
  links. This page is for full PUBG Mobile — not <a href="/pubg-mobile-lite-redeem-code">PUBG Mobile Lite</a>
  and not <a href="/bgmi-redeem-code">BGMI</a>.
</p>

<h3>How to redeem a PUBG Mobile code</h3>
<ol>
  <li>Copy a <strong>LIVE</strong> code from the list above.</li>
  <li>Open PUBG Mobile and sign in with your usual account.</li>
  <li>Open the in-game <strong>Redeem</strong> / Rewards section (location can change by version), or use the official PUBG Mobile redeem page while logged in.</li>
  <li>Paste the code, confirm, and collect the reward in your mail or inventory.</li>
</ol>

<h3>Why codes fail</h3>
<ul>
  <li>The code already expired or hit a regional / device limit.</li>
  <li>You already redeemed that code on the same account.</li>
  <li>A typo or extra space — paste carefully from the Copy button.</li>
  <li>You tried a Lite or BGMI code in full PUBG Mobile (or the other way around).</li>
</ul>

<h3>Safety tips</h3>
<p>
  Skip paid “code seller” DMs, fake redeem websites, and anyone asking for OTP. If a code fails,
  wait for the next live drop on this page instead of buying random strings. Confirm rewards
  only inside the official PUBG Mobile client.
</p>

<h3>Related PUBG Mobile pages</h3>
<p>
  After redeeming, tune aim with the
  <a href="/pubg">PUBG Mobile sensitivity calculator</a>
  and read the
  <a href="/pubg-apk">PUBG Mobile APK guide</a>
  for Play Store and install safety notes.
</p>
`.trim();

export const PUBG_REDEEM_FAQS = [
  {
    id: "pubg-redeem-how",
    question: "How do I redeem a PUBG Mobile code?",
    answer:
      "Copy a LIVE code from this page, open the official PUBG Mobile client, go to the in-game Redeem / Rewards section (or the official redeem page), paste the code, and confirm. Collect rewards from mail or inventory if prompted.",
  },
  {
    id: "pubg-redeem-fail",
    question: "Why did my PUBG Mobile redeem code fail?",
    answer:
      "Codes can expire, hit account or region limits, or fail if you already redeemed them. Double-check for typos or spaces. Do not paste Lite or BGMI codes into full PUBG Mobile. Wait for the next LIVE drop if the code is marked expired on this page.",
  },
  {
    id: "pubg-redeem-safe",
    question: "Is it safe to redeem codes from this site?",
    answer:
      "We only list codes for you to copy and redeem inside the official PUBG Mobile client. We never ask for your password, OTP, or UC payment. Ignore paid “code sellers” and fake redeem websites.",
  },
  {
    id: "pubg-redeem-official",
    question: "Are these official PUBG Mobile codes?",
    answer:
      "This is a fan-made tracker, not a Krafton / Level Infinite store. Codes may come from events, partners, or community drops. Always confirm rewards only inside the official PUBG Mobile client.",
  },
  {
    id: "pubg-redeem-update",
    question: "How often are new PUBG Mobile codes updated?",
    answer:
      "We refresh when new live codes are available. The page shows a “No new codes today” note or an Updated (IST) stamp so you can see whether fresh codes were published today.",
  },
] as const;
