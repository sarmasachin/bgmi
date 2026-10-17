/**
 * SEO guide HTML for /bgmi-apk — full BGMI (not Lite).
 * Play Store + optional APK CTA are admin-controlled. We do not host APK files.
 */
export const BGMI_APK_ARTICLE_HTML = `
<h2>BGMI APK &amp; Play Store Guide (India)</h2>
<p>
  <strong>Battlegrounds Mobile India (BGMI)</strong> is Krafton’s official battle royale for
  India. This page is a fan-made info guide in the same layout as our BGMI Air APK page:
  two download buttons on top (Play Store and APK), then full details in the cards below.
</p>
<p>
  The safest way to install is the official <strong>Google Play</strong> listing published by
  Krafton. The APK button is optional — an admin can show, hide, or change its link. This site
  does <strong>not</strong> host APK files on our servers.
</p>

<h3>Play Store vs APK button</h3>
<ul>
  <li><strong>Play Store</strong> — use this first. Updates, Play Protect, and the Krafton publisher name stay on Google Play.</li>
  <li><strong>APK</strong> — only tap this if the admin has enabled it and you trust the URL they set. Skip random mirror sites and paid “mod APK” links.</li>
</ul>

<h3>How to install from Google Play</h3>
<ol>
  <li>Open the Play Store on your Android phone.</li>
  <li>Search for <strong>Battlegrounds Mobile India</strong> (BGMI).</li>
  <li>Confirm the publisher is <strong>KRAFTON, Inc.</strong> before you tap Install.</li>
  <li>After install, set graphics to a stable FPS, then open the
    <a href="/bgmi">BGMI sensitivity calculator</a> for Camera, ADS, and Gyroscope baselines.</li>
</ol>

<h3>BGMI vs BGMI Air</h3>
<p>
  Full BGMI targets mid-to-strong phones and higher FPS modes (60 / 90 / 120 where supported).
  <a href="/bgmi-lite-apk">BGMI Air</a> is the lighter client for budget phones. Do not paste
  BGMI Air codes into full BGMI, or flagship claw codes from a 120 FPS device into a 40 FPS phone.
</p>

<h3>Safety reminder</h3>
<p>
  This website is a fan-made sensitivity and info tool. It is not affiliated with Krafton.
  We never host BGMI APKs. If someone DMs a download link or asks for money / OTP for “BGMI APK,”
  treat it as a scam.
</p>
`.trim();

export const BGMI_APK_FAQS = [
  {
    id: "bgmi-apk-host",
    question: "Does this site host a BGMI APK file?",
    answer:
      "No. We do not host or mirror APK files. Use Google Play for the official install. The APK button only appears if an admin enables it and sets a URL.",
  },
  {
    id: "bgmi-play-store",
    question: "Where should I download BGMI from?",
    answer:
      "Use the Play Store button on this page (Krafton’s official listing). Verify the publisher name before you install.",
  },
  {
    id: "bgmi-apk-button",
    question: "Why is the APK button missing sometimes?",
    answer:
      "Admins can hide or show each button. If APK is hidden, or its URL is empty, only Play Store is shown.",
  },
  {
    id: "bgmi-sensi",
    question: "Where do I get BGMI sensitivity codes?",
    answer:
      "Use the BGMI calculator on this site after you install. Match device RAM and FPS, then fine-tune ±5 in Training Ground.",
  },
] as const;
