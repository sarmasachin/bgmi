"use client";

import Link from "next/link";

export default function GlobalError() {
  return (
    <html>
      <body>
        <main style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ textAlign: "center" }}>
            <h1>500 - Something went wrong</h1>
            <p>Please try again in a moment.</p>
            <Link href="/">Back to Home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
