/** Built-in /pubg guide — used until admin saves an override. */
export const DEFAULT_PUBG_ARTICLE_HTML = `
<h2>
  PUBG Mobile Sensitivity Settings Calculator: Get a Custom Pro Sensitivity Code
</h2>
<p>
  Getting a Chicken Dinner in PUBG Mobile is not only about smart strategy — it also depends
  on precise aim and controlled spray. Top players often use a tuned sensitivity profile and a
  live cloud sensitivity code matched to their device.
</p>
<p>
  Our PUBG Mobile Sensitivity Calculator carefully analyzes your device (phone RAM,
  gaming FPS, player role, and finger setup). It generates useful sensitivity values for
  your gameplay, plus a 19-digit live Sensitivity Code.
</p>

<h3>Why do default game presets fail?</h3>
<p>
  When you install PUBG Mobile, the game offers basic presets like Low, Medium, and High. Those
  settings usually feel off for controlled spray because:
</p>
<ul>
  <li>
    <b>Device and FPS differences:</b> A premium flagship running 90 FPS or 120 FPS has a much
    better touch response than a budget phone stuck at 60 FPS.
  </li>
  <li>
    <b>Player role (playstyle):</b> An aggressive assaulter needs faster movement for
    close-range fights, while a sniper needs slower, more stable sensitivity for long-range
    aim.
  </li>
  <li>
    <b>90 FOV / iPad View:</b> On iPads or tablets, the larger screen and wider FOV change how
    far your finger must swipe across the display.
  </li>
</ul>
<p>Our tool calculates all of these factors and gives settings built only for your device.</p>

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
  <li><b>TPP No Scope:</b> Controls normal character movement and TPP view speed.</li>
  <li><b>Scope Camera:</b> How fast you set aim after opening a scope, right before you fire.</li>
</ul>

<h4>2. ADS (Aim Down Sight) Sensitivity (thumb spray control)</h4>
<p>
  As soon as you press the fire (shoot) button, camera sensitivity stops and ADS sensitivity
  takes over. For non-gyro players, ADS is the main control for keeping spray on target.
</p>
<p>
  <b>How it works:</b> When a gun fires, the barrel climbs upward. To stop that, you pull your
  thumb down on the screen. If your ADS sensitivity is right, your spray stays locked in one
  place.
</p>

<h4>3. Gyroscope &amp; Gyro ADS Sensitivity (tilt the phone for recoil control)</h4>
<p>
  With gyroscope, you do not need to swipe as much on the screen. You can tilt the phone
  downward to help manage gun recoil. Today, more than 90%
  of competitive players use Full Gyroscope (often in the 300%–400% range).
</p>

<h3>Trending PUBG Mobile pro sensitivity ranges</h3>
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

<h4>Gyroscope Sensitivity (recoil control)</h4>
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
<p>Applying the numbers or Sensitivity Code from our calculator is simple. You have two ways:</p>

<h4>Method 1: Using the Sensitivity Code (easiest)</h4>
<ul>
  <li>Copy the Live Generated Sensitivity Code from our calculator.</li>
  <li>Open PUBG Mobile and go to Settings &gt; Sensitivity.</li>
  <li>Open Layout Management, tap Search, and paste the copied 19-digit code.</li>
  <li>When the code matches, the new settings apply to your game right away.</li>
</ul>

<h4>Method 2: Setting percentage (%) numbers manually</h4>
<ul>
  <li>Note the percentage values shown by our tool if you prefer not to use a code.</li>
  <li>In Sensitivity settings, choose Customized instead of the default presets.</li>
  <li>
    Move the Camera, ADS, and Gyroscope sliders to match our tool values (the game UI does not
    show a % symbol — just match the numbers).
  </li>
  <li>
    After changing settings, practice spray in Training Grounds for 10–15 minutes before
    Classic so your fingers can adapt.
  </li>
</ul>
`.trim();
