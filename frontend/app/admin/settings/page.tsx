"use client"

import { useEffect, useState } from "react"
import { Settings, Save, RefreshCw, ToggleLeft, ToggleRight, CheckCircle2, AlertTriangle } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { SectionCard } from "@/components/admin/SectionCard"
import { useAuth } from "@/components/auth-provider"

interface PlatformSettings {
  matchMinScore: number
  cacheHours: number
  maintenanceMode: boolean
  registrationsEnabled: boolean
  autoApproveVerification: boolean
  supportEmail: string
  platformName: string
  maxMatchesPerUser: number
  meetingDurationMinutes: number
}

const DEFAULTS: PlatformSettings = {
  matchMinScore: 40,
  cacheHours: 12,
  maintenanceMode: false,
  registrationsEnabled: true,
  autoApproveVerification: false,
  supportEmail: "support@taplyzer.com",
  platformName: "Taplyzer",
  maxMatchesPerUser: 20,
  meetingDurationMinutes: 40,
}

function Toggle({ value, onChange, label, description, danger }: {
  value: boolean; onChange: (v: boolean) => void
  label: string; description: string; danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
      <div>
        <p className={`text-sm font-black ${danger ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>{label}</p>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
          value
            ? danger ? "bg-red-500" : "bg-emerald-500"
            : "bg-slate-200 dark:bg-white/10"
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  )
}

function NumberInput({ label, description, value, onChange, min, max, unit }: {
  label: string; description: string; value: number
  onChange: (v: number) => void; min: number; max: number; unit?: string
}) {
  return (
    <div className="py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 px-3 py-1.5 text-sm font-bold text-right rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {unit && <span className="text-xs font-bold text-slate-400">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-3 accent-indigo-500"
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] font-bold text-slate-300">{min}</span>
        <span className="text-[9px] font-bold text-slate-300">{max}</span>
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const { user, isSuperAdmin } = useAuth()
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  async function fetchSettings() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (data.settings) setSettings({ ...DEFAULTS, ...data.settings })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSettings() }, [])

  async function handleSave() {
    if (!isSuperAdmin) {
      setError("Only Super Admins can change platform settings.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, adminId: user?._id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      if (data.settings) setSettings({ ...DEFAULTS, ...data.settings })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const update = (key: keyof PlatformSettings, val: any) =>
    setSettings(prev => ({ ...prev, [key]: val }))

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="System Settings"
        subtitle="Global platform configuration — Super Admin only."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reload
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isSuperAdmin}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-black rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Changes
            </button>
          </div>
        }
      />

      {/* Access Warning */}
      {!isSuperAdmin && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">View only — Super Admin required to save changes.</p>
        </div>
      )}

      {/* Success toast */}
      {saved && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Settings saved successfully!</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Match Algorithm */}
          <SectionCard title="Match Algorithm Tuning" subtitle="Scoring engine parameters">
            <div>
              <NumberInput
                label="Minimum Match Score"
                description="Matches below this score are filtered out of results"
                value={settings.matchMinScore}
                onChange={(v) => update("matchMinScore", v)}
                min={0} max={100} unit="%"
              />
              <NumberInput
                label="Max Matches Per User"
                description="Maximum number of matches shown in a user's feed"
                value={settings.maxMatchesPerUser}
                onChange={(v) => update("maxMatchesPerUser", v)}
                min={5} max={100} unit="matches"
              />
              <NumberInput
                label="Cache Duration"
                description="How long match scores are cached before recalculation"
                value={settings.cacheHours}
                onChange={(v) => update("cacheHours", v)}
                min={1} max={168} unit="hrs"
              />
            </div>
          </SectionCard>

          {/* Meeting Settings */}
          <SectionCard title="Meeting Configuration" subtitle="Whereby video room parameters">
            <div>
              <NumberInput
                label="Meeting Duration"
                description="Maximum duration of Whereby video rooms"
                value={settings.meetingDurationMinutes}
                onChange={(v) => update("meetingDurationMinutes", v)}
                min={15} max={120} unit="min"
              />
            </div>
          </SectionCard>

          {/* Platform Controls */}
          <SectionCard title="Platform Controls" subtitle="Critical toggles — use with care">
            <div>
              <Toggle
                label="New Registrations"
                description="Allow new users to sign up on the platform"
                value={settings.registrationsEnabled}
                onChange={(v) => update("registrationsEnabled", v)}
              />
              <Toggle
                label="Auto-Approve Verifications"
                description="Automatically verify businesses with high trust signals"
                value={settings.autoApproveVerification}
                onChange={(v) => update("autoApproveVerification", v)}
              />
              <Toggle
                label="Maintenance Mode"
                description="Block all non-admin logins. Enable during deployments."
                value={settings.maintenanceMode}
                onChange={(v) => update("maintenanceMode", v)}
                danger
              />
            </div>
          </SectionCard>

          {/* Branding */}
          <SectionCard title="Branding & Contact" subtitle="Platform identity settings">
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => update("platformName", e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => update("supportEmail", e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </SectionCard>

        </div>
      )}

      {/* Save footer */}
      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
        <button
          onClick={handleSave}
          disabled={saving || !isSuperAdmin}
          className="flex items-center gap-2 px-8 py-3 text-sm font-black rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Settings
        </button>
      </div>
    </div>
  )
}
