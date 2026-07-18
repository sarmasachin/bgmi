import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AdSlot } from "@/src/components/AdSlot";
import { RatingWidget } from "@/src/components/RatingWidget";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import { SiteFooter } from "@/src/components/SiteFooter";
import { SensCalculator } from "@/src/features/sensCalculator/SensCalculator";
import { getCalculatorPhoneModels } from "@/src/server/repositories/calculatorPhoneModelsRepository";
import { getPageBySlug, getPublishedPageBySlug } from "@/src/server/repositories/pagesRepository";
import { getRatingSummary } from "@/src/server/repositories/ratingSummaryRepository";

type TemplateType = "home" | "article" | "landing";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

function extractContentData(content: unknown) {
  if (!content) return { html: "", templateType: "home" as TemplateType, socialTitle: "", socialDescription: "", socialImageAlt: "" };
  if (typeof content === "string") {
    return { html: content, templateType: "home" as TemplateType, socialTitle: "", socialDescription: "", socialImageAlt: "" };
  }
  if (typeof content === "object" && content) {
    const record = content as Record<string, unknown>;
    const html = typeof record.html === "string" ? record.html : "";
    const meta = (record.meta as Record<string, unknown> | undefined) ?? {};
    const rawType = meta.templateType;
    const templateType: TemplateType = rawType === "article" || rawType === "landing" || rawType === "home" ? rawType : "home";
    return {
      html,
      templateType,
      socialTitle: typeof meta.socialTitle === "string" ? meta.socialTitle : "",
      socialDescription: typeof meta.socialDescription === "string" ? meta.socialDescription : "",
      socialImageAlt: typeof meta.socialImageAlt === "string" ? meta.socialImageAlt : "",
    };
  }
  return { html: "", templateType: "home" as TemplateType, socialTitle: "", socialDescription: "", socialImageAlt: "" };
}

async function getPageForSlug(slug: string, allowDraftPreview = false) {
  if (allowDraftPreview) {
    return (await getPageBySlug(`/${slug}`)) ?? (await getPageBySlug(slug));
  }
  return (await getPublishedPageBySlug(`/${slug}`)) ?? (await getPublishedPageBySlug(slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageForSlug(slug, false);
  if (!page) return {};

  const extracted = extractContentData(page.content);
  const title = extracted.socialTitle.trim() || page.seoTitle?.trim() || page.title;
  const description = extracted.socialDescription.trim() || page.seoDescription?.trim() || "BGMI settings and gaming updates.";
  const canonical = page.canonicalUrl?.trim() || `/${slug}`;
  const imageUrl = page.ogImageUrl?.trim();
  const imageAlt = extracted.socialImageAlt?.trim() || title;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: imageUrl ? [{ url: imageUrl, alt: imageAlt }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function DynamicTemplatePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("bgmi_admin_session")?.value === "active";
  const allowDraftPreview = query.preview === "1" && isAdmin;

  const [page, phoneModels] = await Promise.all([
    getPageForSlug(slug, allowDraftPreview),
    getCalculatorPhoneModels(),
  ]);
  if (!page) notFound();

  const extracted = extractContentData(page.content);
  const articleHtml = extracted.html;
  const templateType = extracted.templateType;
  const ratingSummary = await getRatingSummary("tool", slug);

  if (templateType === "article") {
    return (
      <div>
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
            <RatingWidget
              key={ratingWidgetRemountKey("tool", slug)}
              title="Rate this page"
              targetType="tool"
              targetId={slug}
              initialSummary={ratingSummary}
            />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (templateType === "landing") {
    return (
      <div>
        <div className="page-container" style={{ paddingTop: 32 }}>
          <h1 className="main-title">{page.title}</h1>
          <div className="light-content-wrapper" style={{ marginTop: 12 }}>
            <div className="content-inner">
              <div className="article">
                {articleHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: articleHtml }} />
                ) : (
                  <p>No article content found for this clone.</p>
                )}
              </div>
              <RatingWidget
                key={ratingWidgetRemountKey("tool", slug)}
                title="Rate this page"
                targetType="tool"
                targetId={slug}
                initialSummary={ratingSummary}
              />
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div>
      <h1 className="main-title">{page.title}</h1>
      <main className="page-container">
        <AdSlot slotKey="home_above_calculator" />
        <SensCalculator phoneModels={phoneModels} />
        <AdSlot slotKey="home_between_tool_and_article" />
        <RatingWidget
          key={ratingWidgetRemountKey("tool", slug)}
          title="Rate this page"
          targetType="tool"
          targetId={slug}
          initialSummary={ratingSummary}
        />
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
      <SiteFooter />
    </div>
  );
}
