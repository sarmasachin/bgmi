"use client";

import { useEffect, useState } from "react";

const links = [
  { id: "wa", label: "WhatsApp", href: "https://wa.me/?text=" },
  { id: "tg", label: "Telegram", href: "https://t.me/share/url?url=" },
  { id: "fb", label: "Facebook", href: "https://www.facebook.com/sharer/sharer.php?u=" },
  { id: "x", label: "X", href: "https://twitter.com/intent/tweet?url=" },
] as const;

export function ShareRail() {
  const [hidden, setHidden] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState("");

  useEffect(() => {
    const pref = window.localStorage.getItem("share-rail-hidden");
    setHidden(pref === "1");
    setEncodedUrl(encodeURIComponent(window.location.href));
  }, []);

  function toggle() {
    const next = !hidden;
    setHidden(next);
    window.localStorage.setItem("share-rail-hidden", next ? "1" : "0");
  }

  return (
    <aside className={`share-rail ${hidden ? "hidden" : ""}`} aria-label="Social share">
      <div className="share-rail-head">
        {!hidden ? <span className="share-rail-label">Share page</span> : null}
        <button
          type="button"
          className="share-toggle"
          onClick={toggle}
          aria-expanded={!hidden}
          aria-controls="share-rail-links"
        >
          {hidden ? "Show" : "Hide"}
        </button>
      </div>
      {!hidden && (
        <ul className="share-links" id="share-rail-links" role="list">
          {links.map((item) => (
            <li key={item.id}>
              <a
                className={`share-link share-link--${item.id}`}
                href={`${item.href}${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="share-link-dot" aria-hidden />
                <span className="share-link-text">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
