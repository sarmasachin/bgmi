export default function ContactPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@localhost";
  return (
    <main className="page-container" style={{ padding: "20px 0 40px" }}>
      <div className="news-detail-card">
        <h1>Contact / Feedback</h1>
        <p>Email: {supportEmail}</p>
        <p>WhatsApp: +91-00000-00000</p>
      </div>
    </main>
  );
}
