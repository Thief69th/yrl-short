export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readTime: string;
  content: string[];
};

export type LegalPage = {
  slug: string;
  title: string;
  description: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-create-better-short-links",
    title: "How to Create Better Short Links",
    description:
      "Simple tips for making short URLs cleaner, easier to remember, and safer to share.",
    publishedAt: "2026-03-30",
    readTime: "3 min read",
    content: [
      "A good short link should be easy to read and easy to trust. Avoid random custom aliases when the link is meant for public sharing. Use short, clear names that match the campaign, brand, or page.",
      "If you are sharing a link in WhatsApp, Instagram bio, or email, shorter is usually better. A clean alias like launch-offer or pricing works better than a long keyword-stuffed code.",
      "For business use, always test the link before sharing it publicly. Make sure it redirects correctly and check whether free-plan interstitials or direct redirects match the user experience you want.",
    ],
  },
  {
    slug: "free-vs-paid-url-shortener-plans",
    title: "Free vs Paid URL Shortener Plans",
    description:
      "What changes between free and paid users inside Blink URL Shortener Pro.",
    publishedAt: "2026-03-30",
    readTime: "4 min read",
    content: [
      "Free plans are useful when you want quick access to short links without much setup. In Blink, free users can create a limited number of links and their traffic can pass through an ad interstitial before redirecting.",
      "Paid plans are better for brands, teams, and regular publishers. They remove the interstitial step, allow more links, and unlock better analytics such as country and device breakdowns.",
      "The main decision is simple: if you care about a cleaner redirect experience and more control, paid is the better fit. If you only need occasional short links, free may be enough.",
    ],
  },
  {
    slug: "why-analytics-matter-for-short-links",
    title: "Why Analytics Matter for Short Links",
    description:
      "Clicks alone are useful, but traffic source context makes short links much more valuable.",
    publishedAt: "2026-03-30",
    readTime: "3 min read",
    content: [
      "A short link becomes much more useful when you can measure what happens after you share it. Click totals help, but device and country breakdowns tell you more about who is actually engaging with your link.",
      "If one campaign gets strong traffic from mobile users in a specific region, that can help you improve your landing page, ad creative, or posting schedule.",
      "This is why Blink separates basic analytics from advanced analytics. Even simple reporting helps, but detailed reporting makes the product more practical for creators and businesses.",
    ],
  },
];

export const legalPages: LegalPage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description:
      "How Blink collects, uses, and stores information when visitors use public links or authenticated dashboards.",
    sections: [
      {
        heading: "Information We Collect",
        paragraphs: [
          "Blink may collect account information such as email addresses for registered users. It also stores link data, click counts, device information, country information, and referrer data when short links are used.",
          "Public visitors who shorten links without creating an account may still generate stored link records and redirect analytics needed for service operation.",
        ],
      },
      {
        heading: "How We Use Data",
        paragraphs: [
          "We use collected data to operate the shortener, improve performance, secure the platform, and provide analytics inside the product.",
          "We may also use aggregated usage information to understand feature adoption and improve service quality.",
        ],
      },
      {
        heading: "Data Security",
        paragraphs: [
          "We take reasonable steps to protect stored data, but no internet-based service can guarantee absolute security.",
          "Users should avoid shortening sensitive URLs or sharing private data through public links unless they fully understand the risk.",
        ],
      },
    ],
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    description:
      "Rules for using Blink, including link creation, account use, and acceptable content.",
    sections: [
      {
        heading: "Use of the Service",
        paragraphs: [
          "Blink may be used to create, manage, and track shortened URLs for lawful purposes only.",
          "Users may not use the service for malware delivery, phishing, fraud, spam, illegal content, or abusive traffic generation.",
        ],
      },
      {
        heading: "Accounts and Plans",
        paragraphs: [
          "Registered users are responsible for the activity on their accounts and for keeping access to their sign-in methods secure.",
          "Free and paid plans may include different usage limits, redirect behavior, and analytics features.",
        ],
      },
      {
        heading: "Termination",
        paragraphs: [
          "We may suspend or remove links or accounts that violate these terms, create security risk, or harm service reliability.",
          "We may also update service features, limits, and plan behavior over time as the product evolves.",
        ],
      },
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    description:
      "A simple explanation of how cookies and similar browser storage may be used in Blink.",
    sections: [
      {
        heading: "What We Use",
        paragraphs: [
          "Blink and connected authentication providers may use cookies or similar browser storage for sign-in state, security, and essential product functionality.",
          "Local browser storage may also be used to improve the user experience, such as remembering recent actions in certain flows.",
        ],
      },
      {
        heading: "Why We Use It",
        paragraphs: [
          "These technologies help maintain sessions, secure accounts, and support analytics or preference handling inside the app.",
          "If you disable certain cookies, some authenticated features may not work correctly.",
        ],
      },
    ],
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    description:
      "Important limitations about uptime, third-party links, ads, and informational content on Blink.",
    sections: [
      {
        heading: "Service Availability",
        paragraphs: [
          "Blink is provided on an as-available basis. We do not guarantee uninterrupted availability, permanent uptime, or error-free operation.",
          "Third-party services such as hosting, authentication, payments, or ad providers may also affect how the product behaves.",
        ],
      },
      {
        heading: "External Destinations",
        paragraphs: [
          "Blink short links may redirect to external websites not controlled by us. We are not responsible for the content, safety, or policies of those destinations.",
          "Users should review destination URLs carefully before sharing them widely.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug) ?? null;
}
