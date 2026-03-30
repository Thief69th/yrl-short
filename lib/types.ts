import type { DEVICE_OPTIONS, PLAN_OPTIONS, ROLE_OPTIONS } from "@/lib/constants";

export type Plan = (typeof PLAN_OPTIONS)[number];
export type Role = (typeof ROLE_OPTIONS)[number];
export type DeviceType = (typeof DEVICE_OPTIONS)[number];

export type AuthenticatedAppUser = {
  id: string;
  clerkUserId: string;
  email: string;
  plan: Plan;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type LinkSnapshot = {
  id: string;
  longUrl: string;
  shortCode: string;
  shortUrl: string;
  customAlias: string | null;
  clicks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  ownerPlan: Plan;
};

export type DashboardTotals = {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  estimatedRevenue: number;
};

export type DailyAnalyticsPoint = {
  date: string;
  clicks: number;
  revenue: number;
};

export type BreakdownPoint = {
  label: string;
  value: number;
};

export type DashboardOverview = {
  viewer: AuthenticatedAppUser;
  totals: DashboardTotals;
  recentLinks: LinkSnapshot[];
  chart: DailyAnalyticsPoint[];
  countryBreakdown: BreakdownPoint[];
  deviceBreakdown: BreakdownPoint[];
};

export type LinkAnalytics = {
  link: LinkSnapshot;
  chart: DailyAnalyticsPoint[];
  countryBreakdown: BreakdownPoint[];
  deviceBreakdown: BreakdownPoint[];
};

export type RedirectResolution =
  | {
      status: "missing";
    }
  | {
      status: "redirect";
      destination: string;
    }
  | {
      status: "interstitial";
      destination: string;
      shortUrl: string;
      eventId: string;
      countdownSeconds: number;
      adMarkup: string | null;
    };

export type CreateLinkInput = {
  longUrl: string;
  customAlias?: string;
};

export type UpdateLinkInput = {
  longUrl: string;
  customAlias?: string;
};

export type TrackAdEventInput = {
  eventId: string;
};

export type UserListItem = AuthenticatedAppUser & {
  totalLinks: number;
  totalClicks: number;
};

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorEmail: string;
  isPublished: boolean;
  readTime: string;
};

export type BlogPostDetail = BlogPostSummary & {
  paragraphs: string[];
};

export type BlogEditorInput = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
};
