import "./ffCalculatorAppLink.css";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ffsensitivity.app";

/** Official-style badge mark — transparent (no black plate / border). */
function GooglePlayBadge() {
  return (
    <svg
      className="ffc-play-badge"
      viewBox="0 0 180 54"
      role="img"
      aria-label="Get it on Google Play"
    >
      <path
        fill="#4285F4"
        d="M9.2 3.4c-.9.5-1.5 1.5-1.5 2.8v41.6c0 1.3.6 2.3 1.5 2.8l.2.1 23.4-23.4v-.5L9.4 3.3l-.2.1z"
      />
      <path
        fill="#34A853"
        d="M40.8 35.8 33 28 9.4 51.6c1 .9 2.6 1.1 4.5.1l26.9-15.4v-.5z"
      />
      <path
        fill="#FBBC04"
        d="M50.2 24.6 41.2 19.5 33.2 27.5l8 8 9-5.2c2.5-1.4 2.5-4.5 0-5.7z"
      />
      <path
        fill="#EA4335"
        d="M9.2 3.4 33.2 27.4l8-8L13.7 2.9c-1.9-1.1-3.5-.8-4.5.5z"
      />
      <text
        x="62"
        y="20"
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.6"
      >
        GET IT ON
      </text>
      <text
        x="62"
        y="42"
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="20"
        fontWeight="700"
      >
        Google Play
      </text>
    </svg>
  );
}

type Props = {
  showPlayStoreCta?: boolean;
};

export function FfCalculatorHeader({ showPlayStoreCta = false }: Props) {
  return (
    <header className="ffc-header">
      {showPlayStoreCta ? (
        <a
          className="ffc-play-app"
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GooglePlayBadge />
          <span className="ffc-play-copy">
            <span>100% accurate sensi use mobile app</span>
            <span>Get more one tap auto headshot apk</span>
          </span>
        </a>
      ) : null}
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
