"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  ShieldCheck, Check, ArrowLeft, Globe, Linkedin,
  FileText, Loader2, BadgeCheck, Lock, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const inputCls = "h-14 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold"
const labelCls = "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
const selectCls = "w-full h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold px-4 text-sm text-slate-900 dark:text-white outline-none cursor-pointer"

const REG_TYPES = [
  { label: "GSTIN (GST Identification Number)", value: "GSTIN", chars: 15, placeholder: "e.g. 27AAPFU0939F1ZV" },
  { label: "CIN (Company Identification Number)", value: "CIN", chars: 21, placeholder: "e.g. U72900MH2010PTC123456" },
  { label: "MSME / Udyam Registration Number", value: "MSME", chars: 19, placeholder: "e.g. UDYAM-MH-00-0012345" },
]

export default function VerifyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const [regType, setRegType] = useState("")
  const [regNumber, setRegNumber] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")

  const selectedReg = REG_TYPES.find(r => r.value === regType)

  const isFormValid = regType && regNumber.length === (selectedReg?.chars ?? 0) && website.trim()

  const handleSubmit = async () => {
    if (!user?._id) return
    if (!isFormValid) {
      setError("Please fill in all required fields correctly.")
      return
    }
    setError("")
    setIsSaving(true)
    try {
      await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: user._id,
          trust: {
            gst: regNumber,
            website,
            linkedin,
            verificationStatus: "Under Review"
          }
        })
      })
      setSaved(true)
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (err) {
      console.error(err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="text-center space-y-4 animate-in zoom-in-95 duration-500">
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <BadgeCheck className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Verification Submitted!</h2>
          <p className="text-slate-500 font-medium">Our team will review your profile within 24 hours.</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Redirecting to dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">

        {/* Back */}
        <Link href="/dashboard"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Hero card */}
        <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0 h-24 w-24 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-3">
              <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                Get Verified for Free
              </h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Verified business profiles get{" "}
                <span className="font-black text-emerald-500">80% more deals</span>{" "}
                than unverified ones. Stand out and attract serious business partners instantly.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-slate-100 dark:border-white/5 divide-x divide-slate-100 dark:divide-white/5">
            {[
              { label: "More Deals", value: "80%", color: "text-emerald-500" },
              { label: "Verified Badge", value: "✓", color: "text-primary" },
              { label: "Intent Matched", value: "AI", color: "text-violet-500" },
            ].map(s => (
              <div key={s.label} className="py-6 text-center">
                <span className={`block text-2xl font-black ${s.color}`}>{s.value}</span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl p-8 md:p-12 space-y-8">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white mb-1">Submit Verification Details</h2>
            <p className="text-slate-500 font-medium text-sm">All fields marked as required must be filled. LinkedIn is optional.</p>
          </div>

          <div className="space-y-6">

            {/* Registration Type dropdown + number */}
            <div className="space-y-3">
              <label className={labelCls}>Business Registration Type <span className="text-red-400">*</span></label>
              <select
                value={regType}
                onChange={e => { setRegType(e.target.value); setRegNumber("") }}
                className={selectCls}
              >
                <option value="" disabled>Select registration type</option>
                {REG_TYPES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>

              {/* Number input — only shows after type is selected */}
              {regType && selectedReg && (
                <div className="space-y-1">
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={regNumber}
                      onChange={e => setRegNumber(e.target.value.toUpperCase().slice(0, selectedReg.chars))}
                      placeholder={selectedReg.placeholder}
                      maxLength={selectedReg.chars}
                      className={`${inputCls} pl-11 uppercase tracking-widest`}
                    />
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-bold text-slate-400">
                      Must be exactly {selectedReg.chars} characters
                    </p>
                    <span className={`text-[10px] font-black ${regNumber.length === selectedReg.chars ? "text-emerald-500" : "text-slate-400"}`}>
                      {regNumber.length}/{selectedReg.chars}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Website — Required */}
            <div className="space-y-2">
              <label className={labelCls}>Company Website <span className="text-red-400">*</span></label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className={`${inputCls} pl-11`}
                />
              </div>
            </div>

            {/* LinkedIn — Optional */}
            <div className="space-y-2">
              <label className={labelCls}>LinkedIn Company Page <span className="text-slate-300 dark:text-white/20 font-medium normal-case tracking-normal text-[10px]">(Optional)</span></label>
              <div className="relative">
                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/company/yourcompany"
                  className={`${inputCls} pl-11`}
                />
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="p-5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/10 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">What happens next</p>
            {[
              "Our team reviews your submitted details within 24 hours",
              "Your profile gets the Verified badge visible to all matches",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{step}</p>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Your information is encrypted and never shared with third parties.
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isSaving || !isFormValid}
              className="h-14 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                : <><ShieldCheck className="h-4 w-4" /> Submit for Verification</>}
            </Button>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              Skip for now →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
