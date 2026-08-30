import Link from "next/link";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { BgmiLiteStylishNameIdeas } from "@/src/components/BgmiLiteStylishNameIdeas";
import { BgmiLiteStylishNameStudio } from "@/src/components/BgmiLiteStylishNameStudio";
import { FaqAccordion } from "@/src/components/FaqAccordion";
import { HomeHeader } from "@/src/components/HomeHeader";
import { PageCommentSection } from "@/src/components/PageCommentSection";
import { SiteFooter } from "@/src/components/SiteFooter";
import {
  BGMI_LITE_STYLISH_NAME_PATH,
  BGMI_LITE_STYLISH_PAGE_KEY,
} from "@/src/lib/bgmiLiteStylishNamePage";
import { breadcrumbListSchema, faqSchema, webPageSchema } from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { listApprovedPageComments } from "@/src/server/repositories/pageCommentsRepository";
import { getBgmiLiteStylishPage } from "@/src/server/repositories/bgmiLiteStylishNameRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

/** BGMI Lite stylish name — mobile-first studio + guide (DB-backed copy). */
export async function BgmiLiteStylishNameLandingPage() {
  const [settings, page, pageComments] = await Promise.all([
    getSettings(),
    getBgmiLiteStylishPage(),
    listApprovedPageComments(BGMI_LITE_STYLISH_PAGE_KEY),
  ]);
  const canonical = toCanonicalUrl(BGMI_LITE_STYLISH_NAME_PATH);
  const homeUrl = toCanonicalUrl("/");
  const liteCalcUrl = toCanonicalUrl("/bgmi-lite");
  const crumbCurrent = (page.title || "BGMI Lite Stylish Name").trim();
  const faqItems = page.faqs.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }));
  const faqLd = faqSchema(faqItems);
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: "BGMI Lite", url: liteCalcUrl },
    { name: crumbCurrent, url: canonical },
  ]);
  const webPageLd = webPageSchema({
    name: page.seoTitle,
    description: page.seoDescription,
    url: canonical,
    keywords: [...page.seoKeywords],
    inLanguage: "en",
  });

  return (
    <div className="lite-stylish-page">
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />

      <nav className="ff-as-breadcrumb" aria-label="Breadcrumb">
        <ol className="ff-as-breadcrumb-list">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/bgmi-lite">BGMI Lite</Link>
          </li>
          <li aria-current="page">{crumbCurrent}</li>
        </ol>
      </nav>

      <main className="lite-stylish-main">
        <div className="lite-stylish-inner">
          <header className="lite-stylish-hero">
            <h1 className="lite-stylish-title">{page.title}</h1>
            <p className="lite-stylish-sub">{page.subtitle}</p>
          </header>

          <BgmiLiteStylishNameStudio tipText={page.tipText} />

          <BgmiLiteStylishNameIdeas heading={page.ideasHeading} />

          <section className="lite-stylish-steps" aria-labelledby="lite-stylish-steps-title">
            <h2 id="lite-stylish-steps-title" className="lite-stylish-section-title">
              {page.stepsHeading}
            </h2>
            <ol className="lite-stylish-step-list">
              {page.steps.map((step, index) => (
                <li key={step.title} className="lite-stylish-step">
                  <span className="lite-stylish-step-num" aria-hidden>
                    {index + 1}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <div
        id="bgmi-lite-stylish-guide"
        className="light-content-wrapper light-content--after-home-calculator"
      >
        <div className="content-inner">
          <div
            className="article"
            lang="en"
            dangerouslySetInnerHTML={{ __html: page.articleHtml }}
          />
          {faqItems.length ? <FaqAccordion items={faqItems} title={page.faqTitle} /> : null}
        </div>
      </div>

      <PageCommentSection
        pageKey={BGMI_LITE_STYLISH_PAGE_KEY}
        initialComments={pageComments}
        lead={page.commentsLead}
      />

      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />

      <ClientErrorBoundary label="Footer">
        <SiteFooter settings={settings} />
      </ClientErrorBoundary>
    </div>
  );
}
