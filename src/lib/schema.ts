export function organizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sensitivity Settings",
    url: baseUrl,
    sameAs: [
      "https://facebook.com/",
      "https://twitter.com/",
      "https://youtube.com/",
    ],
  };
}

export function websiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sensitivity Settings",
    url: baseUrl,
  };
}

export function softwareAppSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BGMI Sensitivity Calculator",
    applicationCategory: "GameApplication",
    operatingSystem: "Android, iOS",
    url: baseUrl,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "256",
    },
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does this work for iPhone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The calculator adjusts sensitivity based on your phone model.",
        },
      },
    ],
  };
}
