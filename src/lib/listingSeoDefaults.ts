/** Defaults for admin-editable listing / support page SEO. */

export const defaultNewsListingSeo = {
  title: "Free Fire, BGMI & Gaming News",
  description:
    "Latest Free Fire, BGMI, and PUBG Mobile news, updates, and gaming stories from Sensitivity Settings.",
};

export type NewsListingSeo = typeof defaultNewsListingSeo;

export const defaultContactSeo = {
  general: {
    title: "Contact",
    description:
      "Contact Sensitivity Settings for help with the Free Fire, BGMI, and PUBG Mobile sensitivity calculator.",
  },
  report: {
    title: "Contact",
    description:
      "Contact Sensitivity Settings for help with the Free Fire, BGMI, and PUBG Mobile sensitivity calculator.",
  },
  feedback: {
    title: "Contact",
    description:
      "Contact Sensitivity Settings for help with the Free Fire, BGMI, and PUBG Mobile sensitivity calculator.",
  },
};

export type ContactSeoTopic = keyof typeof defaultContactSeo;
export type ContactTopicSeo = { title: string; description: string };
export type ContactSeo = Record<ContactSeoTopic, ContactTopicSeo>;
