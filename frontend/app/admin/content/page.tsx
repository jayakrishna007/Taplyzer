"use client"

import { useEffect, useState } from "react"
import { Image as ImageIcon, Plus, Trash2, Megaphone, Store } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard } from "@/components/admin/SectionCard"
import { EmptyState } from "@/components/admin/EmptyState"
import { useAuth } from "@/components/auth-provider"

export default function AdminContentPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("banner")

  // Form
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [ctaText, setCtaText] = useState("")
  const [ctaLink, setCtaLink] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/content?type=${activeTab}`)
      const data = await res.json()
      setItems(data.items || [])
      setStats(data.stats)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    setSubmitting(true)
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, title, subtitle, ctaText, ctaLink, adminId: user?._id }),
      })
      setTitle(""); setSubtitle(""); setCtaText(""); setCtaLink("")
      await fetchData()
    } catch (e) { console.error(e) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return
    try {
      await fetch(`/api/admin/content?id=${id}&adminId=${user?._id}`, { method: "DELETE" })
      await fetchData()
    } catch (e) { console.error(e) }
  }

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, isActive: !current, adminId: user?._id }),
      })
      await fetchData()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader title="Content & Banners" subtitle="Manage dynamic platform content (Phase 1)" />

      <div className="flex gap-2 mb-6">
        {[
          { id: "banner", label: "Homepage Banners", icon: ImageIcon, count: stats?.banners },
          { id: "announcement", label: "Announcements", icon: Megaphone, count: stats?.announcements },
          { id: "featured_business", label: "Featured Businesses", icon: Store, count: stats?.featured },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === t.id ? "bg-red-600 text-white shadow-md" : "bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
            {t.count !== undefined && <span className="ml-1 text-[10px] bg-black/10 px-1.5 py-0.5 rounded-md">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SectionCard title={`Add New ${activeTab.split('_').join(' ')}`}>
            {activeTab === "featured_business" ? (
              <div className="text-center py-10">
                <p className="text-sm font-bold text-slate-500">Business search integration coming soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Title</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Subtitle (Optional)</label>
                  <input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">CTA Text</label>
                    <input value={ctaText} onChange={e => setCtaText(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">CTA Link</label>
                    <input value={ctaLink} onChange={e => setCtaLink(e.target.value)} placeholder="https://" className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                  </div>
                </div>
                <button type="submit" disabled={submitting || !title} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-sm font-black rounded-xl hover:bg-red-700 disabled:opacity-50">
                  <Plus className="h-4 w-4" /> Create
                </button>
              </form>
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard title="Active Content" noPadding>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-slate-50 dark:bg-white/2 animate-pulse" />)
              ) : items.length === 0 ? (
                <EmptyState icon={ImageIcon} title="No items found" description={`Add your first ${activeTab.replace('_', ' ')}.`} size="sm" />
              ) : (
                items.map((item) => (
                  <div key={item._id} className={`p-4 flex items-center justify-between gap-4 transition-all ${item.isActive ? "bg-white dark:bg-transparent" : "bg-slate-50 dark:bg-white/2 opacity-60"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{item.title}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                          {item.isActive ? "Live" : "Inactive"}
                        </span>
                      </div>
                      {item.subtitle && <p className="text-xs font-bold text-slate-500 dark:text-white/40 mt-0.5 truncate">{item.subtitle}</p>}
                      {item.ctaText && <p className="text-[10px] text-blue-500 font-bold mt-1">CTA: {item.ctaText} → {item.ctaLink}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleActive(item._id, item.isActive)} className="px-2 py-1 text-[10px] font-black rounded border border-slate-200 dark:border-white/10 hover:bg-slate-100">
                        {item.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
