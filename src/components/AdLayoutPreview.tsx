/** Localhost-only stand-in so the ad box can be seen without a live creative. */
export function AdLayoutPreview({ wide = false }: { wide?: boolean }) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className={wide ? "ad-layout-preview ad-layout-preview--wide" : "ad-layout-preview"}>
      <img src="/ad-preview.svg" alt="Advertisement" />
      <style>{`
        .ad-layout-preview {
          display: block;
          width: 100%;
          max-width: 100%;
          height: 260px;
          margin: 12px 0;
          padding: 0;
          box-sizing: border-box;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid rgba(69, 196, 176, 0.45);
          background: #10151c;
          line-height: 0;
        }
        .ad-layout-preview--wide {
          width: min(1100px, 95%);
          margin: 0 auto 12px;
        }
        .lite-redeem-inner .ad-layout-preview--wide,
        .ff-as-article-head .ad-layout-preview--wide {
          width: 100%;
          max-width: 100%;
          margin: 0 0 12px;
        }
        .ad-layout-preview img {
          display: block;
          width: 100%;
          height: 100%;
          max-width: 100%;
          object-fit: cover;
          object-position: center;
        }
      `}</style>
    </div>
  );
}
