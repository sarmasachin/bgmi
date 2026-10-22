import "./ffCalculatorAppLink.css";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ffsensitivity.app";

function PlayStoreIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M3.6 1.8c-.4.3-.6.8-.6 1.5v17.4c0 .7.2 1.2.6 1.5l.1.1 9.7-9.8v-.2L3.7 1.7l-.1.1z"
      />
      <path
        fill="#34A853"
        d="M16.6 15.4 13.4 12.2 3.6 22.2c.4.4 1.1.5 1.9.1l11.1-6.4v-.5z"
      />
      <path
        fill="#FBBC04"
        d="M20.4 10.7 16.7 8.6l-3.3 3.4 3.3 3.4 3.8-2.2c1-.6 1-1.9-.1-2.5z"
      />
      <path
        fill="#EA4335"
        d="M3.6 1.8 13.4 11.6l3.2-3.2L5.5 1.6c-.8-.4-1.5-.3-1.9.2z"
      />
    </svg>
  );
}

export function FfCalculatorHeader() {
  return (
    <header className="ffc-header">
      <a
        className="ffc-play-app"
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <PlayStoreIcon />
        <span>100% accurate sensi use mobile app</span>
      </a>
      <h2 className="ffc-title">
        <i className="fa-solid fa-crosshairs ffc-title-icon"></i>Best Sensi
        Calculator 2026
      </h2>
      <p className="ffc-subtitle">
        Device Engine &amp; Smart Hardware Recognition
      </p>
    </header>
  );
}
