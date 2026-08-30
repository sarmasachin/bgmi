/** SEO guide HTML for /bgmi-lite-redeem-code — fan-made; redeem only in official client. */
export const BGMI_LITE_REDEEM_ARTICLE_HTML = `
<h2>BGMI Lite Redeem Codes Guide: How to Redeem Safely (2026)</h2>
<p>
  <strong>BGMI Lite redeem codes</strong> are short promo strings Krafton (or event partners)
  publish for crates, cosmetics, or limited rewards. This page lists working and expired codes
  for tracking — it is a fan-made helper, not an official Krafton store.
</p>
<p>
  Always redeem inside the official <strong>BGMI Lite</strong> / Battlegrounds Mobile India
  client. We never ask for your password, OTP, UC payment, or account takeover links.
</p>

<h3>How to redeem a BGMI Lite code</h3>
<ol>
  <li>Copy a <strong>LIVE</strong> code from the list above.</li>
  <li>Open BGMI Lite and sign in with your usual account.</li>
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
  only inside Krafton’s official client.
</p>

<h3>Related Lite pages</h3>
<p>
  After redeeming, tune aim with the
  <a href="/bgmi-lite">BGMI Lite sensitivity calculator</a>
  and read the
  <a href="/bgmi-lite-apk">BGMI Lite APK launch guide</a>
  for pre-registration and install safety notes.
</p>
`.trim();

export const BGMI_LITE_REDEEM_FAQS = [
  {
    id: "lite-redeem-how",
    question: "How do I redeem a BGMI Lite code?",
    answer:
      "Copy a LIVE code from this page, open the official BGMI Lite client, go to the in-game Redeem / Rewards section, paste the code, and confirm. Collect rewards from mail or inventory if prompted.",
  },
  {
    id: "lite-redeem-fail",
    question: "Why did my BGMI Lite redeem code fail?",
    answer:
      "Codes can expire, hit account or region limits, or fail if you already redeemed them. Double-check for typos or spaces. Wait for the next LIVE drop if the code is marked expired on this page.",
  },
  {
    id: "lite-redeem-safe",
    question: "Is it safe to redeem codes from this site?",
    answer:
      "We only list codes for you to copy and redeem inside Krafton’s official client. We never ask for your password, OTP, or UC payment. Ignore paid “code sellers” and fake redeem websites.",
  },
  {
    id: "lite-redeem-official",
    question: "Are these official Krafton codes?",
    answer:
      "This is a fan-made tracker, not a Krafton store. Codes may come from events, partners, or community drops. Always confirm rewards only inside the official BGMI Lite / BGMI client.",
  },
  {
    id: "lite-redeem-update",
    question: "How often are new BGMI Lite codes updated?",
    answer:
      "We refresh when new live codes are available. The page shows a “No new codes today” note or an Updated (IST) stamp so you can see whether fresh codes were published today.",
  },
] as const;

