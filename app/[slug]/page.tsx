import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/src/components/AdSlot";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import { FfCalculator } from "@/src/features/ffCalculator/FfCalculator";
import { SensCalculator } from "@/src/features/sensCalculator/SensCalculator";
import { isAdminLoggedIn } from "@/src/server/auth";
import { getCalculatorPhoneModels } from "@/src/server/repositories/calculatorPhoneModelsRepository";
import { getPageBySlug, getPublishedPageBySlug } from "@/src/server/repositories/pagesRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

type TemplateType = "home" | "article" | "landing";
type CloneGame = "bgmi" | "pubg" | "freefire" | "freefire-max";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

function extractContentData(content: unknown) {
  if (!content) {
    return {
      html: "",
      templateType: "home" as TemplateType,
      game: "bgmi" as CloneGame,
      socialTitle: "",
      socialDescription: "",
      socialImageAlt: "",
      keywords: "",
    };
  }
  if (typeof content === "string") {
    return {
      html: content,
      templateType: "home" as TemplateType,
      game: "bgmi" as CloneGame,
      socialTitle: "",
      socialDescription: "",
      socialImageAlt: "",
      keywords: "",
    };
  }
  if (typeof content === "object" && content) {
    const record = content as Record<string, unknown>;
    const html = typeof record.html === "string" ? record.html : "";
    const meta = (record.meta as Record<string, unknown> | undefined) ?? {};
    const rawType = meta.templateType;
    const templateType: TemplateType =
      rawType === "article" || rawType === "landing" || rawType === "home" ? rawType : "home";
    const game: CloneGame =
      meta.game === "pubg" || meta.game === "freefire" || meta.game === "freefire-max" ? meta.game : "bgmi";
    return {
      html,
      templateType,
      game,
      socialTitle: typeof meta.socialTitle === "string" ? meta.socialTitle : "",
      socialDescription: typeof meta.socialDescription === "string" ? meta.socialDescription : "",
      socialImageAlt: typeof meta.socialImageAlt === "string" ? meta.socialImageAlt : "",
      keywords: typeof meta.keywords === "string" ? meta.keywords : "",
    };
  }
  return {
    html: "",
    templateType: "home" as TemplateType,
    game: "bgmi" as CloneGame,
    socialTitle: "",
    socialDescription: "",
    socialImageAlt: "",
    keywords: "",
  };
}

async function getPageForSlug(slug: string, allowDraftPreview = false) {
  if (allowDraftPreview) {
    return (await getPageBySlug(`/${slug}`)) ?? (await getPageBySlug(slug));
  }
  return (await getPublishedPageBySlug(`/${slug}`)) ?? (await getPublishedPageBySlug(slug));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const isPreview = query.preview === "1";
  const allowDraftPreview = isPreview && (await isAdminLoggedIn());
  const page = await getPageForSlug(slug, allowDraftPreview);

  const previewRobots: Metadata["robots"] = isPreview
    ? {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
        },
      }
    : undefined;

  if (!page) {
    return previewRobots ? { robots: previewRobots } : {};
  }

  const extracted = extractContentData(page.content);
  const title = extracted.socialTitle.trim() || page.seoTitle?.trim() || page.title;
  const description = extracted.socialDescription.trim() || page.seoDescription?.trim() || "BGMI settings and gaming updates.";
  const canonical = toCanonicalUrl(page.canonicalUrl?.trim() || `/${slug}`);
  const imageUrl = page.ogImageUrl?.trim();
  const imageAlt = extracted.socialImageAlt?.trim() || title;
  const keywords = extracted.keywords
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title,
    description,
    ...(keywords.length ? { keywords } : {}),
    alternates: {
      canonical,
    },
    ...(previewRobots ? { robots: previewRobots } : {}),
    ...buildSocialMetadata({
      title,
      description,
      url: canonical,
      image: imageUrl,
      imageAlt,
    }),
  };
}

export default async function DynamicTemplatePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const allowDraftPreview = query.preview === "1" && (await isAdminLoggedIn());

  const [page, phoneModels, settings] = await Promise.all([
    getPageForSlug(slug, allowDraftPreview),
    getCalculatorPhoneModels(),
    getSettings(),
  ]);
  if (!page) notFound();

  const extracted = extractContentData(page.content);
  const articleHtml = extracted.html;
  const templateType = extracted.templateType;
  const calculatorGame = extracted.game;
  const isFreeFireClone =
    calculatorGame === "freefire" || calculatorGame === "freefire-max";
  const titleClassName = isFreeFireClone
    ? "main-title ff-gradient-title"
    : "main-title";
  const header = (
    <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
  );

  if (templateType === "article") {
    return (
      <div>
        {header}
        <div className="light-content-wrapper" style={{ marginTop: 0 }}>
          <div className="content-inner">
            <h1 style={{ marginBottom: 20 }}>{page.title}</h1>
            <div className="article">
              {articleHtml ? (
                <div dangerouslySetInnerHTML={{ __html: articleHtml }} />
              ) : (
                <p>No article content found for this clone.</p>
              )}
            </div>
          </div>
        </div>
        <SiteFooter settings={settings} />
      </div>
    );
  }

  if (templateType === "landing") {
    return (
      <div>
        {header}
        <div className="page-container" style={{ paddingTop: 32 }}>
          <h1 className={titleClassName}>{page.title}</h1>
          <div className="light-content-wrapper" style={{ marginTop: 12 }}>
            <div className="content-inner">
              <div className="article">
                {articleHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: articleHtml }} />
                ) : (
                  <p>No article content found for this clone.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <SiteFooter settings={settings} />
      </div>
    );
  }

  return (
    <div>
      {header}
      <h1 className={titleClassName}>{page.title}</h1>
      <main className="page-container">
        <AdSlot slotKey="home_above_calculator" />
        {calculatorGame === "freefire" || calculatorGame === "freefire-max" ? (
          <FfCalculator key={calculatorGame} isMax={calculatorGame === "freefire-max"} />
        ) : (
          <SensCalculator key={calculatorGame} phoneModels={phoneModels} game={calculatorGame} />
        )}
        <AdSlot slotKey="home_between_tool_and_article" />
      </main>
      <div className="light-content-wrapper">
        <div className="content-inner">
          <div className="article">
            {articleHtml ? (
              <div dangerouslySetInnerHTML={{ __html: articleHtml }} />
            ) : (
              <p>No article content found for this clone.</p>
            )}
          </div>
        </div>
      </div>
      <SiteFooter settings={settings} />
    </div>
  );
}
