"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Zap, ArrowLeft, ChevronRight, X, Phone, ShieldCheck, Check, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  INDUSTRIES, INDUSTRY_SUGGESTIONS, DEFAULT_SUGGESTIONS,
  BUSINESS_TYPES_BY_INDUSTRY, DEFAULT_BUSINESS_TYPES
} from "@/constants/industryData"

const STEPS = ["Identity", "Location", "Offerings", "Needs", "Goal"]

const CITIES_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Amaravati"],
  "Arunachal Pradesh": ["Itanagar"],
  "Assam": ["Dispur"],
  "Bihar": ["Patna"],
  "Chhattisgarh": ["Raipur"],
  "Goa": ["Panaji"],
  "Gujarat": ["Gandhinagar"],
  "Haryana": ["Chandigarh"],
  "Himachal Pradesh": ["Shimla"],
  "Jharkhand": ["Ranchi"],
  "Karnataka": ["Bengaluru"],
  "Kerala": ["Thiruvananthapuram"],
  "Madhya Pradesh": ["Bhopal"],
  "Maharashtra": ["Mumbai"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima"],
  "Odisha": ["Bhubaneswar"],
  "Punjab": ["Chandigarh"],
  "Rajasthan": ["Jaipur"],
  "Sikkim": ["Gangtok"],
  "Tamil Nadu": ["Chennai"],
  "Telangana": ["Hyderabad"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow"],
  "Uttarakhand": ["Dehradun"],
  "West Bengal": ["Kolkata"],
  "Andaman & Nicobar": ["Port Blair"],
  "Chandigarh": ["Chandigarh"],
  "Dadra & Nagar Haveli": ["Daman"],
  "Delhi": ["New Delhi"],
  "Jammu & Kashmir": ["Srinagar"],
  "Ladakh": ["Leh"],
  "Lakshadweep": ["Kavaratti"],
  "Puducherry": ["Puducherry"]
}

type FormData = {
  companyPhone: string; role: string
  companyName: string; industry: string; customIndustry: string
  businessType: string; customBusinessType: string; teamSize: string
  country: string; state: string; city: string; pincode: string; address: string
  offerings: string[]; needs: string[]
  offeringGoal: string
  goal: string; budget: string; timeline: string
}

const DEFAULT_FORM: FormData = {
  companyPhone: "", role: "",
  companyName: "", industry: "", customIndustry: "",
  businessType: "", customBusinessType: "", teamSize: "1-5",
  country: "India", state: "", city: "", pincode: "", address: "",
  offerings: [], needs: [],
  offeringGoal: "",
  goal: "", budget: "", timeline: ""
}

const inputCls = "h-12 sm:h-14 bg-slate-50 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl font-bold"
const labelCls = "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
const selectCls = "w-full h-12 sm:h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl font-bold px-4 text-sm text-slate-900 dark:text-white outline-none cursor-pointer"

const FIELD_INFOS: Record<string, { title: string; desc: string; tip: string }> = {
  companyName: {
    title: "Company Name",
    desc: "The registered name of your business or the brand name you operate under.",
    tip: "e.g., 'Acme Softworks' or 'Zenith Marketing'."
  },
  role: {
    title: "Your Role / Designation",
    desc: "Your official role or position in the company that represents your authority.",
    tip: "e.g., 'CEO', 'Founder', 'Director of Sales'."
  },
  companyPhone: {
    title: "Company Mobile Number",
    desc: "The primary phone number for your business operations. Used for verification.",
    tip: "Do not include country code (+91). Enter 10 digits."
  },
  industry: {
    title: "Industry",
    desc: "The sector in which your business operates. This helps filter relevant matches.",
    tip: "If your sector isn't listed, choose 'Other' and specify."
  },
  businessType: {
    title: "Business Type",
    desc: "The specific operational category of your business.",
    tip: "e.g., 'Agency' if you provide services, 'Manufacturer' if you make physical goods."
  },
  teamSize: {
    title: "Team Size",
    desc: "The size of your workforce. Helps match with partners of appropriate scale.",
    tip: "Choose the range representing full-time employees."
  },
  country: {
    title: "Country",
    desc: "The country where your business headquarter or primary office is located.",
    tip: "e.g., 'India', 'United States'."
  },
  state: {
    title: "State",
    desc: "The state, province, or territory of your headquarters.",
    tip: "e.g., 'Maharashtra', 'Karnataka', 'California'."
  },
  city: {
    title: "City",
    desc: "The city where your business operations are based.",
    tip: "Crucial for local/hyperlocal matching and proximity scores."
  },
  pincode: {
    title: "Pincode / ZIP",
    desc: "The postal code of your company's physical address.",
    tip: "Used for precise location computations."
  },
  address: {
    title: "Company Address",
    desc: "The physical office address, suite, or building name of your business.",
    tip: "Ensures legitimacy during manual verification reviews."
  },
  offerings: {
    title: "Offerings",
    desc: "Keywords representing products, services, or skills your business provides.",
    tip: "Use suggestions or add custom tags like 'SEO', 'Mobile App Development'."
  },
  offeringGoal: {
    title: "Offering Goal",
    desc: "A brief pitch (max 60 words) describing your primary services and value proposition.",
    tip: "Be concise. Visible directly in matching cards in place of strategic goals."
  },
  needs: {
    title: "Market Needs",
    desc: "Keywords representing services, resources, or partners you are looking for.",
    tip: "This is matched against other businesses' offerings."
  },
  goal: {
    title: "Strategic Goal",
    desc: "Your primary business objective or deal you want to close right now.",
    tip: "e.g., 'Looking for a B2B sales partner in Mumbai this quarter'."
  },
  budget: {
    title: "Minimum Budget",
    desc: "The minimum financial scale of the target deal/partnership.",
    tip: "e.g., '₹5L - ₹25L' or 'No Budget Constraint'."
  },
  timeline: {
    title: "Required By",
    desc: "The timeframe within which you expect to achieve this strategic goal.",
    tip: "Select the closest deadline for starting/completing the project."
  }
}

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM)
  const [tagInput, setTagInput] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)
  const [showVerifyPopup, setShowVerifyPopup] = useState(false)
  const [activeHelp, setActiveHelp] = useState<string | null>(null)

  const set = (key: keyof FormData, value: any) =>
    setFormData(prev => ({ ...prev, [key]: value }))

  useEffect(() => {
    async function fetchProfile() {
      if (!user?._id) return
      try {
        const res = await fetch(`/api/business/${user._id}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.companyName) {
            setFormData({
              companyPhone: data.companyPhone || "",
              role: data.ownerDesignation || "",
              companyName: data.companyName || "",
              industry: data.industry || "", customIndustry: "",
              businessType: data.businessType || "", customBusinessType: "",
              teamSize: data.strength?.teamSize || "1-5",
              country: data.location?.country || "India",
              state: data.location?.state || "", city: data.location?.city || "",
              pincode: data.location?.pincode || "", address: data.location?.address || "",
              offerings: data.offerings || [], needs: data.needs || [],
              offeringGoal: data.offeringGoal || "",
              goal: data.intent?.currentGoal || "",
              budget: data.intent?.budget || "", timeline: data.intent?.timeline || ""
            })
          }
        }
      } catch (err) { console.error(err) }
      finally { setIsInitializing(false) }
    }
    fetchProfile()
  }, [user?._id])

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-400 font-bold text-sm">Loading profile...</p></div>
  }

  const buildPayload = () => ({
    ownerId: user?._id, ownerName: user?.name,
    ownerDesignation: formData.role,
    companyPhone: formData.companyPhone,
    companyName: formData.companyName,
    industry: formData.industry === "Other" ? formData.customIndustry : formData.industry,
    businessType: formData.businessType === "Other" ? formData.customBusinessType : formData.businessType,
    location: { country: formData.country, state: formData.state, city: formData.city, pincode: formData.pincode, address: formData.address, operatesIn: "National" },
    strength: { teamSize: formData.teamSize },
    offerings: formData.offerings, needs: formData.needs,
    offeringGoal: formData.offeringGoal,
    intent: { currentGoal: formData.goal, budget: formData.budget, timeline: formData.timeline },
    isProfileCompleted: false
  })

  const handleSaveAndNext = async () => {
    if (!user?._id) return
    setIsSaving(true)
    try {
      await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentStep === STEPS.length ? { ...buildPayload(), isProfileCompleted: true } : buildPayload())
      })
      if (currentStep === STEPS.length) {
        localStorage.setItem("taplyzer_setup_complete", "true")
        setShowVerifyPopup(true)
      } else {
        setCurrentStep(p => p + 1)
      }
    } catch (err) { console.error(err) }
    finally { setIsSaving(false) }
  }

  const addTag = (type: "offerings" | "needs") => {
    if (tagInput.trim() && !formData[type].includes(tagInput.trim())) {
      set(type, [...formData[type], tagInput.trim()])
      setTagInput("")
    }
  }
  const removeTag = (type: "offerings" | "needs", tag: string) =>
    set(type, formData[type].filter(t => t !== tag))
  const toggleTag = (type: "offerings" | "needs", tag: string) => {
    if (formData[type].includes(tag)) removeTag(type, tag)
    else set(type, [...formData[type], tag])
  }
  const countWords = (str: string) => str.trim().split(/\s+/).filter(w => w.length > 0).length

  const businessTypeOptions = formData.industry && formData.industry !== "Other"
    ? [...(BUSINESS_TYPES_BY_INDUSTRY[formData.industry] || DEFAULT_BUSINESS_TYPES), "Other"]
    : [...DEFAULT_BUSINESS_TYPES, "Other"]

  const generateDynamicGoals = () => {
    const suggestions: string[] = []
    if (formData.needs.length > 0 && formData.city) suggestions.push(`Seeking ${formData.needs[0]} partners in ${formData.city}.`)
    if (formData.offerings.length > 0) suggestions.push(`Looking to provide ${formData.offerings[0]} services.`)
    if (formData.industry) suggestions.push(`Expanding our ${formData.industry} business network.`)
    const base = INDUSTRY_SUGGESTIONS[formData.industry]?.goals || DEFAULT_SUGGESTIONS.goals
    return Array.from(new Set([...suggestions, ...base])).slice(0, 3)
  }

  const renderHelpIcon = (field: string) => (
    <button
      type="button"
      onClick={() => setActiveHelp(activeHelp === field ? null : field)}
      className={`p-1 rounded-full transition-all shrink-0 ${
        activeHelp === field 
          ? "text-primary bg-primary/10" 
          : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
      }`}
    >
      <HelpCircle className="h-3.5 w-3.5" />
    </button>
  )

  const renderHelpText = (field: string) => {
    const info = FIELD_INFOS[field]
    if (!info || activeHelp !== field) return null
    return (
      <div className="p-4 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl text-xs text-blue-900 dark:text-blue-300 font-bold space-y-1 mt-1.5 mb-2 animate-in slide-in-from-top-2 duration-300">
        <p className="font-extrabold uppercase tracking-wider text-[9px] text-blue-600 dark:text-blue-400">💡 {info.title} Guidance</p>
        <p className="font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{info.desc}</p>
        <p className="text-[10px] font-medium italic text-slate-500 mt-1">{info.tip}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-2 sm:p-4 md:p-8">

      {/* Verification Popup */}
      {showVerifyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Chrome-style close button — top-right, always visible */}
            <button
              onClick={() => {
                sessionStorage.setItem("taplyzer_verify_popup_dismissed", "true");
                router.push("/dashboard");
              }}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors shadow"
            >
              <X className="h-3.5 w-3.5 text-red-500" />
            </button>

            <div className="p-10 pt-14 text-center space-y-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Get Verified for Free</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Verified business profiles get <span className="font-black text-emerald-500">80% more deals</span> than unverified ones.
                  Stand out and attract serious business partners instantly.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {["80% More Deals", "Verified Badge", "Intent Matched"].map(s => (
                  <div key={s} className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                    <Check className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{s}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => {
                    sessionStorage.setItem("taplyzer_verify_popup_dismissed", "true");
                    router.push("/dashboard/verify");
                  }}
                  className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  Verify My Business Profile — Free <ShieldCheck className="h-4 w-4 ml-2" />
                </Button>
                <button
                  onClick={() => {
                    sessionStorage.setItem("taplyzer_verify_popup_dismissed", "true");
                    router.push("/dashboard");
                  }}
                  className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                >
                  Skip for now, go to Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">

        {/* Progress */}
        <div className="p-4 sm:p-8 pb-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Step {currentStep} of {STEPS.length}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{STEPS[currentStep - 1]}</span>
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-1.5 bg-slate-100 dark:bg-white/5" />
        </div>

        <div className="p-4 sm:p-8 md:p-12 flex-grow overflow-y-auto max-h-[calc(100dvh-180px)] sm:max-h-[65vh]">

          {/* STEP 1: Company Identity */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-2">Company Identity</h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium">Tell us about you and the business you represent.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className={labelCls}>Company Name</label>
                    {renderHelpIcon("companyName")}
                  </div>
                  {renderHelpText("companyName")}
                  <Input value={formData.companyName} onChange={e => set("companyName", e.target.value)} placeholder="Acme Softworks" className={inputCls} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className={labelCls}>Your Role / Designation</label>
                    {renderHelpIcon("role")}
                  </div>
                  {renderHelpText("role")}
                  <Input value={formData.role} onChange={e => set("role", e.target.value)} placeholder="CEO / Founder / Director" className={inputCls} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className={labelCls}>Company Mobile Number</label>
                    {renderHelpIcon("companyPhone")}
                  </div>
                  {renderHelpText("companyPhone")}
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel" maxLength={10}
                      value={formData.companyPhone}
                      onChange={e => set("companyPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9876543210"
                      className={`${inputCls} pl-11`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className={labelCls}>Industry</label>
                      {renderHelpIcon("industry")}
                    </div>
                    {renderHelpText("industry")}
                    <select value={formData.industry} onChange={e => { set("industry", e.target.value); set("businessType", ""); set("customIndustry", "") }} className={selectCls}>
                      <option value="" disabled className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">Select Industry</option>
                      {INDUSTRIES.map(ind => <option key={ind} value={ind} className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">{ind}</option>)}
                      <option value="Other" className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">Other (specify below)</option>
                    </select>
                    {formData.industry === "Other" && (
                      <Input value={formData.customIndustry} onChange={e => set("customIndustry", e.target.value)} placeholder="Type your industry" className={`${inputCls} mt-2`} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className={labelCls}>Business Type</label>
                      {renderHelpIcon("businessType")}
                    </div>
                    {renderHelpText("businessType")}
                    <select value={formData.businessType} onChange={e => { set("businessType", e.target.value); set("customBusinessType", "") }} className={selectCls} disabled={!formData.industry}>
                      <option value="" disabled className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">{formData.industry ? "Select Type" : "Select Industry first"}</option>
                      {businessTypeOptions.map(t => <option key={t} value={t} className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">{t}</option>)}
                    </select>
                    {formData.businessType === "Other" && (
                      <Input value={formData.customBusinessType} onChange={e => set("customBusinessType", e.target.value)} placeholder="Type your business type" className={`${inputCls} mt-2`} />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className={labelCls}>Team Size</label>
                    {renderHelpIcon("teamSize")}
                  </div>
                  {renderHelpText("teamSize")}
                  <div className="flex flex-wrap gap-2">
                    {["1-5", "6-20", "21-50", "51-200", "201+"].map(size => (
                      <button key={size} onClick={() => set("teamSize", size)}
                        className={`px-3.5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.teamSize === size ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 dark:bg-white/5 text-slate-500"}`}
                      >{size}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-2">Global Presence</h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium">Where is your business headquartered?</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className={labelCls}>Country</label>
                    {renderHelpIcon("country")}
                  </div>
                  {renderHelpText("country")}
                  <Input value={formData.country} onChange={e => set("country", e.target.value)} className={inputCls} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className={labelCls}>State</label>
                      {renderHelpIcon("state")}
                    </div>
                    {renderHelpText("state")}
                    <select
                      value={formData.state || ""}
                      onChange={e => {
                        const selectedState = e.target.value
                        set("state", selectedState)
                        const defaultCity = CITIES_BY_STATE[selectedState]?.[0] || ""
                        set("city", defaultCity)
                      }}
                      className={`${selectCls} ${
                        formData.state ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/30"
                      }`}
                    >
                      <option value="" disabled className="bg-white dark:bg-[#0a0a0a] text-slate-400 dark:text-white/30">
                        Select State
                      </option>
                      {formData.state && !Object.keys(CITIES_BY_STATE).includes(formData.state) && (
                        <option value={formData.state} className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">
                          {formData.state} (Custom)
                        </option>
                      )}
                      {Object.keys(CITIES_BY_STATE).map(stateName => (
                        <option
                          key={stateName}
                          value={stateName}
                          className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white"
                        >
                          {stateName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className={labelCls}>City</label>
                      {renderHelpIcon("city")}
                    </div>
                    {renderHelpText("city")}
                    <select
                      value={formData.city || ""}
                      onChange={e => set("city", e.target.value)}
                      className={`${selectCls} ${
                        formData.city ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/30"
                      }`}
                      disabled={!formData.state}
                    >
                      <option value="" disabled className="bg-white dark:bg-[#0a0a0a] text-slate-400 dark:text-white/30">
                        {formData.state ? "Select City" : "Select State First"}
                      </option>
                      {formData.city && (!formData.state || !CITIES_BY_STATE[formData.state]?.includes(formData.city)) && (
                        <option value={formData.city} className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">
                          {formData.city} (Custom)
                        </option>
                      )}
                      {formData.state && CITIES_BY_STATE[formData.state]?.map(cityName => (
                        <option
                          key={cityName}
                          value={cityName}
                          className="bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white"
                        >
                          {cityName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-1">
                    <div className="flex items-center gap-1.5">
                      <label className={labelCls}>Pincode</label>
                      {renderHelpIcon("pincode")}
                    </div>
                    {renderHelpText("pincode")}
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={e => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="400001"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center gap-1.5">
                      <label className={labelCls}>Company Address</label>
                      {renderHelpIcon("address")}
                    </div>
                    {renderHelpText("address")}
                    <Input value={formData.address} onChange={e => set("address", e.target.value)} placeholder="Office 402, Business Park" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Offerings */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-2">Your Offerings</h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium">What products or services do you provide?</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className={labelCls}>Add Offerings</label>
                    {renderHelpIcon("offerings")}
                  </div>
                  {renderHelpText("offerings")}
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag("offerings")} placeholder="e.g. Cloud Security, AI Development" className={inputCls} />
                    <Button onClick={() => addTag("offerings")} className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px]">Add</Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.offerings.map(tag => (
                    <Badge key={tag} onClick={() => removeTag("offerings", tag)} className="cursor-pointer bg-primary/10 text-primary border-none px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-primary/20 transition-colors">
                      {tag} <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Suggestions for {formData.industry || "your industry"}:</p>
                  <div className="flex flex-wrap gap-2">
                    {(INDUSTRY_SUGGESTIONS[formData.industry]?.offerings || DEFAULT_SUGGESTIONS.offerings).map(s => {
                      const isSelected = formData.offerings.includes(s)
                      return (
                        <Badge key={s} onClick={() => toggleTag("offerings", s)} variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all ${isSelected ? "bg-primary text-white border-primary shadow-sm shadow-primary/20" : "border-slate-200 dark:border-white/10 text-slate-500 hover:bg-primary/5 hover:text-primary"}`}>
                          {isSelected ? "✓" : "+"} {s}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {/* Offering Goal Text Field */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <label className={labelCls}>Offering Goal (Max 60 words)</label>
                    {renderHelpIcon("offeringGoal")}
                  </div>
                  {renderHelpText("offeringGoal")}
                  <Textarea
                    value={formData.offeringGoal}
                    onChange={e => {
                      if (countWords(e.target.value) <= 60 || e.target.value.length < formData.offeringGoal.length) set("offeringGoal", e.target.value)
                    }}
                    placeholder="Describe your offerings and value proposition in less than 60 words..."
                    className="min-h-[100px] bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold text-base p-4 resize-none"
                  />
                  <div className="flex justify-between items-center px-1 mt-1">
                    <span className="text-[10px] font-bold text-slate-400">{countWords(formData.offeringGoal)}/60 words</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: Needs */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-2">Market Needs</h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium">What are you currently looking for from partners?</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className={labelCls}>Add Needs</label>
                    {renderHelpIcon("needs")}
                  </div>
                  {renderHelpText("needs")}
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag("needs")} placeholder="e.g. Marketing Agency, Supply Chain Partner" className={inputCls} />
                    <Button onClick={() => addTag("needs")} className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px]">Add</Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.needs.map(tag => (
                    <Badge key={tag} onClick={() => removeTag("needs", tag)} className="cursor-pointer bg-emerald-500/10 text-emerald-600 border-none px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-500/20 transition-colors">
                      {tag} <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Suggestions for {formData.industry || "your industry"}:</p>
                  <div className="flex flex-wrap gap-2">
                    {(INDUSTRY_SUGGESTIONS[formData.industry]?.needs || DEFAULT_SUGGESTIONS.needs).map(s => {
                      const isSelected = formData.needs.includes(s)
                      return (
                        <Badge key={s} onClick={() => toggleTag("needs", s)} variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all ${isSelected ? "bg-emerald-50 text-white border-emerald-500 shadow-sm shadow-emerald-500/20" : "border-slate-200 dark:border-white/10 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"}`}>
                          {isSelected ? "✓" : "+"} {s}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Strategic Goal */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-2">Business Intent</h2>
                <p className="text-sm sm:text-base text-slate-500 font-medium">What is the primary deal or partnership you are actively pursuing?</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className={labelCls}>Strategic Goal (Max 60 words)</label>
                    {renderHelpIcon("goal")}
                  </div>
                  {renderHelpText("goal")}
                  <Textarea
                    value={formData.goal}
                    onChange={e => {
                      if (countWords(e.target.value) <= 60 || e.target.value.length < formData.goal.length) set("goal", e.target.value)
                    }}
                    placeholder="e.g. I am looking for a long-term logistics partner..."
                    className="min-h-[120px] bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold text-lg p-6 resize-none"
                  />
                  <div className="flex justify-between items-center px-1 mt-1">
                    <span className="text-[10px] font-bold text-slate-400">{countWords(formData.goal)}/60 words</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suggestions:</p>
                  {generateDynamicGoals().map(s => (
                    <div key={s} onClick={() => set("goal", s)}
                      className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/20 transition-all">
                      {s}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className={labelCls}>Minimum Budget</label>
                      {renderHelpIcon("budget")}
                    </div>
                    {renderHelpText("budget")}
                    <Input value={formData.budget} onChange={e => set("budget", e.target.value)} placeholder="₹5L – ₹25L" className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className={labelCls}>Required By</label>
                      {renderHelpIcon("timeline")}
                    </div>
                    {renderHelpText("timeline")}
                    <select value={formData.timeline} onChange={e => set("timeline", e.target.value)} className={selectCls}>
                      <option value="" disabled className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">Select deadline</option>
                      <option value="Less than 7 Days" className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">Less than 7 Days</option>
                      <option value="Within 14 Days" className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">Within 14 Days</option>
                      <option value="Within 30 Days" className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">Within 30 Days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setCurrentStep(p => Math.max(p - 1, 1))} disabled={currentStep === 1}
            className="h-10 sm:h-12 px-4 sm:px-5 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-900 disabled:opacity-0">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={handleSaveAndNext} disabled={isSaving}
            className="h-12 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
            {isSaving ? "Saving..." : currentStep === STEPS.length ? "Complete Profile" : "Save & Next"} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
