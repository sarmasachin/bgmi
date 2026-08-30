/** SEO guide HTML for /pubg-mobile-lite-redeem-code — fan-made; redeem only in official client. */
export const PUBG_MOBILE_LITE_REDEEM_ARTICLE_HTML = `
<h2>PUBG Mobile Lite Redeem Codes Guide: How to Redeem Safely</h2>
<p>
  <strong>PUBG Mobile Lite redeem codes</strong> are short promo strings published for crates,
  cosmetics, or limited rewards. This page lists working and expired codes for tracking — it is a
  fan-made helper, not an official PUBG / Krafton store.
</p>
<p>
  Always redeem inside the official <strong>PUBG Mobile Lite</strong> client. We never ask for
  your password, OTP, UC payment, or account takeover links.
</p>

<h3>How to redeem a PUBG Mobile Lite code</h3>
<ol>
  <li>Copy a <strong>LIVE</strong> code from the list above.</li>
  <li>Open PUBG Mobile Lite and sign in with your usual account.</li>
  <li>Open the in-game <strong>Redeem</strong> / Rewards section (location can change by version).</li>
  <li>Paste the code, confirm, and collect the reward in your mail or inventory.</li>
</ol>

<h3>Why codes fail</h3>
<ul>
  <li>The code already expired or hit a regional / device limit.</li>
  <li>You already redeemed that code on the same account.</li>
  <li>A typo or extra space — paste carefully from the Copy button.</li>
  <li>Maintenance or a client update temporarily blocks redeem.</li>
</ul>

<h3>Safety tips</h3>
<p>
  Skip paid “code seller” DMs, fake redeem websites, and anyone asking for OTP. If a code fails,
  wait for the next live drop on this page instead of buying random strings. Confirm rewards
  only inside the official game client.
</p>

<h3>Related Lite pages</h3>
<p>
  After redeeming, tune aim with the
  <a href="/pubg-mobile-lite">PUBG Mobile Lite sensitivity calculator</a>
  and read the
  <a href="/pubg-mobile-lite-apk">PUBG Lite APK launch guide</a>
  for safe install notes.
</p>
`.trim();

export const PUBG_MOBILE_LITE_REDEEM_FAQS = [
  {
    id: "pml-redeem-how",
    question: "How do I redeem a PUBG Mobile Lite code?",
    answer:
      "Copy a LIVE code from this page, open the official PUBG Mobile Lite client, go to the in-game Redeem / Rewards section, paste the code, and confirm. Collect rewards from mail or inventory if prompted.",
  },
  {
    id: "pml-redeem-fail",
    question: "Why did my PUBG Mobile Lite redeem code fail?",
    answer:
      "Codes can expire, hit account or region limits, or fail if you already redeemed them. Double-check for typos or spaces. Wait for the next LIVE drop if the code is marked expired on this page.",
  },
  {
    id: "pml-redeem-safe",
    question: "Is it safe to redeem codes from this site?",
    answer:
      "We only list codes for you to copy and redeem inside the official client. We never ask for your password, OTP, or UC payment. Ignore paid “code sellers” and fake redeem websites.",
  },
  {
    id: "pml-redeem-official",
    question: "Are these official PUBG / Krafton codes?",
    answer:
      "This is a fan-made tracker, not an official store. Codes may come from events, partners, or community drops. Always confirm rewards only inside the official PUBG Mobile Lite client.",
  },
  {
    id: "pml-redeem-update",
    question: "How often are new PUBG Mobile Lite codes updated?",
    answer:
      "We refresh when new live codes are available. The page shows a “No new codes today” note or an Updated (IST) stamp so you can see whether fresh codes were published today.",
  },
] as const;
