// lib/admin-announcement-data.ts
export type AnnouncementCategory =
  | "Platform Update"
  | "Maintenance"
  | "New Feature"
  | "Important";

export type AnnouncementStatus = "published" | "draft";

export type Announcement = {
  id: string;
  title: string;
  category: AnnouncementCategory;
  date: string; // YYYY-MM-DD
  content: string;
  pinned: boolean;
  status: AnnouncementStatus;
  views: number;
};

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = [
  "Platform Update",
  "Maintenance",
  "New Feature",
  "Important",
];

export function getAnnouncements(): Announcement[] {
  return [
    {
      id: "a1",
      title: "🚨 Scheduled Maintenance — July 22, 2025",
      category: "Maintenance",
      date: "2025-07-20",
      pinned: true,
      status: "published",
      views: 1840,
      content:
        "We will be performing scheduled maintenance on July 22, 2025 from 02:00–04:00 UTC. During this time, deposits, withdrawals, and trading may be temporarily unavailable. We apologize for any inconvenience and thank you for your patience.",
    },
    {
      id: "a2",
      title: "⚡ AI Trading v2.0 Now Live",
      category: "New Feature",
      date: "2025-07-18",
      pinned: true,
      status: "published",
      views: 2310,
      content:
        "We've launched AI Trading v2.0 with multi-strategy support, improved signal accuracy, and a new risk dashboard. Head to the AI Trading section to activate and configure your strategies.",
    },
    {
      id: "a3",
      title: "Platform Update — v4.1.2 Released",
      category: "Platform Update",
      date: "2025-07-15",
      pinned: false,
      status: "published",
      views: 1422,
      content:
        "This update includes performance improvements, bug fixes for the wallet transfer flow, and enhanced charting tools on the trading dashboard. All users will receive the update automatically.",
    },
    {
      id: "a4",
      title: "⚠️ Important: KYC Verification Required",
      category: "Important",
      date: "2025-07-12",
      pinned: false,
      status: "published",
      views: 2975,
      content:
        "As part of our compliance obligations, all users must complete KYC verification by August 1, 2025 to continue using withdrawal and investment features. Please complete KYC in your profile settings.",
    },
    {
      id: "a5",
      title: "New Referral Reward Program",
      category: "New Feature",
      date: "2025-07-08",
      pinned: false,
      status: "published",
      views: 1108,
      content:
        "Introducing our updated referral program. Earn up to 15% commission on every referred user's platform activity. Share your referral link from the Referral section of your dashboard.",
    },
    {
      id: "a6",
      title: "Platform Update — v4.1.0 Released",
      category: "Platform Update",
      date: "2025-07-01",
      pinned: false,
      status: "published",
      views: 964,
      content:
        "Major update: community features, global chat, announcement system, and improved notification center are now available. Explore the Community section in your sidebar.",
    },
    {
      id: "a7",
      title: "Upcoming: New Withdrawal Networks",
      category: "New Feature",
      date: "2025-08-05",
      pinned: false,
      status: "draft",
      views: 0,
      content:
        "We are adding support for additional withdrawal networks with lower fees. Details and launch date will be shared soon.",
    },
  ];
}
