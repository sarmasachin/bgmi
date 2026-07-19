type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  wrapperClassName?: string;
  faqItems: HomeFaqItem[];
  game?: "bgmi" | "pubg";
};

/** PUBG Mobile FAQ cards (shown only on /pubg). */
const PUBG_FAQS: HomeFaqItem[] = [
  {
    id: "pubg-faq-1",
    question: "Can using the sensitivity calculator get my account banned?",
    answer:
      "Absolutely not. This is not a hack, a 90 FPS config file, or a third-party tool that tampers with the game database. It is only a mathematical utility that helps you set the official in-game options correctly. It is 100% safe.",
  },
  {
    id: "pubg-faq-2",
    question: "Does the generated Sensitivity Code always work?",
    answer:
      "According to PUBG Mobile rules, sensitivity codes shared in-game have an expiry time. If a code shows as expired because of the game servers, come back to our website and press Calculate again — our algorithm will immediately generate a fresh, latest working code format for you.",
  },
  {
    id: "pubg-faq-3",
    question: "What is the difference between Gyroscope and Gyroscope ADS?",
    answer:
      "Normal gyroscope sensitivity works when you tilt the phone to look around or track enemies without firing. Gyroscope ADS sensitivity is active only while you hold the fire button and shoot — it mainly helps control vertical gun recoil and deliver a no-recoil spray.",
  },
];

function BgmiEnglishArticle() {
  return (
    <div className="article" lang="en">
      <h2>BGMI Sensitivity Settings Calculator: Perfect No Recoil Code &amp; Guide (2026)</h2>
      <p>
        Are you losing close-range fights in BGMI (Battlegrounds Mobile India) again and again? Or
        when you spray with a 4x or 6x scope at long range, does your gun climb into the sky? If yes,
        the problem is usually not your gameplay — it is your BGMI Sensitivity Settings.
      </p>
      <p>
        There are thousands of &quot;Best BGMI Sensitivity Codes&quot; online, but they often fail
        because every player has a different phone, play style (Thumbs vs Claw), and reflex speed. To
        solve that, we built the BGMI Sensitivity Settings Calculator — a tool that generates perfect
        no-recoil sensitivity values based on your device and gaming style.
      </p>

      <h3>Why Sensitivity Settings Matter in BGMI</h3>
      <p>
        BGMI is a highly competitive battle royale game where even a millisecond can decide a win or
        loss. The right sensitivity gives you these advantages:
      </p>
      <ul>
        <li>
          <b>Zero Recoil:</b> Gun shake is controlled, so your sprays land on the enemy.
        </li>
        <li>
          <b>Fast Reflexes:</b> You can transfer aim quickly in close-range fights.
        </li>
        <li>
          <b>More Headshots:</b> Proper sensitivity helps lock your aim on the enemy&apos;s head.
        </li>
      </ul>

      <h3>What Is the BGMI Sensitivity Settings Calculator and How Does It Work?</h3>
      <p>
        Our BGMI Sensitivity Calculator uses a smart algorithm. Instead of copying another pro
        player&apos;s setup, it builds customized settings from your preferences.
      </p>
      <p>The tool asks for a few basic inputs, such as:</p>
      <ul>
        <li>
          <b>Device Type:</b> (Low-end Android, Premium Android, or iPhone/iPad)
        </li>
        <li>
          <b>Playing Style:</b> (Non-Gyroscope, Full Gyroscope, or Scope-Only Gyro)
        </li>
        <li>
          <b>Control Layout:</b> (2-Finger, 3-Finger, or 4-Finger/Claw)
        </li>
      </ul>
      <p>
        Based on those inputs, the calculator computes the right Camera, ADS (Aim Down Sight), and
        Gyroscope Sensitivity for you.
      </p>

      <h3>Main Types of BGMI Sensitivity (Understanding the Basics)</h3>
      <p>
        To get the most from our calculator, it helps to understand how these settings work:
      </p>

      <h4>1. Camera Sensitivity (Free Look &amp; Screen)</h4>
      <p>
        This setting controls how you look around by swiping the screen without firing. The Eye
        Button speed is also tied to this. Correct camera sensitivity is important for spotting
        enemies.
      </p>

      <h4>2. ADS (Aim Down Sight) Sensitivity</h4>
      <p>
        ADS sensitivity works when you hold the fire button and control recoil with your finger. If
        you are a non-gyro player, this is usually your most important setting.
      </p>

      <h4>3. Gyroscope Sensitivity</h4>
      <p>
        Gyro players tilt the phone to control recoil and aim instead of only swiping the screen.
        Most pro players use Full Gyroscope today for close-range fights and laser-like sprays.
      </p>

      <h3>BGMI Best Sensitivity Settings (Base Reference)</h3>
      <p>
        If you want a balanced base before using the calculator, here are solid 2026 reference
        ranges:
      </p>

      <h4>Camera Sensitivity (No-Firing)</h4>
      <ul>
        <li>3rd Person No Scope: 115-130%</li>
        <li>1st Person No Scope: 115-125%</li>
        <li>Red Dot, Holographic, Aim Assist: 55-70%</li>
        <li>2x Scope: 60-75%</li>
        <li>3x Scope: 30-45%</li>
        <li>4x Scope, VSS: 25-35%</li>
        <li>6x Scope: 15-23%</li>
        <li>8x Scope: 10-15%</li>
      </ul>

      <h4>ADS Sensitivity (For Non-Gyro Recoil Control)</h4>
      <ul>
        <li>3rd Person No Scope: 110-125%</li>
        <li>1st Person No Scope: 105-120%</li>
        <li>Red Dot, Holographic, Aim Assist: 55-65%</li>
        <li>2x Scope: 50-62%</li>
        <li>3x Scope: 35-40%</li>
        <li>4x Scope, VSS: 30-35%</li>
        <li>6x Scope: 20-25%</li>
        <li>8x Scope: 12-18%</li>
      </ul>

      <h4>Gyroscope Sensitivity (For Gyro Players)</h4>
      <ul>
        <li>3rd Person No Scope: 300-400%</li>
        <li>1st Person No Scope: 300-400%</li>
        <li>Red Dot, Holographic, Aim Assist: 300-400%</li>
        <li>2x Scope: 300-400%</li>
        <li>3x Scope: 180-250%</li>
        <li>4x Scope, VSS: 180-230%</li>
        <li>6x Scope: 80-130%</li>
        <li>8x Scope: 60-90%</li>
      </ul>
      <p>
        <b>Note:</b> These are reference values only. Use the Sensitivity Calculator Tool above for
        precise values matched to your device.
      </p>

      <h3>How to Apply Calculator Sensitivity in BGMI</h3>
      <ul>
        <li>Generate your customized settings with our website calculator.</li>
        <li>Open BGMI and go to Settings.</li>
        <li>Open the Sensitivity tab.</li>
        <li>Enter the Camera, ADS, and Gyro values from the calculator manually.</li>
        <li>
          Optional: paste the generated BGMI Sensitivity Code in the Upload to Cloud section.
        </li>
      </ul>

      <h3>Pro Tips for Perfect No Recoil</h3>
      <ul>
        <li>
          <b>Practice in Training Ground:</b> After copying calculator settings, do not jump straight
          into Classic. Practice spray for at least 15-20 minutes with M416 + 6x (converted to 3x).
        </li>
        <li>
          <b>Use the right attachments:</b> For low-recoil spray, prefer Compensator, Tactical Stock,
          and Half Grip or Ergonomic Grip.
        </li>
        <li>
          <b>Crouch and Fire:</b> Firing while crouched can reduce gun recoil by about 20-30%.
        </li>
      </ul>

      <h3>Conclusion</h3>
      <p>
        The path to Conqueror tier in BGMI starts with the right settings. Use our BGMI Sensitivity
        Settings Calculator today, create your own perfect code, and start stacking Chicken Dinners.
      </p>
    </div>
  );
}

