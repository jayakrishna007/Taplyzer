// Taplyzer Admin Module Feature Flag System
// Controls visibility, status, and access for each admin section.
// Update status here to enable/disable sections platform-wide.

export type ModuleStatus =
  | "enabled"      // Fully active, real APIs connected
  | "limited"      // Core active, advanced features disabled
  | "beta"         // Active, still collecting data, show beta badge
  | "internal"     // Super Admin only, hidden from regular admins
  | "comingSoon"   // Visible in sidebar, beautiful placeholder on click
  | "disabled";    // Completely hidden

export interface AdminModule {
  status: ModuleStatus;
  visible: boolean;         // Show in sidebar at all
  label?: string;           // Override display label
  description?: string;     // Shown in placeholder pages
}

export const adminModules: Record<string, AdminModule> = {
  dashboard: {
    status: "enabled",
    visible: true,
    description: "Real-time platform control room with live network activity.",
  },
  noc: {
    status: "enabled",
    visible: true,
    description: "Human-controlled matchmaking operations center.",
  },
  users: {
    status: "enabled",
    visible: true,
    description: "Complete user lifecycle management.",
  },
  verification: {
    status: "enabled",
    visible: true,
    description: "Business trust and authenticity layer.",
  },
  profilesIntent: {
    status: "enabled",
    visible: true,
    description: "Monitor and optimize business intent quality across the network.",
  },
  ratings: {
    status: "limited",
    visible: true,
    description: "Business reputation management. Advanced abuse detection coming in Phase 2.",
  },
  reportsFlags: {
    status: "enabled",
    visible: true,
    description: "Marketplace safety enforcement center.",
  },
  matches: {
    status: "enabled",
    visible: true,
    description: "Match engine output monitor — synergy scores and outcomes.",
  },
  requests: {
    status: "enabled",
    visible: true,
    description: "Interaction quality monitor — track all intro requests.",
  },
  meetings: {
    status: "enabled",
    visible: true,
    description: "Track real business interactions and deal outcomes.",
  },
  exploreMonitoring: {
    status: "enabled",
    visible: true,
    description: "Market intelligence engine — search trends and unmet demand.",
  },
  aiInsights: {
    status: "beta",
    visible: true,
    description: "AI-assisted match pattern intelligence. Collecting live network data.",
  },
  subscriptions: {
    status: "limited",
    visible: true,
    description: "Revenue management. Billing automation planned for Phase 3.",
  },
  notifications: {
    status: "enabled",
    visible: true,
    description: "Platform communication center — broadcast to users.",
  },
  supportTickets: {
    status: "limited",
    visible: true,
    description: "User issue resolution. SLA and email workflows planned for Phase 2.",
  },
  contentBanners: {
    status: "limited",
    visible: true,
    description: "Dynamic platform content — banners, announcements, featured businesses.",
  },
  analytics: {
    status: "enabled",
    visible: true,
    description: "Platform intelligence — funnel, conversion, and deal flow analytics.",
  },
  geminiUsage: {
    status: "enabled",
    visible: true,
    description: "Gemini API usage tracking, token metrics, and cost estimation.",
  },
  systemSettings: {
    status: "internal",
    visible: true,
    description: "Platform configuration. Super Admin access only.",
  },
  adminsRoles: {
    status: "comingSoon",
    visible: true,
    description: "Internal admin access control and role-based permissions. Architecture ready.",
  },
  activityLogs: {
    status: "internal",
    visible: true,
    description: "Complete admin audit trail. Super Admin access only.",
  },
};

export function getModuleStatus(key: string): ModuleStatus {
  return adminModules[key]?.status ?? "disabled";
}

export function isModuleVisible(key: string): boolean {
  return adminModules[key]?.visible ?? false;
}

export function isModuleEnabled(key: string): boolean {
  const s = getModuleStatus(key);
  return s === "enabled" || s === "limited" || s === "beta";
}
