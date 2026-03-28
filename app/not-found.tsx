import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ textAlign: "center" }}>
        <h1>404 - Page not found</h1>
        <p style={{ margin: "12px 0 18px" }}>
          The page you are looking for does not exist.
        </p>
        <Link href="/">Go to Home</Link>
      </div>
    </main>
  );
}
