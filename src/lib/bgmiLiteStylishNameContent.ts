/** SEO guide + FAQs for /bgmi-lite-stylish-name */

export const BGMI_LITE_STYLISH_ARTICLE_HTML = `
<h2>BGMI Lite Stylish Name Guide: Readable IDs That Fit Rename</h2>
<p>
  A <strong>BGMI Lite stylish name</strong> is your normal nickname rewritten with Unicode
  letters or light symbols so it stands out in the lobby and kill feed — without needing a
  custom keyboard app.
</p>
<p>
  This tool is fan-made for Lite players. It does not connect to Krafton servers. Always paste
  the final name inside the official BGMI Lite client and preview before you spend a Rename Card.
</p>

<h3>Keep it short for Lite</h3>
<p>
  Treat about <strong>14 characters</strong> as a practical guide. Fancy letters and frames also
  count. If the in-game field rejects a name, remove the heaviest symbols first, then try a
  cleaner font style.
</p>

<h3>Readable beats overloaded</h3>
<ul>
  <li>One style family is enough — Bold <em>or</em> Frame, not both stacked heavily.</li>
  <li>Your real word should still be readable at a glance.</li>
  <li>If letters show as □ boxes on your phone, switch to Clean or Bold.</li>
</ul>

<h3>Safety</h3>
<p>
  We never ask for password, OTP, or UC. Ignore anyone selling “guaranteed unique IDs.” Rename
  only happens inside the official game client.
</p>
`.trim();

export const BGMI_LITE_STYLISH_FAQS = [
  {
    id: "lite-stylish-what",
    question: "What is a BGMI Lite stylish name?",
    answer:
      "It is your nickname styled with Unicode fonts or light symbols you can copy and paste into BGMI Lite rename. No special keyboard app is required.",
  },
  {
    id: "lite-stylish-limit",
    question: "What character limit should I follow?",
    answer:
      "Use about 14 characters as a practical guide. The live meter on this page helps you stay short. The official in-game field is the final check.",
  },
  {
    id: "lite-stylish-boxes",
    question: "Why do some stylish letters show as boxes?",
    answer:
      "Some phones or game builds do not render every Unicode style. Try Clean or Bold, or remove decorative frames, then preview again in Lite.",
  },
  {
    id: "lite-stylish-safe",
    question: "Is this tool safe?",
    answer:
      "Yes for local styling — names are generated in your browser. We never ask for login, OTP, or payment. Rename only inside the official BGMI Lite client.",
  },
  {
    id: "lite-stylish-how",
    question: "How do I apply the name in BGMI Lite?",
    answer:
      "Copy a style from this page, open BGMI Lite, use Rename / nickname edit, paste the name, preview, then confirm if you have a Rename Card or enough UC.",
  },
] as const;

export type StylishReadyIdea = {
  id: string;
  label: string;
  value: string;
};

export const STYLISH_READY_IDEAS: Array<{
  tab: string;
  items: StylishReadyIdea[];
}> = [
  {
    tab: "Clean",
    items: [
      { id: "c1", label: "Nova", value: "★Nova★" },
      { id: "c2", label: "Pulse", value: "Pulse丨X" },
      { id: "c3", label: "Apex", value: "【Apex】" },
      { id: "c4", label: "Drift", value: "Drift✦" },
      { id: "c5", label: "Orbit", value: "Orbit⚡" },
      { id: "c6", label: "Blade", value: "Blade⚔" },
    ],
  },
  {
    tab: "Pro",
    items: [
      { id: "p1", label: "Raven", value: "RAV丨EN" },
      { id: "p2", label: "Ghost", value: "GHOST★" },
      { id: "p3", label: "Viper", value: "【VIPER】" },
      { id: "p4", label: "Storm", value: "STORM彡" },
      { id: "p5", label: "Ace", value: "♛ACE" },
      { id: "p6", label: "Flux", value: "FLUX丨99" },
    ],
  },
  {
    tab: "Attitude",
    items: [
      { id: "a1", label: "Savage", value: "★Savage" },
      { id: "a2", label: "Rebel", value: "Rebel乂" },
      { id: "a3", label: "Fearless", value: "Fearless" },
      { id: "a4", label: "Hunt", value: "HUNT༒" },
      { id: "a5", label: "Rage", value: "Rage⚡" },
      { id: "a6", label: "King", value: "♛King" },
    ],
  },
];
