/**
 * SEO guide HTML for /bgmi-lite-apk — BGMI Lite only (not Free Fire).
 * Keep factual: Krafton end-2026 window; site tracks 12 Nov 2026; no APK hosting.
 */
export const BGMI_LITE_APK_ARTICLE_HTML = `
<h2>BGMI Lite APK Guide: Launch Countdown, Pre-Registration &amp; Safe Download (2026)</h2>
<p>
  <strong>BGMI Lite</strong> is Krafton India’s lighter Battlegrounds Mobile India client for
  budget and older Android phones. This page tracks a <strong>12 November 2026</strong> launch
  countdown, explains pre-registration, and shows how to stay safe — without hosting any APK.
</p>
<p>
  Krafton has confirmed Lite for India in the <strong>end-of-2026</strong> window and opened
  Android pre-registration on Google Play with an initial download around <strong>1GB</strong>.
  Exact system requirements and the final feature list may still change before launch. Always
  confirm dates and install steps on the official Play Store listing.
</p>

<h3>What “BGMI Lite APK” means on this site</h3>
<p>
  Players search for “BGMI Lite APK” when they want a small install file or early access.
  We treat that search as an <em>info request</em>: how pre-registration works, when Lite may
  launch, and how to avoid fake mirrors. We do <strong>not</strong> provide APK files, paid unlock
  codes, or third-party download links.
</p>
<ul>
  <li>Use Google Play to pre-register or install when Krafton publishes the listing.</li>
  <li>Verify the publisher name is Krafton before you tap Install.</li>
  <li>Ignore websites that ask for money or personal OTPs for a “Lite APK”.</li>
</ul>

<h3>BGMI Lite launch date: 12 November 2026</h3>
<p>
  The countdown on this page targets <strong>12 November 2026 (IST)</strong> so players can
  track the launch window in one place. Krafton’s public commitment remains launch by the end of
  2026. If Krafton announces a different day, trust the official channel and Play Store — then
  retune sensitivity after you install.
</p>

<h3>Pre-registration checklist (Android)</h3>
<ol>
  <li>Open the official <strong>BGMI Lite</strong> listing on Google Play when available.</li>
  <li>Tap <strong>Pre-register</strong> (or Install if the game is already live).</li>
  <li>Optionally enable auto-install so Play can download when storage allows.</li>
  <li>After install, open Lite, sign in with your usual BGMI method if supported, and set graphics to a stable FPS.</li>
</ol>

<h3>BGMI Lite vs full BGMI</h3>
<p>
  Full BGMI targets mid-to-strong phones and often runs 60 / 90 / 120 FPS. Lite is aimed at
  entry devices that need a smaller download and smoother play at lower hardware cost. Do not
  paste flagship claw sensitivity codes from full BGMI into Lite — use the
  <a href="/bgmi-lite">BGMI Lite sensitivity calculator</a> for Camera, ADS, and Gyroscope
  baselines on 2GB–4GB / 30–60 FPS setups.
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
  This website is a fan-made sensitivity and info tool. It is not affiliated with Krafton. We
  never host BGMI Lite APKs. If someone messages you a download link or asks for payment for
  “early access,” treat it as a scam.
</p>
`.trim();

/** @deprecated Use BGMI_LITE_APK_ARTICLE_HTML */
export const BGMI_LITE_BETA_APK_ARTICLE_HTML = BGMI_LITE_APK_ARTICLE_HTML;

export const BGMI_LITE_APK_FAQS = [
  {
    id: "lite-apk-host",
    question: "Does this site provide a BGMI Lite APK download?",
    answer:
      "No. We do not host or mirror APK files. Pre-register or install only from the official Google Play listing published by Krafton.",
  },
  {
    id: "lite-launch-12-nov",
    question: "Is 12 November 2026 the official BGMI Lite launch date?",
    answer:
      "This page tracks 12 November 2026 for the countdown. Krafton has confirmed Lite for India by end of 2026; always confirm the final date on Google Play or Krafton India updates.",
  },
  {
    id: "lite-prereg",
    question: "How do I pre-register for BGMI Lite?",
    answer:
      "Open the official BGMI Lite page on Google Play (Android), tap Pre-register, and wait for Krafton to release the game. iOS timing may be announced separately.",
  },
  {
    id: "lite-sensi",
    question: "Should I use full BGMI sensitivity codes on Lite?",
    answer:
      "No. Flagship 90/120 FPS codes often feel wrong on Lite-class phones. Use the BGMI Lite calculator on this site, then fine-tune ±5 in Training Ground.",
  },
] as const;

/** @deprecated Use BGMI_LITE_APK_FAQS */
export const BGMI_LITE_BETA_APK_FAQS = BGMI_LITE_APK_FAQS;
