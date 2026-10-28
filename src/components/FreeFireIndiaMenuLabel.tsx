/** Free Fire India menu text in Indian-flag order: saffron, white, green. */
export function FreeFireIndiaMenuLabel({ apk = false }: { apk?: boolean }) {
  if (apk) {
    return (
      <span className="ff-india-brand">
        <span className="ff-india-flag-saffron">FF</span>
        <span className="ff-india-flag-white">India</span>
        <span className="ff-india-flag-green">Apk</span>
      </span>
    );
  }
  return (
    <span className="ff-india-brand">
      <span className="ff-india-flag-saffron">Free</span>
      <span className="ff-india-flag-white">Fire</span>
      <span className="ff-india-flag-green">India</span>
    </span>
  );
}
