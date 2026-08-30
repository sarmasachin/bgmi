/**
 * Complete symbol catalog extracted from user gallery photos.
 * Used only by generators — never shown as a clickable picker.
 */

/** Single / short marks seen across all screenshots. */
export const PHOTO_SIDE_MARKS = [
  // Crowns / peaks
  "亗", "♛", "♕",
  // Wings / slashes
  "彡", "メ", "乂", "ㄨ", "〤", "×", "✕", "✖", "✗",
  // Ornate flourishes
  "꧁", "꧂", "༺", "༻", "๛", "࿐", "᭄", "༄", "๏", "༒", "ೃ⁀➷",
  // Stars / dots / sparks
  "★", "☆", "✦", "✧", "★︎", "☆︎", "✧︎", "*", "•", "·", "∙", "‧", "°", "˚", "◌",
  // Hazard / combat / spirit
  "☣", "☣︎", "☢", "☠", "☠︎", "⚡", "⚔", "⚔️", "†", "‡", "♰", "☯", "☯︎", "ॐ", "🕉", "☪︎",
  // Flowers / hearts / misc
  "✿", "❀", "❁", "ꕤ", "❦", "❧", "❖", "◈", "ღ", "❤", "❣", "✨",
  // JP / CN decorative
  "ツ", "ヅ", "ッ", "々", "〆", "乡", "乛", "艾", "文", "么", "冬", "會", "厶",
  // Arrows / pointers
  "↣", "➢", "➤", "➜", "→", "←", "»", "«", "›", "‹", "➳", "➷",
  // Extras from cards
  "ϟ", "۝", "⚚", "👽", "🥺", "©", "®", "¶", "€", "£", "¥",
] as const;

/** Matched frame pairs from photos. */
export const PHOTO_FRAME_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["『", "』"],
  ["「", "」"],
  ["【", "】"],
  ["〖", "〗"],
  ["〔", "〕"],
  ["[", "]"],
  ["{", "}"],
  ["(", ")"],
  ["꧁", "꧂"],
  ["༺", "༻"],
  ["꧁༺", "༻꧂"],
  ["༺═", "═༻"],
  ["⟪", "⟫"],
  ["⟨", "⟩"],
  ["‹", "›"],
  ["«", "»"],
  ["⫷", "⫸"],
  ["⧼", "⧽"],
  ["❰", "❱"],
  ["⎝", "⎠"],
  ["》", "《"],
  ["「*", "*」"],
  ["*『", "』*"],
  ["»•", "«"],
  ["~»", "«~"],
  ["~-", "-~"],
  ["*", "*"],
  ["★", "★"],
  ["✧", "✧"],
  ["♛", "♛"],
  ["亗", "亗"],
  ["彡", "彡"],
  ["†", "†"],
  ["×", "×"],
  ["๛", "๛"],
  ["࿐", "࿐"],
  ["ೃ⁀➷", "ೃ⁀➷"],
  ["文", "文"],
  ["✿", "✿"],
  ["☯", "☯"],
  ["☯︎", "☯︎"],
  ["→🥺", "🥺←"],
  ["✨", "❣"],
];

/** Prefix strings from photo cards (before name). */
export const PHOTO_PREFIXES = [
  "亗", "彡", "†", "♛", "★", "↣", "➢", "»•", "~»", "~-", "»", "›", "๛",
  "MR°᭄", "MR°", "MRメ", "MR乂", "MR.•", "ᴵⁿᵈ᭄", "ᶦⁿᵈ᭄", "ᶥᶰᵈ", "IND᭄",
  "WG᭄", "᭄", "༄", "༄ᶦᶰᵈ᭄✿", "˚", "•", "×", "〆", "艾", "ϟ", "〤",
  "▄︻┻┳═一", "▄︻デ═一", "▄︻┳デ═—", "╾━╤デ┳︻", "︻┳デ═—", "—̳͟͞͞",
  "ೃ⁀➷", "God乡", "•©€", "R•",
] as const;

/** Suffix strings from photo cards (after name). */
export const PHOTO_SUFFIXES = [
  "亗", "彡", "ツ", "ヅ", "ッ", "々", "〆", "†", "♛", "★", "☯", "☯︎",
  "☣", "☣︎", "☠", "☠︎", "࿐", "᭄", "˚", "°", "×", "✿", "⚔", "⚔️",
  "ॐ", "🕉", "乡", "๛", "ϟ", "ღ", "❣", "✨", "👽", "🥺", "YT",
  "ೃ⁀➷", "—̳͟͞͞", "king", "«~", "«",
] as const;

/** Separators / mid connectors from photos. */
export const PHOTO_SEPARATORS = [
  "丨", "｜", "|", "·", "•", "∙", "×", "✕", "—", "–", "─", "━", "~", "-", "_",
  "〤", "乂", "メ", "乡", "乛", "†", "★", "♛", "☯",
] as const;

