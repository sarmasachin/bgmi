/** Shared legal-page helpers safe for client + server. */

export const CORE_LEGAL_SLUGS = ["privacy", "terms", "disclaimer"] as const;
export type CoreLegalSlug = (typeof CORE_LEGAL_SLUGS)[number];

export function isCoreLegalSlug(slug: string): slug is CoreLegalSlug {
  return (CORE_LEGAL_SLUGS as readonly string[]).includes(slug);
}

export function normalizeLegalSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function defaultTitleForSlug(slug: string) {
  if (slug === "privacy") return "Privacy Policy";
  if (slug === "terms") return "Terms & Conditions";
  if (slug === "disclaimer") return "Disclaimer";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function defaultSeoForSlug(slug: string) {
  if (slug === "privacy") {
    return {
      seoTitle: "Privacy Policy",
      seoDescription:
        "Privacy Policy for Sensitivity Settings — how our fan-made calculator site handles contact forms, optional emails, cookies, ads, and notifications.",
    };
  }
  if (slug === "terms") {
    return {
      seoTitle: "Terms & Conditions",
      seoDescription:
        "Terms & Conditions for Sensitivity Settings — rules for using our fan-made Free Fire, BGMI, and PUBG Mobile sensitivity calculator website.",
    };
  }
  if (slug === "disclaimer") {
    return {
      seoTitle: "Disclaimer",
      seoDescription:
        "Disclaimer for Sensitivity Settings — a fan-made calculator site, not affiliated with Garena Free Fire, PUBG Mobile, BGMI, or Krafton.",
    };
  }
  return { seoTitle: defaultTitleForSlug(slug), seoDescription: "" };
}

export function defaultHtmlForSlug(slug: string) {
  if (slug === "privacy") {
    return `<p><strong>Last updated:</strong> 30 July 2026</p>
<p>This Privacy Policy describes how <strong>Sensitivity Settings</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) handles information on <a href="https://sensitivitysettings.com">sensitivitysettings.com</a> (the &quot;Site&quot;).</p>
<p>Sensitivity Settings is a <strong>fan-made</strong> sensitivity calculator and gaming tip website. It is <strong>not</strong> owned by, run by, or affiliated with Garena, Krafton, PUBG Corporation, Free Fire International, PUBG Mobile, or BGMI.</p>
<p>By using the Site, you agree to this Privacy Policy. If you do not agree, please stop using the Site and do not send us personal information.</p>

<h2>1. What this policy covers</h2>
<p>This policy covers information collected through the Site, including the calculator pages, contact form, ratings, reviews, comments (where enabled), optional browser notifications, and any analytics or advertising tools that may run on the Site.</p>

<h2>2. Who we are / contact</h2>
<p>If you have privacy questions or want to request access, correction, or deletion of your information, email:</p>
<p><a href="mailto:support@sensitivitysettings.com">support@sensitivitysettings.com</a></p>

<h2>3. Information we collect</h2>
<h3>3.1 Information you choose to give us</h3>
<ul>
<li><strong>Contact us form:</strong> name, email, subject, and message.</li>
<li><strong>Ratings:</strong> star rating, and email only if you optionally enter one.</li>
<li><strong>Reviews:</strong> display name, review text, optional email, optional phone/device model, selected game, and whether your name may appear publicly.</li>
<li><strong>Comments</strong> (on pages where comments are enabled): name, email, and comment text.</li>
<li><strong>Browser notifications:</strong> only if you allow notifications — we store the push subscription details needed to send those notifications.</li>
</ul>
<h3>3.2 Information collected automatically</h3>
<ul>
<li><strong>Technical data:</strong> IP address (used for security and rate limiting), browser/device info, approximate visit time, pages viewed, and referrer where available.</li>
<li><strong>On-device storage:</strong> we may use <code>localStorage</code> (for example, to remember that you already rated a page, or that you dismissed a notification prompt).</li>
<li><strong>Cookies / similar tech:</strong> may be set by us or by third parties such as analytics or ad partners.</li>
</ul>
<h3>3.3 Calculator fields</h3>
<p>Fields like device name, RAM, DPI, FPS, and play style are used to calculate sensitivity suggestions for you. We do not create a login account from those fields.</p>

<h2>4. How we use information</h2>
<ul>
<li>to run and improve the calculator and Site;</li>
<li>to reply to Contact us messages;</li>
<li>to moderate ratings, reviews, and comments;</li>
<li>to send a short confirmation/thank-you email when you provide an email with a submission;</li>
<li>to send browser push notifications only after you enable them;</li>
<li>to prevent spam, abuse, and attacks; and</li>
<li>to measure Site traffic and show ads (if advertising is enabled).</li>
</ul>
<p>We do <strong>not</strong> sell your personal information. We do <strong>not</strong> use your data to pretend to be Garena, Krafton, or any game publisher.</p>

<h2>5. Email use (important)</h2>
<p>There is <strong>no public newsletter / email subscribe form</strong> on the Site.</p>
<p>If you type your email into Contact us, ratings, reviews, or comments, we may store it and use it to respond to that submission or send a related confirmation. Please do not submit an email unless you are comfortable with that use.</p>
<p>To ask us to delete an email you previously submitted, write to <a href="mailto:support@sensitivitysettings.com">support@sensitivitysettings.com</a>.</p>

<h2>6. Cookies, analytics, and ads</h2>
<p>Depending on Site settings, we may use:</p>
<ul>
<li><strong>Essential storage</strong> for basic features and security;</li>
<li><strong>Analytics</strong> (for example Google Analytics or similar) to understand traffic; and</li>
<li><strong>Advertising</strong> (for example Google AdSense or similar) to display ads. Ad partners may use cookies or device identifiers to serve and measure ads.</li>
</ul>
<p>More about Google on partner sites: <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">https://policies.google.com/technologies/partner-sites</a>.</p>
<p>You can block or clear cookies in your browser. Some features or ads may not work the same if cookies are blocked.</p>

<h2>7. Push notifications</h2>
<p>Push notifications are optional. If you allow them, we can send Site updates to that browser. You can turn notifications off anytime in your browser or phone settings.</p>

<h2>8. When we share information</h2>
<p>We may share information only with:</p>
<ul>
<li>hosting, email, push, analytics, or advertising providers that help us operate the Site;</li>
<li>authorities or advisors when required by law or to protect safety and security; or</li>
<li>a new operator if the Site is transferred, under continued privacy protections.</li>
</ul>
<p>Approved public reviews may show your chosen display name and review text. Do not post passwords, phone numbers, or other sensitive details in public reviews or comments.</p>

<h2>9. How long we keep data</h2>
<p>We keep information only as long as needed to operate the Site, handle support, prevent abuse, and meet legal requirements. After that, we delete or anonymize it where practical. You can request deletion of your submitted personal information by emailing us.</p>

<h2>10. Security</h2>
<p>We take reasonable steps to protect information (including access controls and HTTPS where supported). No website can guarantee perfect security.</p>

<h2>11. Children</h2>
<p>The Site is for a general audience and is not directed at children under 13 (or the higher age required in your country). We do not knowingly collect children’s personal information. If you think a child submitted personal data, contact us and we will delete it when we can verify the request.</p>

<h2>12. Your choices and rights</h2>
<p>Depending on where you live, you may have rights to access, correct, delete, or limit use of your personal information, or to withdraw consent. To make a request, email <a href="mailto:support@sensitivitysettings.com">support@sensitivitysettings.com</a>.</p>
<p>You can also:</p>
<ul>
<li>skip optional email fields;</li>
<li>clear site data / cookies in your browser;</li>
<li>use Google ad settings or industry opt-out tools for personalized ads where available; and</li>
<li>disable browser notifications.</li>
</ul>

<h2>13. Third-party sites and game brands</h2>
<p>Links to other websites (including game publisher sites) have their own privacy policies. We are not responsible for those sites. Game names and trademarks belong to their owners and are mentioned only to describe calculator topics for players.</p>

<h2>14. International users</h2>
<p>The Site may be hosted or processed outside your country. By using the Site, you understand your information may be processed in those locations by us or our service providers.</p>

<h2>15. Changes to this policy</h2>
<p>We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date will change when we publish updates. Continued use of the Site after changes means you accept the updated policy.</p>

<h2>16. Contact</h2>
<p><strong>Sensitivity Settings</strong><br />Email: <a href="mailto:support@sensitivitysettings.com">support@sensitivitysettings.com</a><br />Website: <a href="https://sensitivitysettings.com">https://sensitivitysettings.com</a></p>
<p><em>This page is for clear public disclosure. It is not formal legal advice.</em></p>`;
  }
  if (slug === "terms") {
    return `<p><strong>Last updated:</strong> 30 July 2026</p>
<p>These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of <strong>Sensitivity Settings</strong> at <a href="https://sensitivitysettings.com">sensitivitysettings.com</a> (the &quot;Site&quot;). By accessing or using the Site, you agree to these Terms. If you do not agree, do not use the Site.</p>

<h2>1. About the Site</h2>
<p>Sensitivity Settings is a <strong>fan-made</strong> website that provides sensitivity calculator tools, tips, and related gaming information for players. The Site is operated independently.</p>
<p>This is <strong>not</strong> a Garena Free Fire International website, and it is <strong>not</strong> a PUBG Mobile or BGMI (Battlegrounds Mobile India) website. We are not owned by, operated by, affiliated with, endorsed by, or sponsored by Garena International, Krafton Inc., PUBG Corporation, or any other game publisher.</p>

<h2>2. Eligibility</h2>
<p>You may use the Site if you can form a binding agreement under the laws of your country. If you are under the age required in your country to use online services, you may use the Site only with permission from a parent or guardian. The Site is not directed to children under 13.</p>

<h2>3. What the Site provides</h2>
<p>The Site may include:</p>
<ul>
<li>sensitivity calculators and suggested settings;</li>
<li>guides, tips, news, and informational content;</li>
<li>ratings, reviews, and comments features;</li>
<li>a Contact us form; and</li>
<li>optional browser notifications, analytics, and advertising.</li>
</ul>
<p>Features may change, move, or be removed at any time without notice.</p>

<h2>4. Calculator results are guidance only</h2>
<p>All calculator outputs, presets, tips, and related content are <strong>estimates and suggestions only</strong>. Results can vary based on:</p>
<ul>
<li>phone model, screen, DPI, and performance;</li>
<li>game version / update;</li>
<li>controls, HUD, grip, and play style; and</li>
<li>network conditions and personal preference.</li>
</ul>
<p>We do <strong>not</strong> guarantee better aim, headshots, wins, ranks, or any in-game performance. You apply settings at your own risk and discretion. Always follow the game’s rules and fair-play policy.</p>

<h2>5. No publisher account services</h2>
<p>We do not ask for your Free Fire, Garena, PUBG, or BGMI login password. We do not provide account recovery, top-ups, Advance Server selection, or publisher customer support. For account help, use only the game publisher’s own support channels.</p>

<h2>6. Acceptable use</h2>
<p>You agree not to:</p>
<ul>
<li>use the Site for illegal, harmful, or abusive activity;</li>
<li>attempt to hack, overload, scrape, or disrupt the Site or its servers;</li>
<li>upload malware, spam, or misleading content;</li>
<li>impersonate another person, brand, or game publisher;</li>
<li>post offensive, hateful, sexual, or infringing content in reviews/comments;</li>
<li>collect other users’ personal data from the Site without permission; or</li>
<li>use automated bots in a way that harms Site performance or security.</li>
</ul>
<p>We may remove content, block access, or take other action if we believe these Terms were violated.</p>

<h2>7. User submissions (contact, ratings, reviews, comments)</h2>
<p>If you send a Contact us message, rating, review, or comment, you confirm that:</p>
<ul>
<li>the information is accurate to the best of your knowledge;</li>
<li>you have the right to submit it; and</li>
<li>it does not violate law or these Terms.</li>
</ul>
<p>You give us a non-exclusive right to use, store, moderate, display (for public reviews you choose to publish), and process your submission to operate the Site. Reviews may be pending moderation and may be approved, edited for formatting, rejected, or removed.</p>
<p>Do not submit passwords, OTP codes, payment details, or other sensitive personal information.</p>

<h2>8. Intellectual property</h2>
<p>Site design, layout, original text, calculator logic presentation, logos we created (such as our Site brand mark), and other original materials belong to Sensitivity Settings or its licensors. You may use the Site for personal, non-commercial use.</p>
<p>You may not copy, mirror, scrape, resell, or republish our tools or content without permission, except for ordinary personal sharing of links.</p>
<p>Game names, characters, logos, and trademarks (including Free Fire, Free Fire Max, PUBG Mobile, BGMI, Garena, and Krafton) belong to their respective owners and are used only for descriptive / informational purposes.</p>

<h2>9. Third-party links, ads, and services</h2>
<p>The Site may link to third-party websites or show third-party ads (for example via ad networks). We do not control third-party sites or ads and are not responsible for their content, products, privacy practices, or terms. Your use of third-party services is between you and that third party.</p>

<h2>10. Privacy</h2>
<p>How we handle information is described in our <a href="/privacy">Privacy Policy</a>. By using the Site, you also acknowledge that policy.</p>

<h2>11. Disclaimer of warranties</h2>
<p>The Site is provided on an <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong> basis. To the maximum extent allowed by law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.</p>
<p>We do not warrant that the Site will be uninterrupted, error-free, secure, or free of harmful components, or that calculator results will meet your expectations.</p>

<h2>12. Limitation of liability</h2>
<p>To the maximum extent allowed by law, Sensitivity Settings and its operators will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, goodwill, game progress, account status, or gameplay outcome, arising from:</p>
<ul>
<li>use of or inability to use the Site;</li>
<li>settings you apply in any game;</li>
<li>user submissions or third-party content/ads; or</li>
<li>unauthorized access to or alteration of transmissions or data.</li>
</ul>
<p>If liability cannot be fully excluded under applicable law, our total liability for claims relating to the Site will be limited to the amount you paid us (if any) for using the Site in the 12 months before the claim, or USD 0 if the Site is free.</p>

<h2>13. Indemnity</h2>
<p>You agree to defend and hold harmless Sensitivity Settings and its operators from claims, damages, losses, and expenses (including reasonable legal fees) arising from your misuse of the Site, your submissions, or your violation of these Terms or applicable law.</p>

<h2>14. Suspension and changes</h2>
<p>We may change, suspend, or discontinue any part of the Site at any time. We may also update these Terms. The &quot;Last updated&quot; date will change when we publish updates. Continued use after an update means you accept the revised Terms.</p>

<h2>15. Governing law</h2>
<p>These Terms are governed by the laws applicable in India, without regard to conflict-of-law rules, unless mandatory consumer laws in your country say otherwise. Courts in India shall have jurisdiction for disputes arising from these Terms, subject to any rights you have under local mandatory law.</p>

<h2>16. Contact</h2>
<p>Questions about these Terms:</p>
<p><strong>Sensitivity Settings</strong><br />Email: <a href="mailto:support@sensitivitysettings.com">support@sensitivitysettings.com</a><br />Website: <a href="https://sensitivitysettings.com">https://sensitivitysettings.com</a></p>
<p>Also see our <a href="/disclaimer">Disclaimer</a> and <a href="/privacy">Privacy Policy</a>.</p>
<p><em>These Terms are for clear public rules of use. They are not formal legal advice.</em></p>`;
  }
  if (slug === "disclaimer") {
    return `<p>Sensitivity Settings is a fan-made sensitivity calculator website created by a gamer for other gamers. This is not a Garena Free Fire International website, and it is not a PUBG Mobile or BGMI (Battlegrounds Mobile India) website. We are not owned by, operated by, affiliated with, endorsed by, or sponsored by Garena International, Krafton Inc., PUBG Corporation, or any other game publisher.</p>
<p>All game names, logos, characters, and related trademarks mentioned on this site belong to their respective owners and are used only for descriptive, informational purposes so players can find device-based sensitivity settings more easily.</p>
<p>Calculator outputs are estimates and guidance only — not guarantees of in-game performance. Always follow the game’s rules and fair-play policies.</p>
<p>We are not responsible for any loss, account action, or gameplay outcome related to settings you choose to apply.</p>`;
  }
  return `<p>Edit this page content from the admin panel.</p>`;
}

export function legalPublicPath(slug: string) {
  if (isCoreLegalSlug(slug)) return `/${slug}`;
  return `/legal/${slug}`;
}

/** Slugs that must not be used for custom legal pages (app routes). */
export const RESERVED_APP_SLUGS = new Set([
  "admin",
  "api",
  "contact",
  "news",
  "pubg",
  "privacy",
  "terms",
  "disclaimer",
  "legal",
  "sitemap",
  "robots",
  "manifest",
  "favicon",
  "free-fire-sensitivity-settings-calculator",
  "free-fire-max-sensitivity-settings-calculator",
]);

