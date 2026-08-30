/** SEO guide HTML for /free-fire-redeem-code — fan-made; redeem only in official Garena client. */
export const FREE_FIRE_REDEEM_ARTICLE_HTML = `
<h2>Free Fire Redeem Codes Guide: How to Redeem Safely</h2>
<p>
  <strong>Free Fire redeem codes</strong> are short promo strings published for diamonds,
  skins, or limited rewards. This page lists working and expired codes for tracking — it is a
  fan-made helper, not an official Garena store.
</p>
<p>
  Always redeem inside the official <strong>Free Fire</strong> client. We never ask for
  your password, OTP, diamond payment, or account takeover links.
</p>

<h3>How to redeem a Free Fire code</h3>
<ol>
  <li>Copy a <strong>LIVE</strong> code from the list above.</li>
  <li>Open Free Fire and sign in with your usual account.</li>
  <li>Open the in-game <strong>Redeem</strong> / Rewards section (location can change by version).</li>
  <li>Paste the code, confirm, and collect diamonds or items in your mail or inventory.</li>
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

<h3>Related Free Fire pages</h3>
<p>
  After redeeming, tune aim with the
  <a href="/">Free Fire sensitivity calculator</a>
  and read the
  <a href="/free-fire-advance-server">Advance Server guide</a>
  for beta window info.
</p>
`.trim();

export const FREE_FIRE_REDEEM_FAQS = [
  {
    id: "ff-redeem-how",
    question: "How do I redeem a Free Fire code?",
    answer:
      "Copy a LIVE code from this page, open the official Free Fire client, go to the in-game Redeem / Rewards section, paste the code, and confirm. Collect diamonds or items from mail or inventory if prompted.",
  },
  {
    id: "ff-redeem-fail",
    question: "Why did my Free Fire redeem code fail?",
    answer:
      "Codes can expire, hit account or region limits, or fail if you already redeemed them. Double-check for typos or spaces. Wait for the next LIVE drop if the code is marked expired on this page.",
  },
  {
    id: "ff-redeem-safe",
    question: "Is it safe to redeem codes from this site?",
    answer:
      "We only list codes for you to copy and redeem inside the official client. We never ask for your password, OTP, or diamond payment. Ignore paid “code sellers” and fake redeem websites.",
  },
  {
    id: "ff-redeem-official",
    question: "Are these official Garena Free Fire codes?",
    answer:
      "This is a fan-made tracker, not an official store. Codes may come from events, partners, or community drops. Always confirm rewards only inside the official Free Fire client.",
  },
  {
    id: "ff-redeem-update",
    question: "How often are new Free Fire codes updated?",
    answer:
      "We refresh when new live codes are available. The page shows a “No new codes today” note or an Updated (IST) stamp so you can see whether fresh codes were published today.",
  },
] as const;
