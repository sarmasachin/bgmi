/**
 * SEO guide HTML for /free-fire-max-apk.
 * Play Store + optional APK CTA are admin-controlled. We do not host APK files.
 */
export const FREE_FIRE_MAX_APK_ARTICLE_HTML = `
<h2>Free Fire MAX APK &amp; Play Store Guide</h2>
<p>
  <strong>Free Fire MAX</strong> is Garena’s higher-graphics battle royale client. This page is a
  fan-made info guide in the same layout as our other APK pages: two download buttons on top
  (Play Store and APK), then details in the cards below.
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
  <li>Search for <strong>Free Fire MAX</strong>.</li>
  <li>Confirm the official Garena publisher on the store page before you tap Install.</li>
  <li>After install, open the
    <a href="/free-fire-max-sensitivity-settings-calculator">Free Fire MAX sensitivity calculator</a>
    and match your device RAM.</li>
</ol>

<h3>Free Fire MAX vs Free Fire</h3>
<p>
  Free Fire MAX uses heavier graphics and needs its own sensitivity.
  <a href="/">Free Fire</a> is the lighter standard client. Do not paste standard Free Fire codes into Free Fire MAX.
</p>

<h3>Safety reminder</h3>
<p>
  This website is a fan-made sensitivity and info tool. It is not affiliated with Garena.
  We never host Free Fire MAX APKs. If someone DMs a download link or asks for money / OTP for “FF Max Apk,” treat it as a scam.
</p>
`.trim();

export const FREE_FIRE_MAX_APK_FAQS = [
  {
    id: "free-fire-max-apk-host",
    question: "Does this site host a Free Fire MAX APK file?",
    answer:
      "No. We do not host or mirror APK files. Use Google Play for the official install. The APK button only appears if an admin enables it and sets a URL.",
  },
  {
    id: "ff-max-play-store",
    question: "Where should I download Free Fire MAX from?",
    answer:
      "Use the Play Store button on this page (official listing). Verify the Garena publisher name before you install.",
  },
  {
    id: "free-fire-max-apk-button",
    question: "Why is the APK button missing sometimes?",
    answer:
      "Admins can hide or show each button. If APK is hidden, or its URL is empty, only Play Store is shown.",
  },
  {
    id: "ff-max-sensi",
    question: "Where do I get Free Fire MAX sensitivity codes?",
    answer:
      "Use the Free Fire MAX calculator on this site after you install. Match device RAM, then fine-tune in training.",
  },
] as const;
