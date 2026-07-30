/** Free Fire / Free Fire Max coming-soon game pages. */

import { FREE_FIRE_ADVANCE_SERVER_PATH } from "@/src/lib/ffAdvanceServerPage";

export const FREE_FIRE_SLUG = "free-fire-sensitivity-settings-calculator";
export const FREE_FIRE_MAX_SLUG = "free-fire-max-sensitivity-settings-calculator";

export const FREE_FIRE_PATH = `/${FREE_FIRE_SLUG}`;
export const FREE_FIRE_MAX_PATH = `/${FREE_FIRE_MAX_SLUG}`;

/** Free Fire calculator lives on home (`/`); dedicated slug page still works. */
export const FREE_FIRE_NAV = [
  { label: "Home", href: "/" },
  { label: "FF Max", href: FREE_FIRE_MAX_PATH },
  { label: "Advance Server", href: FREE_FIRE_ADVANCE_SERVER_PATH },
] as const;

export type FreeFireVariant = "freefire" | "freefire-max";

export function freeFireConfig(variant: FreeFireVariant) {
  if (variant === "freefire-max") {
    return {
      slug: FREE_FIRE_MAX_SLUG,
      path: FREE_FIRE_MAX_PATH,
      navLabel: "Free Fire Max",
      title: "Free Fire Max Sensitivity Settings Calculator",
      soonMessage: "Free Fire Max Sensitivity Settings calculator — Update Soon",
      seoDescription:
        "Free Fire Max sensitivity calculator for General, Red Dot, 2x, 4x, sniper scope, and free look. Get RAM-based settings for your phone.",
      defaultArticleHtml: `<h2>Free Fire Max Sensitivity Settings Calculator</h2>
<p>Free Fire Max runs with higher graphics and can feel heavier on mid-range phones. That is why copying a normal Free Fire sensitivity often feels too fast or too slow in Max.</p>
<p>Use the Free Fire Max Sensitivity Settings Calculator above to generate settings from your phone RAM, DPI, FPS, and play style — then fine-tune in Training Ground.</p>
<h2>Why Free Fire Max Needs Its Own Sensitivity</h2>
<p>Max mode uses richer visuals and can drop frames on weaker devices. Lower FPS changes drag timing, so your General, Red Dot, and scope values should match the device you actually play Max on.</p>
<h2>Best Free Fire Max Sensitivity by RAM</h2>
<p>Use these ranges as a starting point if you want a quick setup before using the calculator:</p>
<div class="ff-table-wrap">
<table>
<thead>
<tr><th>Phone RAM</th><th>General</th><th>Red Dot</th><th>2X Scope</th><th>4X Scope</th><th>Sniper Scope</th><th>Free Look</th></tr>
</thead>
<tbody>
<tr><td>3GB - 4GB</td><td>95 - 100</td><td>90 - 98</td><td>90 - 100</td><td>85 - 95</td><td>45 - 60</td><td>75 - 90</td></tr>
<tr><td>6GB - 8GB</td><td>85 - 95</td><td>80 - 90</td><td>80 - 90</td><td>75 - 85</td><td>40 - 55</td><td>70 - 85</td></tr>
<tr><td>12GB+</td><td>75 - 88</td><td>70 - 82</td><td>70 - 85</td><td>65 - 80</td><td>35 - 50</td><td>60 - 75</td></tr>
</tbody>
</table>
</div>
<p><strong>Tip for Max:</strong> If your FPS dips in fights, keep General slightly higher so drag still feels responsive.</p>
<h2>DPI and Fire Button Tips for Free Fire Max</h2>
<ul>
<li><strong>Default DPI:</strong> Keep General near the top of your RAM range.</li>
<li><strong>Custom DPI 420 - 480:</strong> Lower General and Red Dot by about 5 - 10 points so aim does not overshoot.</li>
<li><strong>Fire button size:</strong> 42% - 52% works well for most phones in Max.</li>
</ul>
<h2>Aim practice tips</h2>
<p>After you calculate settings, practice 15 - 20 minutes in Training Ground with M1887, Desert Eagle, and an SMG. Adjust Red Dot first, then scopes.</p>
<h2>Conclusion</h2>
<p>Free Fire Max sensitivity should match your device performance, not a random pro code. Use the calculator on this page, test in Training Ground, and lock the values that feel stable in real matches.</p>`,
    };
  }
  return {
    slug: FREE_FIRE_SLUG,
    /** Public URL is home — slug page permanently redirects here. */
    path: "/",
    navLabel: "Free Fire",
    title: "Free Fire Sensitivity Settings Calculator",
    soonMessage: "Free Fire Sensitivity Settings calculator — Update Soon",
      seoDescription:
        "Free Fire & FF Max sensitivity settings calculator. Get updated sensitivity, DPI settings, and control layout for all RAM devices (2GB–8GB).",
      defaultArticleHtml: `<h2>Free Fire Sensitivity Settings Calculator</h2>
<p>If you play Free Fire (or FF MAX), the right sensitivity settings help your aim feel stable and consistent in-game.</p>
<p>Players often copy the sensitivity of pro players, but the feel still does not match. This happens because every phone has a different processor, RAM, and screen refresh rate.</p>
<p>The Free Fire Sensitivity Settings Calculator helps you build a starting setup for your phone.</p>
<h2>What is the Free Fire Sensitivity Calculator?</h2>
<p>The Free Fire sensitivity calculator is a tool that suggests sensitivity settings based on your smartphone specifications (RAM, screen DPI, and display refresh rate).</p>
<h2>Best Sensitivity Based on Your Phone's RAM (Quick Formula)</h2>
<p>If you don't want to use a tool, you can use this RAM-Based Sensitivity Rule:</p>
<div class="ff-table-wrap">
<table>
<thead>
<tr><th>Phone RAM</th><th>General</th><th>Red Dot</th><th>2X Scope</th><th>4X Scope</th><th>Sniper Scope</th><th>Free Look</th></tr>
</thead>
<tbody>
<tr><td>2GB - 3GB (Low-End)</td><td>100</td><td>95 - 100</td><td>100</td><td>95</td><td>50 - 60</td><td>80</td></tr>
<tr><td>4GB - 6GB (Mid-Range)</td><td>90 - 98</td><td>85 - 90</td><td>85 - 95</td><td>80 - 85</td><td>45 - 50</td><td>75</td></tr>
<tr><td>8GB - 12GB (High-End/Gaming)</td><td>80 - 88</td><td>75 - 80</td><td>75 - 80</td><td>70 - 75</td><td>35 - 40</td><td>65</td></tr>
</tbody>
</table>
</div>
<p><strong>Golden Rule:</strong> The lower your phone's RAM, the higher you should keep the screen sensitivity so dragging feels easier. High-end phones already have a smooth screen, so the sensitivity is kept slightly lower.</p>
<h2>How to Calculate Sensitivity with DPI (Dots Per Inch)?</h2>
<p>Many gamers play with increased phone DPI (Developer Options). If you change your DPI, set your sensitivity using this formula:</p>
<ul>
<li><strong>Default DPI (360 - 400):</strong> Keep General Sensitivity at 95 - 100.</li>
<li><strong>Custom DPI (450 - 500):</strong> Keep General Sensitivity at 85 - 90 (because increasing DPI already makes the phone much faster).</li>
</ul>
<h2>3 Practical Tips for Better Aim</h2>
<ul>
<li><strong>Fire Button Size:</strong> If your phone is small (2GB-4GB RAM), keep the button size at 40% to 45%. On bigger phones, keep the button size at 45% to 50%.</li>
<li><strong>Drag Technique:</strong> Changing sensitivity alone is not enough. Practice dragging the fire button smoothly using "Straight Up" or "Rotational Drag".</li>
<li><strong>Training Ground Practice:</strong> After setting any new sensitivity, practice in the Training Ground for at least 15-20 minutes.</li>
</ul>
<h2>Best Free Fire Sensitivity Settings 2026 (All RAM Variants)</h2>
<p>The table below is built according to your device's RAM so your screen movement stays smooth:</p>
<h3>1. Free Fire Sensitivity for 4GB RAM (Most Popular)</h3>
<p>This is a balanced starting setup for touch response on 4GB RAM Android phones:</p>
<ul>
<li><strong>General:</strong> 175 – 190</li>
<li><strong>Red Dot:</strong> 170 – 185</li>
<li><strong>2X Scope:</strong> 165 – 180</li>
<li><strong>4X Scope:</strong> 150 – 170</li>
<li><strong>Sniper Scope:</strong> 100 – 125</li>
<li><strong>Free Look:</strong> 170 – 190</li>
<li><strong>Fire Button Size:</strong> 48% - 52%</li>
</ul>
<h3>2. Sensitivity Settings for 6GB, 8GB &amp; 12GB RAM (High-End Devices)</h3>
<p>High-end and gaming phones have very smooth screens by default, so you shouldn't keep the sensitivity too high on them:</p>
<div class="ff-table-wrap">
<table>
<thead>
<tr><th>RAM Variant</th><th>General</th><th>Red Dot</th><th>2X Scope</th><th>4X Scope</th><th>Sniper Scope</th><th>Fire Button</th></tr>
</thead>
<tbody>
<tr><td>6GB RAM</td><td>165 - 180</td><td>160 - 175</td><td>160 - 170</td><td>150 - 165</td><td>90 - 110</td><td>45% - 50%</td></tr>
<tr><td>8GB RAM</td><td>150 - 165</td><td>145 - 160</td><td>150 - 165</td><td>140 - 155</td><td>80 - 100</td><td>42% - 48%</td></tr>
<tr><td>12GB RAM</td><td>140 - 155</td><td>135 - 150</td><td>140 - 155</td><td>130 - 145</td><td>70 - 90</td><td>40% - 45%</td></tr>
</tbody>
</table>
</div>
<h2>Brand-wise starting points (Vivo, Redmi, Samsung)</h2>
<p>Android phones from different companies have different UIs and processors. If you use a phone from these brands, try these starting values:</p>
<h3>Free Fire Sensitivity for 4GB RAM (Vivo Phones)</h3>
<p>On Vivo Y-Series and T-Series, keep the Red Dot slightly higher to improve touch smoothness:</p>
<p><strong>General:</strong> 185 | <strong>Red Dot:</strong> 180 | <strong>2X Scope:</strong> 175 | <strong>4X Scope:</strong> 165</p>
<p><strong>Best DPI for Vivo (4GB):</strong> Default + 40 (e.g. 360 to 400)</p>
<h3>Free Fire Sensitivity for 4GB RAM (Redmi / Poco)</h3>
<p>On Redmi/Xiaomi devices, there can be a slight response delay while dragging due to MIUI/HyperOS:</p>
<p><strong>General:</strong> 188 | <strong>Red Dot:</strong> 182 | <strong>2X Scope:</strong> 178 | <strong>4X Scope:</strong> 168</p>
<p><strong>Best DPI for Redmi (4GB):</strong> 420 - 450</p>
<h3>Free Fire Sensitivity for 4GB RAM (Samsung Phones)</h3>
<p>On Samsung's 4GB RAM phones (M-series / A-series), medium sensitivity works better to avoid frame drops:</p>
<p><strong>General:</strong> 178 | <strong>Red Dot:</strong> 172 | <strong>2X Scope:</strong> 168 | <strong>4X Scope:</strong> 155</p>
<h2>Gun control and drag tips</h2>
<p>Aim consistency depends on sensitivity, drag technique, and the gun:</p>
<h3>Shotgun (M1887 &amp; M1014):</h3>
<p>In close range, practice Rotation Drag (swiping the fire button up in a U-shape).</p>
<h3>Pistols (Desert Eagle):</h3>
<p>In mid range, do a Straight Drag (pull straight up). Keep the crosshair near the enemy's upper body, then drag smoothly.</p>
<h3>SMG &amp; AR Guns (MP40, AK, Woodpecker):</h3>
<p>Do a gentle drag so the spray stays controlled.</p>
<h2>Free Fire 4GB RAM DPI Settings</h2>
<p><strong>Warning:</strong> Avoid raising DPI above 500 — it can make your phone lag or feel unstable.</p>
<ul>
<li><strong>4GB RAM Default DPI:</strong> Usually 360 to 390.</li>
<li><strong>Suggested custom DPI:</strong> Keep it between 410 and 440 for a faster screen response.</li>
</ul>
<h2>Conclusion</h2>
<p>Instead of copying another player's settings in Free Fire, set sensitivity according to your device. Use the tables above, test in Training Ground, and keep the values that feel stable for you.</p>`,
};
}

