/** Built-in /bgmi-lite guide — used until admin saves an override. */
export const DEFAULT_BGMI_LITE_ARTICLE_HTML = `
<h2>BGMI Lite Sensitivity Calculator: Settings for Low-End Phones (2026)</h2>
<p>
  BGMI Lite is Krafton’s lighter Battlegrounds Mobile India client for entry-level Android
  phones. This calculator builds Camera, ADS, and Gyroscope starting points for devices that
  typically run around 2GB–4GB RAM and 30–60 FPS — not flagship 90/120 FPS setups.
</p>
<p>
  Krafton has confirmed Lite for India (pre-registration / ~1GB initial download). Official
  minimum RAM and the final in-game sensitivity UI may still change before launch. Treat every
  number here as a researched baseline; retune after the live client ships.
</p>

<h3>Why Lite Needs Its Own Sensitivity</h3>
<p>
  Full BGMI codes from 120 FPS claw players feel wrong on budget hardware. Lower frame rates
  and slower touch pipelines make the same slider feel jumpy or heavy. Lite-oriented presets
  use slightly higher camera/ADS for responsiveness and <b>moderate gyroscope</b> (not 300–400%
  pro values) so cheap sensors do not overshoot.
</p>
<ul>
  <li><b>Camera:</b> look around and pre-aim without firing.</li>
  <li><b>ADS:</b> aim while scoped / firing — primary recoil drag for non-gyro players.</li>
  <li><b>Gyroscope:</b> tilt control. Prefer <b>Scope On</b> on 2GB phones so looting and
  running do not drift the camera.</li>
</ul>

<h3>How to Use This Calculator</h3>
<ol>
  <li>Select your phone, RAM, and the FPS you actually hold stable (often 30 or 60).</li>
  <li>Choose finger layout and gyroscope mode (Scope On recommended for beginners).</li>
  <li>Tap Calculate, then copy Camera, ADS, and Gyroscope values into BGMI Lite Settings.</li>
  <li>Test Red Dot, 3x, and 6x in Training Ground. Adjust ±5 before ranked matches.</li>
</ol>

<h3>Quick Ranges for ~2GB Devices</h3>
<p>
  Community Lite / low-end guides commonly sit near: Camera no-scope ~135–140%, Red Dot
  ~60–70%, 4x ~20–30%, with gyroscope no-scope closer to ~180–200% than flagship 300%+.
  Our tool scales those ranges to your RAM, FPS, and play style.
</p>

<h3>Graphics Tip for Smooth Aim</h3>
<p>
  Keep graphics Smooth and frame rate at the highest <b>stable</b> option. Unstable FPS makes
  any sensitivity feel random. Turn off unnecessary effects if the phone heats or drops frames.
</p>
`;
