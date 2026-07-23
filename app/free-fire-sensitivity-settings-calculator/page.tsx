import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Free Fire calculator now lives on home (`/`).
 * Keep this URL as a permanent redirect to avoid duplicate SEO.
 */
export default function FreeFirePage() {
  permanentRedirect("/");
}