/** Gun / sniper ASCII arts from photos. */
export const PHOTO_GUN_ARTS = [
  "▄︻┻┳═一",
  "▄︻デ═一",
  "▄︻┳デ═—",
  "╾━╤デ┳︻",
  "︻┳デ═—",
  "▄︻デ~`",
  "══━一",
  "═──",
  "═─",
] as const;

/** Extra gallery templates using photo symbols. `{n}{u}{s}{l}{b}` placeholders. */
export const PHOTO_NAME_TEMPLATES: ReadonlyArray<{
  id: string;
  category: "crown" | "wings" | "spaced" | "fancy" | "clan" | "marks";
  label: string;
  hint: string;
  pattern: string;
}> = [
  { id: "p1", category: "crown", label: "Santosh crown", hint: "亗『 gaps 』亗", pattern: "亗『 {s} 』亗" },
  { id: "p2", category: "crown", label: "Royal leet", hint: "亗RØ¥ÄŁ", pattern: "亗{l}亗" },
  { id: "p3", category: "crown", label: "Crown plain", hint: "亗NAME亗", pattern: "亗{u}亗" },
  { id: "p4", category: "wings", label: "Royal wings", hint: "彡Name彡", pattern: "彡{u}彡" },
  { id: "p5", category: "wings", label: "Ornate flower", hint: "꧁༺✿༻꧂", pattern: "꧁༺✿{n}✿༻꧂" },
  { id: "p6", category: "wings", label: "Ind gamer", hint: "༄᭄✿࿐", pattern: "༄ᶦⁿᵈ᭄✿{u}࿐" },
  { id: "p7", category: "wings", label: "Thai zone", hint: "๛『』๛", pattern: "๛『{u}』๛" },
  { id: "p8", category: "wings", label: "Dark soul", hint: "彡[々]彡★", pattern: "彡[{l}々]彡★" },
  { id: "p9", category: "spaced", label: "Pain bio", hint: "gaps ☣", pattern: "{s} ☣" },
  { id: "p10", category: "spaced", label: "Goku mark", hint: "gaps 々", pattern: "{s} 々" },
  { id: "p11", category: "spaced", label: "Lucifer spaced", hint: "L U C I F E R", pattern: "{s}" },
  { id: "p12", category: "spaced", label: "Star gaps", hint: "* gaps *", pattern: "*{s}*" },
  { id: "p13", category: "clan", label: "MR slash", hint: "»•MRメ", pattern: "»•MRメ {s}亗" },
  { id: "p14", category: "clan", label: "MR smile", hint: "MR乂『』ツ", pattern: "MR乂『{n}』ツ" },
  { id: "p15", category: "clan", label: "God RP gun", hint: "乡♛▄︻", pattern: "God乡RP♛{u}▄︻┻┳═一" },
  { id: "p16", category: "clan", label: "Cobra yin", hint: "~»MR.•☯«~", pattern: "~»MR.• {u} ☯«~" },
  { id: "p17", category: "clan", label: "Zone god", hint: "[ ] ๛", pattern: "[{l}] ๛" },
  { id: "p18", category: "marks", label: "Toxic spark", hint: "✨ヅ❣", pattern: "✨{l}ヅ❣" },
  { id: "p19", category: "marks", label: "Lord swords", hint: "꧁⚔꧂", pattern: "꧁{u}⚔꧂" },
  { id: "p20", category: "marks", label: "Mahakal", hint: "†- spaced", pattern: "†-{s}" },
  { id: "p21", category: "marks", label: "Worthy", hint: "*『』*", pattern: "*I~Am『{n}』*" },
  { id: "p22", category: "marks", label: "Spider staff", hint: "~-⚚-~", pattern: "~-⚚{u}⚚-~" },
  { id: "p23", category: "marks", label: "Jerry plead", hint: "→🥺←", pattern: "→🥺{s}🥺←" },
  { id: "p24", category: "marks", label: "Zero arrows", hint: "→←", pattern: "→{s}←" },
  { id: "p25", category: "marks", label: "Poison x", hint: "gaps ×", pattern: "{s} ×" },
  { id: "p26", category: "marks", label: "Abhi spark", hint: "꧁᭄✿࿐", pattern: "꧁ᶦⁿᵈ᭄✿{u}࿐" },
  { id: "p27", category: "marks", label: "Killer jark", hint: "࿐ᴶ", pattern: "࿐{u}࿐" },
  { id: "p28", category: "fancy", label: "Ø toxic", hint: "leet", pattern: "{l}" },
  { id: "p29", category: "clan", label: "Gun only", hint: "▄︻ name", pattern: "▄︻┻┳═一{n}" },
  { id: "p30", category: "clan", label: "Gun long", hint: "╤デ┳", pattern: "╾━╤デ┳︻{n}" },
];
