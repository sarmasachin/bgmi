/**
 * SEO guide HTML for /pubg-mobile-lite-apk.
 * Same launch target date as BGMI Lite APK (12 Nov 2026). No APK hosting.
 */
export const PUBG_MOBILE_LITE_APK_ARTICLE_HTML = `
<h2>PUBG Mobile Lite APK Guide: Launch Countdown, Safe Install &amp; Sensitivity</h2>
<p>
  <strong>PUBG Mobile Lite</strong> is the lighter PUBG Mobile client for budget and older
  Android phones. This page tracks a <strong>12 November 2026</strong> launch countdown
  (same site target as BGMI Lite), explains safe install, and shows how to prepare sensitivity —
  without hosting any APK.
</p>
<p>
  Always confirm dates and install steps on the official Google Play listing. Exact system
  requirements and the final feature list may still change before launch.
</p>

<h3>What “PUBG Lite APK” means on this site</h3>
<p>
  Players search for “PUBG Lite APK” when they want a small install file or early access.
  We treat that search as an <em>info request</em>: how pre-registration / install works, when
  Lite may launch, and how to avoid fake mirrors. We do <strong>not</strong> provide APK files,
  paid unlock codes, or third-party download links.
</p>
<ul>
  <li>Use Google Play to pre-register or install when the official listing is published.</li>
  <li>Verify the publisher name before you tap Install.</li>
  <li>Ignore websites that ask for money or personal OTPs for a “Lite APK”.</li>
</ul>

<h3>PUBG Mobile Lite launch date: 12 November 2026</h3>
<p>
  The countdown on this page targets <strong>12 November 2026 (IST)</strong> — the same date
  tracked on our BGMI Lite APK page — so players can follow the Lite launch window in one place.
  If the publisher announces a different day, trust the official channel and Play Store — then
  retune sensitivity after you install.
</p>

<h3>Pre-registration / install checklist (Android)</h3>
<ol>
  <li>Open the official <strong>PUBG Mobile Lite</strong> listing on Google Play when available.</li>
  <li>Tap <strong>Pre-register</strong> (or Install if the game is already live).</li>
  <li>Optionally enable auto-install so Play can download when storage allows.</li>
  <li>After install, open Lite, sign in with your usual method if supported, and set graphics to a stable FPS.</li>
</ol>

<h3>PUBG Mobile Lite vs full PUBG Mobile</h3>
<p>
  Full PUBG Mobile targets mid-to-strong phones and often runs 60 / 90 / 120 FPS. Lite is aimed at
  entry devices that need a smaller download and smoother play at lower hardware cost. Do not
  paste flagship claw sensitivity codes from full PUBG Mobile into Lite — use the
  <a href="/pubg-mobile-lite">PUBG Mobile Lite sensitivity calculator</a> for Camera, ADS, and
  Gyroscope baselines on 2GB–4GB / 30–60 FPS setups.
</p>

<h3>After install: graphics and sensitivity</h3>
<p>
  Keep graphics on <strong>Smooth</strong> (or the lightest option that holds FPS). Unstable
  frame rate makes any sensitivity feel random. Prefer <strong>Scope On</strong> gyroscope on
  2GB phones so the camera does not drift while looting. Warm up in Training Ground and adjust
  Red Dot / 3x / 6x by about ±5 before ranked matches.
</p>

<h3>Safety reminder</h3>
<p>
  This website is a fan-made sensitivity and info tool. It is not affiliated with Krafton or
  PUBG Corporation. We never host PUBG Mobile Lite APKs. If someone messages you a download
  link or asks for payment for “early access,” treat it as a scam.
</p>
`.trim();

export const PUBG_MOBILE_LITE_APK_FAQS = [
  {
    id: "pml-apk-host",
    question: "Does this site provide a PUBG Mobile Lite APK download?",
    answer:
      "No. We do not host or mirror APK files. Pre-register or install only from the official Google Play listing.",
  },
  {
    id: "pml-launch-12-nov",
    question: "Is 12 November 2026 the official PUBG Mobile Lite launch date?",
    answer:
      "This page tracks 12 November 2026 for the countdown — the same site target as BGMI Lite. Always confirm the final date on Google Play or official updates.",
  },
  {
    id: "pml-prereg",
    question: "How do I pre-register or install PUBG Mobile Lite?",
    answer:
      "Open the official PUBG Mobile Lite page on Google Play (Android), tap Pre-register or Install when available, and wait for the official release. Skip random APK websites.",
  },
  {
    id: "pml-apk-sensi",
    question: "Should I use full PUBG Mobile sensitivity codes on Lite?",
    answer:
      "No. Flagship 90/120 FPS codes often feel wrong on Lite-class phones. Use the PUBG Mobile Lite calculator on this site, then fine-tune ±5 in Training Ground.",
  },
] as const;
