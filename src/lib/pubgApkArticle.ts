/**
 * SEO guide HTML for /pubg-apk — full PUBG Mobile (not Lite, not BGMI).
 * Play Store + optional APK CTA are admin-controlled. We do not host APK files.
 */
export const PUBG_APK_ARTICLE_HTML = `
<h2>PUBG Mobile APK &amp; Play Store Guide</h2>
<p>
  <strong>PUBG Mobile</strong> is the global battle royale client. This page is a fan-made info
  guide in the same layout as our BGMI APK page: two download buttons on top (Play Store and APK),
  then full details in the cards below.
</p>
<p>
  The safest way to install is the official <strong>Google Play</strong> listing. The APK button
  is optional — an admin can show, hide, or change its link. This site does
  <strong>not</strong> host APK files on our servers.
</p>

<h3>Play Store vs APK button</h3>
<ul>
  <li><strong>Play Store</strong> — use this first. Updates, Play Protect, and the official publisher name stay on Google Play.</li>
  <li><strong>APK</strong> — only tap this if the admin has enabled it and you trust the URL they set. Skip random mirror sites and paid “mod APK” links.</li>
</ul>

<h3>How to install from Google Play</h3>
<ol>
  <li>Open the Play Store on your Android phone.</li>
  <li>Search for <strong>PUBG Mobile</strong>.</li>
  <li>Confirm the official publisher on the store page before you tap Install.</li>
  <li>After install, set graphics to a stable FPS, then open the
    <a href="/pubg">PUBG Mobile sensitivity calculator</a> for Camera, ADS, and Gyroscope baselines.</li>
</ol>

<h3>PUBG Mobile vs PUBG Mobile Lite</h3>
<p>
  Full PUBG Mobile targets mid-to-strong phones and higher FPS modes where supported.
  <a href="/pubg-mobile-lite-apk">PUBG Mobile Lite</a> is the lighter client for budget phones.
  Do not paste Lite codes into full PUBG Mobile, or flagship claw codes from a 120 FPS device
  into a 40 FPS phone.
</p>

<h3>PUBG Mobile vs BGMI</h3>
<p>
  <a href="/bgmi-apk">BGMI</a> is Krafton’s India client with its own Play listing. PUBG Mobile
  is the global client. Use the matching calculator and APK page for the game you actually installed.
</p>

<h3>Safety reminder</h3>
<p>
  This website is a fan-made sensitivity and info tool. It is not affiliated with Krafton,
  Tencent, or Level Infinite. We never host PUBG Mobile APKs. If someone DMs a download link
  or asks for money / OTP for “PUBG APK,” treat it as a scam.
</p>
`.trim();

export const PUBG_APK_FAQS = [
  {
    id: "pubg-apk-host",
    question: "Does this site host a PUBG Mobile APK file?",
    answer:
      "No. We do not host or mirror APK files. Use Google Play for the official install. The APK button only appears if an admin enables it and sets a URL.",
  },
  {
    id: "pubg-play-store",
    question: "Where should I download PUBG Mobile from?",
    answer:
      "Use the Play Store button on this page (official listing). Verify the publisher name before you install.",
  },
  {
    id: "pubg-apk-button",
    question: "Why is the APK button missing sometimes?",
    answer:
      "Admins can hide or show each button. If APK is hidden, or its URL is empty, only Play Store is shown.",
  },
  {
    id: "pubg-sensi",
    question: "Where do I get PUBG Mobile sensitivity codes?",
    answer:
      "Use the PUBG Mobile calculator on this site after you install. Match device RAM and FPS, then fine-tune ±5 in Training Ground.",
  },
] as const;
