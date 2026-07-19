import { getSettings } from "@/src/server/repositories/settingsRepository";

export default async function HomePage() {
  // Shared UI lives in (games)/layout — title is RSC so LCP paints without client JS.
  const settings = await getSettings();
  return <h1 className="main-title">{settings.homeDisplay.heroTitle}</h1>;
}