function PubgEnglishArticle() {
  return (
    <div className="article" lang="en">
      <h2>
        PUBG Mobile No-Recoil Sensitivity Settings Calculator: Get a 100% Working Pro Sensitivity
        Code
      </h2>
      <p>
        Getting a Chicken Dinner in PUBG Mobile is not only about smart strategy — it also depends
        on precise aim and zero-recoil spray. Have you ever wondered how top pro players and
        streamers mount a 3x or 4x on an M416 and spray like a laser with almost no shake? The
        biggest secret is a perfect no-recoil sensitivity profile and a live cloud sensitivity code.
      </p>
      <p>
        Our PUBG Mobile No-Recoil Sensitivity Calculator carefully analyzes your device (phone RAM,
        gaming FPS, player role, and finger setup). It generates the best sensitivity values for
        your gameplay, plus a 19-digit live Sensitivity Code.
      </p>

      <h3>Why do default game presets fail?</h3>
      <p>
        When you install PUBG Mobile, the game offers basic presets like Low, Medium, and High. Those
        settings usually fail for true no-recoil spray because:
      </p>
      <ul>
        <li>
          <b>Device and FPS differences:</b> A premium flagship running 90 FPS or 120 FPS has a much
          better touch response than a budget phone stuck at 60 FPS.
        </li>
        <li>
          <b>Player role (playstyle):</b> An aggressive assaulter needs faster movement for
          close-range fights, while a sniper needs slower, more stable sensitivity to lock long-range
          headshots.
        </li>
        <li>
          <b>90 FOV / iPad View:</b> On iPads or tablets, the larger screen and wider FOV change how
          far your finger must swipe across the display.
        </li>
      </ul>
      <p>
        Our tool calculates all of these factors and gives settings built only for your device.
      </p>

      <h3>What is the difference between Camera, ADS, and Gyroscope?</h3>
      <p>
        To apply in-game settings and the generated Sensitivity Code correctly, you need to
        understand these three main categories:
      </p>

      <h4>1. Camera Sensitivity (looking around only)</h4>
      <p>
        Camera sensitivity controls how you look around without holding the fire button — for
        example when you turn the view or open a scope to spot enemies.
      </p>
      <ul>
        <li>
          <b>TPP No Scope:</b> Controls normal character movement and TPP view speed.
        </li>
        <li>
          <b>Scope Camera:</b> How fast you set aim after opening a scope, right before you fire.
        </li>
      </ul>

      <h4>2. ADS (Aim Down Sight) Sensitivity (thumb no-recoil control)</h4>
      <p>
        As soon as you press the fire (shoot) button, camera sensitivity stops and ADS sensitivity
        takes over. For non-gyro players, this is the biggest secret behind no-recoil spray.
      </p>
      <p>
        <b>How it works:</b> When a gun fires, the barrel climbs upward. To stop that, you pull your
        thumb down on the screen. If your ADS sensitivity is right, your spray stays locked in one
        place.
      </p>

      <h4>3. Gyroscope &amp; Gyro ADS Sensitivity (tilt the phone for no recoil)</h4>
      <p>
        With gyroscope, you do not need to swipe as much on the screen. You can tilt the phone
        downward to cancel gun recoil and get close to true no-recoil control. Today, more than 90%
        of competitive players use Full Gyroscope (often in the 300%–400% range).
      </p>

      <h3>Trending PUBG Mobile pro no-recoil sensitivity ranges</h3>
      <p>
        Our calculator gives exact numbers from your inputs, but current pro-level trends usually
        fall around these ranges:
      </p>

      <h4>Camera Sensitivity</h4>
      <ul>
        <li>TPP No Scope: 100% – 130%</li>
        <li>Red Dot / Holo: 50% – 70%</li>
        <li>2x Scope: 30% – 45%</li>
        <li>3x Scope: 22% – 35%</li>
        <li>4x Scope: 15% – 25%</li>
        <li>6x Scope: 10% – 14%</li>
        <li>8x Scope: 8% – 12%</li>
      </ul>

      <h4>ADS Sensitivity</h4>
      <ul>
        <li>TPP No Scope: 90% – 115%</li>
        <li>Red Dot / Holo: 55% – 75%</li>
        <li>2x Scope: 35% – 48%</li>
        <li>3x Scope: 25% – 40%</li>
        <li>4x Scope: 18% – 28%</li>
        <li>6x Scope: 12% – 16%</li>
        <li>8x Scope: 10% – 13%</li>
      </ul>

      <h4>Gyroscope Sensitivity (No-Recoil)</h4>
      <ul>
        <li>TPP No Scope: 300% – 400%</li>
        <li>Red Dot / Holo: 300% – 400%</li>
        <li>2x Scope: 250% – 300%</li>
        <li>3x Scope: 200% – 260%</li>
        <li>4x Scope: 150% – 210%</li>
        <li>6x Scope: 110% – 140%</li>
        <li>8x Scope: 60% – 85%</li>
      </ul>

      <h3>How to apply the live Sensitivity Code and settings in-game</h3>
      <p>
        Applying the numbers or Sensitivity Code from our calculator is simple. You have two ways:
      </p>

      <h4>Method 1: Using the Sensitivity Code (easiest)</h4>
      <ul>
        <li>Copy the Live Generated Sensitivity Code from our calculator.</li>
        <li>Open PUBG Mobile and go to Settings &gt; Sensitivity.</li>
        <li>
          Open Layout Management, tap Search, and paste the copied 19-digit code.
        </li>
        <li>
          When the code matches, the no-recoil settings apply to your game right away.
        </li>
      </ul>

      <h4>Method 2: Setting percentage (%) numbers manually</h4>
      <ul>
        <li>
          Note the percentage values shown by our tool if you prefer not to use a code.
        </li>
        <li>
          In Sensitivity settings, choose Customized instead of the default presets.
        </li>
        <li>
          Move the Camera, ADS, and Gyroscope sliders to match our tool values (the game UI does not
          show a % symbol — just match the numbers).
        </li>
        <li>
          After changing settings, practice spray in Training Grounds for 10–15 minutes before
          Classic so your fingers can adapt.
        </li>
      </ul>
    </div>
  );
}

/** Sync FAQ/article block — safe for client wrappers. */
export function ArticleFaqContent({
  wrapperClassName,
  faqItems,
  game = "bgmi",
}: Props) {
  const wrapClass = ["light-content-wrapper", wrapperClassName].filter(Boolean).join(" ");
  const faqsForPage = game === "pubg" ? PUBG_FAQS : faqItems;

  return (
    <div className={wrapClass}>
      <div className="content-inner">
        {game === "pubg" ? <PubgEnglishArticle /> : <BgmiEnglishArticle />}

        <div className="faq-section" lang="en">
          <h2>Frequently Asked Questions (FAQ)</h2>
          {faqsForPage.length > 0 ? (
            <div className="faq-grid">
              {faqsForPage.map((item) => (
                <div key={item.id} className="faq-card">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