export function isFreeFirePath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "" ||
    pathname === FREE_FIRE_PATH ||
    pathname.startsWith(`${FREE_FIRE_PATH}/`) ||
    pathname === FREE_FIRE_MAX_PATH ||
    pathname.startsWith(`${FREE_FIRE_MAX_PATH}/`)
  );
}

/** Merge Free Fire nav links if missing; pin Home / FF Max / Advance Server first. */
export function ensureFreeFireNavigation(
  links: Array<{ label: string; href: string }>,
): Array<{ label: string; href: string }> {
  const out = [...links];
  for (const item of FREE_FIRE_NAV) {
    const isFfHome = item.href === "/";
    const isFfMaxItem = item.href === FREE_FIRE_MAX_PATH;
    const has = out.some((row) => {
      if (new RegExp(item.label.replace(/\s+/g, "\\s*"), "i").test(row.label)) return true;
      if (isFfHome && (/^home$/i.test(row.label) || /^free\s*fire$/i.test(row.label))) return true;
      if (
        isFfMaxItem &&
        (/^ff\s*max$/i.test(row.label) || /free\s*fire\s*max/i.test(row.label))
      ) {
        return true;
      }
      if (row.href === item.href || row.href === item.href.replace(/^\//, "")) return true;
      if (isFfHome && (row.href === FREE_FIRE_PATH || row.href === FREE_FIRE_SLUG)) return true;
      return false;
    });
    if (!has) out.push({ label: item.label, href: item.href });
  }

  const normalized = out.map((row) => {
    const href = row.href.trim();
    const isHomeHref =
      href === "/" ||
      href === FREE_FIRE_PATH ||
      href === FREE_FIRE_SLUG ||
      href === FREE_FIRE_PATH.replace(/^\//, "");
    const isMaxHref =
      href === FREE_FIRE_MAX_PATH ||
      href === FREE_FIRE_MAX_SLUG ||
      href === FREE_FIRE_MAX_PATH.replace(/^\//, "");

    if (
      isHomeHref ||
      /^home$/i.test(row.label) ||
      (/free\s*fire/i.test(row.label) && !/max/i.test(row.label) && !/advance/i.test(row.label))
    ) {
      return { ...row, label: "Home", href: "/" };
    }
    if (isMaxHref || /^ff\s*max$/i.test(row.label) || /free\s*fire\s*max/i.test(row.label)) {
      return { ...row, label: "FF Max", href: FREE_FIRE_MAX_PATH };
    }
    if (/advance\s*server/i.test(row.label) || /free-fire-advance-server/i.test(row.href)) {
      return { ...row, label: "Advance Server", href: FREE_FIRE_ADVANCE_SERVER_PATH };
    }
    return row;
  });

  const isFf = (row: { label: string; href: string }) =>
    row.href === "/" || /^home$/i.test(row.label);
  const isFfMax = (row: { label: string; href: string }) =>
    row.href === FREE_FIRE_MAX_PATH || /^ff\s*max$/i.test(row.label);
  const isAdvance = (row: { label: string; href: string }) =>
    /advance\s*server/i.test(row.label) || /free-fire-advance-server/i.test(row.href);

  const freefire = normalized.find(isFf);
  const freefireMax = normalized.find(isFfMax);
  const advance = normalized.find(isAdvance);
  const rest = normalized.filter((row) => !isFf(row) && !isFfMax(row) && !isAdvance(row));

  return [
    ...(freefire ? [freefire] : []),
    ...(freefireMax ? [freefireMax] : []),
    ...(advance ? [advance] : []),
    ...rest,
  ];
}
