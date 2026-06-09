"use client"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { AdminActivityFeed } from "@/components/admin/activity-feed"
import { SectionCard } from "@/components/admin/SectionCard"
import { List } from "lucide-react"

export default function AdminActivityLogsPage() {
  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Activity Logs" subtitle="Complete audit trail of all admin and system actions." />
      
      <SectionCard title="System Audit Trail" noPadding>
        <div className="p-4 bg-slate-50/50 dark:bg-white/2 border-b border-slate-100 dark:border-white/5">
          <p className="text-xs font-bold text-slate-500">
            This log tracks all human-in-the-loop actions (verifications, suspensions, role changes, etc.).
          </p>
        </div>
        <div className="p-4">
          {/* Reusing the feed component from the dashboard but without limit */}
          <AdminActivityFeed limit={50} />
        </div>
      </SectionCard>
    </div>
  )
}
