export function organizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SENS MASTER PRO",
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
    name: "SENS MASTER PRO",
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
        name: "क्या यह iPhone के लिए काम करता है?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "हाँ, यह कैलकुलेटर फोन मॉडल के हिसाब से sensitivity adjust करता है।",
        },
      },
    ],
  };
}
