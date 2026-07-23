import { FaqAccordion } from "@/src/components/FaqAccordion";
import type { HomeFaqItem } from "@/src/server/repositories/homeFaqRepository";

type Props = {
  faqItems: HomeFaqItem[];
};

/**
 * Unique guide for /pubg-mobile-codes only — not shared with /pubg article.
 */
export function PubgMobileCodesArticle({ faqItems }: Props) {
  return (
    <div className="light-content-wrapper light-content--after-home-calculator">
      <div className="content-inner">
        <div className="article" lang="en">
          <h2>PUBG Sensitivity Settings Code — practical guide for Android players</h2>
          <p>
            If you have ever pasted someone else&apos;s sensitivity code into PUBG Mobile and still
            felt the gun climb on a 4x spray, you already know the problem: one code does not fit
            every phone. Screen size, touch delay, FPS mode, and whether you play gyro or thumbs
            all change how the same numbers feel in your hand.
          </p>
          <p>
            This page is built for that gap. Fill in your device details, tap Calculate, and you
            get a fresh set of sensitivity codes you can copy — including a row for the phone you
            selected. Prefer numbers instead of a code? Use Show sensitivity settings to open the
            camera and ADS values behind the result.
          </p>

          <h3>What you get after Calculate</h3>
          <p>
            The result table is meant to be used quickly in a lobby or training room. You will see
            a few ready-made styles:
          </p>
          <ul>
            <li>
              <b>Your phone name on top</b> — a code tied to this visit so you can save or share
              what you just generated.
            </li>
            <li>
              <b>Balanced All-Rounder</b> — a middle ground if you fight close and mid range and
              do not want an extreme gyro or non-gyro setup.
            </li>
            <li>
              <b>Tablet / iPad</b> — softer starting point for larger screens where the same swipe
              travels farther.
            </li>
            <li>
              <b>Gyro Stability</b> — for players who tilt to control recoil and want a calmer
              spray feel.
            </li>
            <li>
              <b>Non-gyro</b> — for thumb-only players who drag down on ADS instead of tilting the
              phone.
            </li>
          </ul>
          <p>
            Tap the copy icon next to any code, open PUBG Mobile → Settings → Sensitivity → Use
            Layout / Sensitivity Code, and paste. Then spend two or three minutes in Training
            Ground before you take it into ranked.
          </p>

          <h3>How to fill the calculator so the result matches you</h3>
          <p>
            You do not need every field perfect on the first try. Start honest, then adjust:
          </p>
          <ul>
            <li>
              <b>Phone model</b> — pick your real device from the list when you can. It helps the
              tool treat flagship and budget phones differently.
            </li>
            <li>
              <b>RAM and FPS mode</b> — use what you actually play on (Smooth 60, HDR 40, Extreme
              90, and so on). Lying here usually makes the result feel too fast or too sticky.
            </li>
            <li>
              <b>Finger setup</b> — 2-thumb, 3-finger, or claw. Claw players often need slightly
              different camera speed than pure thumbs.
            </li>
            <li>
              <b>Control type</b> — Gyroscope vs non-gyro. If you barely tilt in fights, choose
              non-gyro even if gyro is “on” in settings for free look.
            </li>
            <li>
              <b>iPad View / 90 FOV</b> — turn this on only if you truly play with that layout. It
              changes how far your finger moves for the same turn.
            </li>
          </ul>

          <h3>Codes vs on-screen sensitivity numbers</h3>
          <p>
            A sensitivity code is a shortcut: PUBG applies a full profile for you. The camera and
            ADS percentages are the long form of that profile. On this page both stay available —
            code first for speed, then Show sensitivity settings if you want to tweak one scope by
            hand (for example, only 3x or 6x after a few matches).
          </p>
          <p>
            Tip: if a code feels almost right but 6x still jumps, do not throw away the whole
            profile. Open the settings view, note the scope that feels wrong, and nudge that one
            value in-game by a small step.
          </p>

          <h3>A simple way to test before ranked</h3>
          <ul>
            <li>Paste one code (start with your phone row or Balanced).</li>
            <li>In Training Ground, spray an M416 or AKM on a wall at 3x and 4x.</li>
            <li>Do two close peeks without a scope, then one mid-range spray.</li>
            <li>
              If the sight climbs too hard, try Gyro Stability (gyro players) or lower ADS a bit in
              the settings view.
            </li>
            <li>
              If turns feel slow when you clear rooms, raise camera slightly or try the Balanced
              row again after changing FPS/RAM inputs.
            </li>
          </ul>
          <p>
            Most players settle after one or two Calculate runs — not after pasting ten random codes
            from social media.
          </p>

          <h3>Android notes that actually matter</h3>
          <p>
            On Android, touch sampling and heat matter more than people admit. If your phone drops
            from 90 to 40 FPS mid-fight, the same sensitivity will suddenly feel heavy. Keep game
            FPS stable before you chase a “perfect” code. Also avoid stacking a high gyro
            percentage with a very high ADS if you are new to gyro — start with Stability, then
            climb.
          </p>
          <p>
            This tool does not replace practice. It gives you a clean starting profile for your
            device and play style so you spend less time guessing and more time learning recoil
            patterns that stick.
          </p>
        </div>

        {faqItems.length > 0 ? <FaqAccordion items={faqItems} /> : null}
      </div>
    </div>
  );
}
