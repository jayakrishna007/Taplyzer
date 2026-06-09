"use client"

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
   Building2, Target, Search, CheckCircle2, ShieldCheck, MapPin,
   Calendar, Zap, Shield, Activity, XCircle, Rocket, FileText,
   Briefcase, Edit3, Lock, Plus, Mail, Smartphone,
   X, Check, Loader2, AlertCircle, Users
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { INDUSTRIES, INDUSTRY_SUGGESTIONS, DEFAULT_SUGGESTIONS } from "@/constants/industryData"

// INDUSTRY_SUGGESTIONS moved to constants/industryData.ts

// -------------------------------------------------------------
// SKELETON
// -------------------------------------------------------------
const ProfileSkeleton = () => (
   <div className="max-w-5xl mx-auto space-y-6 pb-32 px-4 md:px-8 pt-8 animate-pulse">
      <div className="h-48 w-full bg-slate-200 dark:bg-white/5 rounded-3xl"></div>
      <div className="h-32 w-full bg-slate-200 dark:bg-white/5 rounded-3xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="h-48 bg-slate-200 dark:bg-white/5 rounded-3xl"></div>
         <div className="h-48 bg-slate-200 dark:bg-white/5 rounded-3xl"></div>
      </div>
      <div className="h-48 w-full bg-slate-200 dark:bg-white/5 rounded-3xl"></div>
   </div>
)

export default function ProfilePage() {
   const { user } = useAuth()
   const router = useRouter()
   const [isInitializing, setIsInitializing] = useState(true)
   const [isSaving, setIsSaving] = useState(false)

   // Modals State
   const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
   const [isEditOfferingsOpen, setIsEditOfferingsOpen] = useState(false)
   const [isEditNeedsOpen, setIsEditNeedsOpen] = useState(false)
   const [isEditGoalOpen, setIsEditGoalOpen] = useState(false)


   const [profileData, setProfileData] = useState<any>({
      // Business Info
      companyName: "Acme Corp", industry: "Marketing", subIndustry: "Digital Agency", businessType: "Agency",
      location: "Bangalore, KA", city: "Bangalore", state: "KA", country: "India", website: "https://acme.io",
      yearsInBusiness: "5", teamSize: "6-20", tagline: "Data-driven marketing growth.", description: "We scale businesses.",
      memberSince: "2024",
      // Security/Contact (Private)
      email: "", phone: "",
      // Tags
      offerings: ["SEO", "Paid Ads"],
      needs: ["Clients"],
      offeringGoal: "",
      // Goal
      currentGoal: "Need 5 monthly clients in Bangalore this quarter.",
      goalType: "Need Clients", goalTimeline: "Within 1 month", goalPriority: "High", goalIndustry: "E-commerce", goalLocation: "Bangalore",
      // Trust Statuses
      mobileVerified: false, emailVerified: false, verificationStatus: "Not Started", // "Not Started" | "Under Review" | "Approved" | "Rejected"
   })

   useEffect(() => {
      async function fetchProfile() {
         if (!user?._id) return;

         try {
            const res = await fetch(`/api/business/${user._id}`);
            if (res.ok) {
               const data = await res.json();
               // Flatten nested structure back to flat state for UI
               setProfileData({
                  ...profileData,
                  companyName: data.companyName || "",
                  industry: data.industry || "",
                  subIndustry: data.subIndustry || "",
                  businessType: data.businessType || "",
                  city: data.location?.city || "",
                  state: data.location?.state || "",
                  country: data.location?.country || "India",
                  location: data.location?.city ? `${data.location.city}, ${data.location.state}` : "",
                  yearsInBusiness: data.strength?.yearsInBusiness?.toString() || "0",
                  teamSize: data.strength?.teamSize || "1-5",
                  offerings: data.offerings || [],
                  needs: data.needs || [],
                  offeringGoal: data.offeringGoal || "",
                  currentGoal: data.intent?.currentGoal || "",
                  goalPriority: data.intent?.priority || "Medium",
                  budget: data.intent?.budget || "",
                  goalTimeline: data.intent?.timeline || "",
                  website: data.trust?.website || "",
                  linkedin: data.trust?.linkedin || "",
                  verificationStatus: data.trust?.verificationStatus === "Business Verified" ? "Approved" : "Not Started",
                  memberSince: new Date(data.createdAt || Date.now()).getFullYear().toString()
               });
            }
         } catch (err) {
            console.error("Failed to fetch profile:", err);
         } finally {
            setIsInitializing(false);
         }
      }

      fetchProfile();
   }, [user?._id])

   const updateData = async (newData: any) => {
      if (!user?._id) return;

      const merged = { ...profileData, ...newData }
      setProfileData(merged)
      setIsSaving(true)

      try {
         const payload = {
            ownerId: user._id,
            companyName: merged.companyName,
            industry: merged.industry,
            subIndustry: merged.subIndustry,
            businessType: merged.businessType,
            location: {
               city: merged.city,
               state: merged.state,
               country: merged.country,
               operatesIn: merged.operatesIn || "National"
            },
            strength: {
               yearsInBusiness: parseInt(merged.yearsInBusiness) || 0,
               teamSize: merged.teamSize
            },
            offerings: merged.offerings,
            needs: merged.needs,
            offeringGoal: merged.offeringGoal,
            intent: {
               currentGoal: merged.currentGoal,
               priority: merged.goalPriority,
               budget: merged.budget,
               timeline: merged.goalTimeline
            },
            trust: {
               website: merged.website,
               linkedin: merged.linkedin,
               verificationStatus: merged.verificationStatus === "Approved" ? "Business Verified" : "Not Verified"
            },
            isProfileCompleted: true
         }

         await fetch("/api/business", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
         })
         toast.success("Profile synced with server")
      } catch (error) {
         console.error("Failed to save profile to DB:", error)
         toast.error("Failed to sync profile")
      } finally {
         setIsSaving(false)
      }
   }

   // Completion Logic
   const calculateCompletion = () => {
      const fields = [
         profileData.companyName, profileData.industry, profileData.location,
         profileData.offerings.length > 0, profileData.needs.length > 0, profileData.currentGoal,
         profileData.mobileVerified, profileData.emailVerified,
         profileData.verificationStatus === "Approved" || profileData.verificationStatus === "Under Review"
      ];
      const completed = fields.filter(Boolean).length;
      return Math.round((completed / fields.length) * 100);
   }

   const completionPct = calculateCompletion();
   const isProfileReady = completionPct > 70;

   if (isInitializing) return <ProfileSkeleton />

   return (
      <div className="max-w-5xl mx-auto space-y-8 pb-32 px-4 md:px-8 pt-8 animate-in fade-in duration-500">

         {/* TOP HERO CARD */}
         <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
               <div className="h-28 w-28 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="h-10 w-10 text-slate-400" />
               </div>
               <div className="flex-1 space-y-5 w-full">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                     <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                           {profileData.companyName}
                           {profileData.verificationStatus === "Approved" && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 px-2.5 py-1 font-bold rounded-lg uppercase tracking-widest text-[10px] flex items-center gap-1 shadow-sm"><CheckCircle2 className="h-3 w-3" /> Verified Business</Badge>
                           )}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-500 font-bold text-sm">
                           <span className="text-blue-600 dark:text-blue-400">{profileData.industry}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                           <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profileData.location}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                           <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Member Since {profileData.memberSince}</span>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <Button onClick={() => router.push("/profile/setup")} variant="outline" className="font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm"><Edit3 className="h-3 w-3 mr-2" /> Edit Profile</Button>
                        {profileData.verificationStatus !== "Approved" && profileData.verificationStatus !== "Under Review" && (
                           <Button onClick={() => router.push("/dashboard/verify")} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-black/10 dark:shadow-white/10"><ShieldCheck className="h-3 w-3 mr-2" /> Get Verified</Button>
                        )}
                     </div>
                  </div>

                  {/* Progress Bar Component */}
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 flex items-center gap-4">
                     <div className="font-black text-slate-900 dark:text-white shrink-0">Profile Completion: <span className="text-blue-600 dark:text-blue-400">{completionPct}%</span></div>
                     <div className="flex-1 bg-slate-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${completionPct}%` }}></div>
                     </div>
                     {completionPct < 100 && <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-blue-600 shrink-0 p-0 h-auto" onClick={() => router.push("/profile/setup")}>Complete Profile</Button>}
                  </div>
               </div>
            </div>
         </div>

         {/* SECTION 4: ACTIVE GOAL (MOST IMPORTANT) */}
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-950/40 dark:to-slate-900 rounded-[2rem] border border-slate-800 dark:border-white/5 p-8 md:p-10 shadow-xl relative overflow-hidden">
            <Target className="absolute -right-10 -bottom-10 h-64 w-64 text-blue-500 opacity-10 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
               <div className="max-w-3xl">
                  <h2 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2"><Target className="h-4 w-4" /> Current Business Goal</h2>
                  {profileData.currentGoal ? (
                     <>
                        <p className="text-2xl md:text-3xl font-black text-white leading-tight mb-6">{profileData.currentGoal}</p>
                        <div className="flex flex-wrap gap-3">
                           <Badge className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3 py-1.5 font-bold rounded-lg text-xs">{profileData.goalType}</Badge>
                           <Badge className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3 py-1.5 font-bold rounded-lg text-xs">{profileData.goalPriority} Priority</Badge>
                           <Badge className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3 py-1.5 font-bold rounded-lg text-xs">{profileData.goalTimeline}</Badge>
                           <Badge className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3 py-1.5 font-bold rounded-lg text-xs">{profileData.goalLocation}</Badge>
                           <Badge className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3 py-1.5 font-bold rounded-lg text-xs">{profileData.goalIndustry}</Badge>
                        </div>
                     </>
                  ) : <p className="text-xl font-bold text-slate-400">No active goal set. Add a goal to attract targeted matches.</p>}
               </div>
               <Button onClick={() => setIsEditGoalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shrink-0 border-none shadow-xl">Update Goal</Button>
            </div>
         </div>

         {/* SECTION 1: BUSINESS TRUST STATUS */}
         <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 md:p-10 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
               <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-500" /> Business Trust Status</h2>
               {profileData.verificationStatus !== "Approved" && <Button onClick={() => router.push("/dashboard/verify")} variant="outline" className="font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">Improve Profile Trust</Button>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-slate-50 dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col justify-between">
                  <div>
                     <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Mobile Verified</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Phone OTP</p>
                  </div>
                  <div className="mt-4">{profileData.mobileVerified ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <XCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />}</div>
               </div>
               <div className="bg-slate-50 dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col justify-between">
                  <div>
                     <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Email Verified</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Work Email</p>
                  </div>
                  <div className="mt-4">{profileData.emailVerified ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <XCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />}</div>
               </div>
               <div className={`p-5 rounded-2xl border flex flex-col justify-between ${profileData.verificationStatus === 'Approved' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30' : profileData.verificationStatus === 'Under Review' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-slate-50 border-slate-100 dark:bg-white/[0.02] dark:border-white/5'}`}>
                  <div>
                     <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Verification Status</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Manual Review</p>
                  </div>
                  <div className={`mt-4 font-black ${profileData.verificationStatus === 'Approved' ? 'text-emerald-600' : profileData.verificationStatus === 'Under Review' ? 'text-amber-500' : 'text-slate-400'}`}>{profileData.verificationStatus}</div>
               </div>
               <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isProfileReady ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30' : 'bg-slate-50 border-slate-100 dark:bg-white/[0.02] dark:border-white/5'}`}>
                  <div>
                     <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Profile Ready</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Basic details</p>
                  </div>
                  <div className="mt-4">{isProfileReady ? <CheckCircle2 className="h-6 w-6 text-blue-500" /> : <XCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />}</div>
               </div>
            </div>
         </div>

         {/* SECTIONS 2 & 3: WHAT WE OFFER / WHAT WE NEED */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2"><Briefcase className="h-5 w-5 text-slate-400" /> What We Offer</h2>
                  <Button onClick={() => setIsEditOfferingsOpen(true)} variant="outline" className="font-black uppercase tracking-widest text-[10px] h-8 px-4 rounded-lg border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">Edit Offerings</Button>
               </div>
               {profileData.offerings.length > 0 ? (
                  <div className="space-y-4">
                     <div className="flex flex-wrap gap-2">
                        {profileData.offerings.map((tag: string) => (
                           <Badge key={tag} className="bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-4 py-2 font-bold text-sm rounded-xl">{tag}</Badge>
                        ))}
                     </div>
                     {profileData.offeringGoal && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Offering Goal</p>
                           <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">"{profileData.offeringGoal}"</p>
                        </div>
                     )}
                  </div>
               ) : <p className="text-sm font-bold text-slate-400 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl p-6 text-center">No offerings added.</p>}
            </div>

            <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2"><Search className="h-5 w-5 text-slate-400" /> What We Need</h2>
                  <Button onClick={() => setIsEditNeedsOpen(true)} variant="outline" className="font-black uppercase tracking-widest text-[10px] h-8 px-4 rounded-lg border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">Edit Needs</Button>
               </div>
               {profileData.needs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                     {profileData.needs.map((tag: string) => (
                        <Badge key={tag} className="bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-4 py-2 font-bold text-sm rounded-xl">{tag}</Badge>
                     ))}
                  </div>
               ) : <p className="text-sm font-bold text-slate-400 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl p-6 text-center">No needs added.</p>}
            </div>
         </div>

         {/* ------------------------------------------------------------- */}
         {/* MODALS OVERLAYS */}
         {/* ------------------------------------------------------------- */}

         {/* TAG EDITOR MODAL (Reusable for Offerings/Needs) */}
         {(isEditOfferingsOpen || isEditNeedsOpen) && (
            <TagEditorModal
               type={isEditOfferingsOpen ? "offerings" : "needs"}
               industry={profileData.industry}
               currentTags={isEditOfferingsOpen ? profileData.offerings : profileData.needs}
               offeringGoal={isEditOfferingsOpen ? profileData.offeringGoal : ""}
               onClose={() => { setIsEditOfferingsOpen(false); setIsEditNeedsOpen(false) }}
               onSave={(tags: string[], offGoal?: string) => {
                  updateData(isEditOfferingsOpen ? { offerings: tags, offeringGoal: offGoal } : { needs: tags })
                  setIsEditOfferingsOpen(false); setIsEditNeedsOpen(false);
                  toast.success("Tags updated successfully")
               }}
            />
         )}

         {/* EDIT GOAL MODAL */}
         {isEditGoalOpen && (
            <EditGoalModal
               data={profileData}
               onClose={() => setIsEditGoalOpen(false)}
               onSave={(d: Record<string, unknown>) => { updateData(d); setIsEditGoalOpen(false); toast.success("Goal updated successfully") }}
            />
         )}



         {/* EDIT PROFILE MODAL (Strictly Business Info & Settings) */}
         {isEditProfileOpen && (
            <EditProfileModal
               data={profileData}
               onClose={() => setIsEditProfileOpen(false)}
               onSave={(d: Record<string, unknown>) => { updateData(d); setIsEditProfileOpen(false); toast.success("Profile saved") }}
            />
         )}
      </div>
   )
}


// -------------------------------------------------------------
// MODALS COMPONENTS
// -------------------------------------------------------------

interface TagEditorModalProps {
   type: "offerings" | "needs";
   industry: string;
   currentTags: string[];
   offeringGoal?: string;
   onClose: () => void;
   onSave: (tags: string[], offeringGoal?: string) => void;
}

function TagEditorModal({ type, industry, currentTags, offeringGoal = "", onClose, onSave }: TagEditorModalProps) {
   const [tags, setTags] = useState<string[]>(currentTags)
   const [input, setInput] = useState("")
   const [offGoal, setOffGoal] = useState(offeringGoal)

   const isOfferings = type === "offerings"
   const suggestions = INDUSTRY_SUGGESTIONS[industry]?.[type] || DEFAULT_SUGGESTIONS[type]

   const handleAdd = (val: string) => {
      const t = val.trim()
      if (t && !tags.includes(t)) setTags([...tags, t])
      setInput("")
   }

   const handleRemove = (tag: string) => setTags(tags.filter(t => t !== tag))

   const countWords = (str: string) => {
      return str.trim() === "" ? 0 : str.trim().split(/\s+/).length
   }

   return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
         <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] w-full max-w-lg border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
               <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {isOfferings ? <Briefcase className="h-5 w-5 text-slate-500" /> : <Search className="h-5 w-5 text-slate-500" />}
                  Edit {isOfferings ? "Offerings" : "Needs"}
               </h3>
               <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6 space-y-6">
               <div>
                  <div className="flex gap-2 mb-4">
                     <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd(input)} placeholder={`Add new tag...`} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" />
                     <Button onClick={() => handleAdd(input)} className="h-12 bg-slate-900 text-white dark:bg-white dark:text-black font-black px-6 rounded-xl">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {tags.map(t => (
                        <Badge key={t} className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/20 px-3 py-1.5 font-bold text-sm rounded-lg flex items-center gap-2">
                           {t} <X onClick={() => handleRemove(t)} className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100" />
                        </Badge>
                     ))}
                  </div>
               </div>

               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Industry Recommendations</p>
                  <div className="flex flex-wrap gap-2">
                     {suggestions.filter((s: string) => !tags.includes(s)).map((s: string) => (
                        <Badge key={s} onClick={() => handleAdd(s)} variant="outline" className="cursor-pointer border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-1.5 font-bold text-xs rounded-lg flex items-center gap-1">
                           <Plus className="h-3 w-3" /> {s}
                        </Badge>
                     ))}
                  </div>
               </div>

               {isOfferings && (
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Offering Goal (Max 60 words)</label>
                        <span className="text-[10px] font-bold text-slate-400">{countWords(offGoal)}/60 words</span>
                     </div>
                     <Textarea
                        value={offGoal}
                        onChange={e => {
                           if (countWords(e.target.value) <= 60 || e.target.value.length < offGoal.length) {
                              setOffGoal(e.target.value)
                           }
                        }}
                        placeholder="Define what you specifically hope to achieve with these offerings..."
                        className="min-h-[80px] bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl resize-none text-sm"
                     />
                  </div>
               )}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex justify-end">
               <Button onClick={() => onSave(tags, isOfferings ? offGoal : undefined)} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl w-full">Save Tags</Button>
            </div>
         </div>
      </div>
   )
}


function EditGoalModal({ data, onClose, onSave }: any) {
   const [goal, setGoal] = useState(data.currentGoal || "")
   const [type, setType] = useState(data.goalType || "Need Clients")
   const [industry, setIndustry] = useState(data.goalIndustry || "")
   const [location, setLocation] = useState(data.goalLocation || "")
   const [timeline, setTimeline] = useState(data.goalTimeline || "Within 1 month")
   const [priority, setPriority] = useState(data.goalPriority || "Medium")

   const suggestions = INDUSTRY_SUGGESTIONS[data.industry]?.goals || DEFAULT_SUGGESTIONS.goals

   return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
         <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] w-full max-w-xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
               <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Target className="h-5 w-5 text-blue-500" /> Update Active Goal</h3>
               <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Clear Live Statement</label>
                  <Textarea value={goal} onChange={e => setGoal(e.target.value)} className="min-h-[80px] bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl resize-none text-base" placeholder="e.g. Need 3 distributors in Bangalore this quarter." />
                  <div className="mt-3 flex flex-col gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suggestions:</span>
                     {suggestions.map((s: string) => (
                        <p key={s} onClick={() => setGoal(s)} className="text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">{s}</p>
                     ))}
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Goal Type</label>
                     <select value={type} onChange={e => setType(e.target.value)} className="w-full h-12 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none">
                        <option value="Need Clients">Need Clients</option><option value="Need Partners">Need Partners</option><option value="Need Vendors">Need Vendors</option><option value="Need Investors">Need Investors</option><option value="Need Distributors">Need Distributors</option><option value="Offer Services">Offer Services</option><option value="Hiring">Hiring</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Priority</label>
                     <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full h-12 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none">
                        <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Target Industry</label>
                     <Input value={industry} onChange={e => setIndustry(e.target.value)} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Target Location</label>
                     <Input value={location} onChange={e => setLocation(e.target.value)} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" />
                  </div>
                  <div className="col-span-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Timeline</label>
                     <Input value={timeline} onChange={e => setTimeline(e.target.value)} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" />
                  </div>
               </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex justify-end shrink-0">
               <Button onClick={() => onSave({ currentGoal: goal, goalType: type, goalPriority: priority, goalIndustry: industry, goalLocation: location, goalTimeline: timeline })} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl w-full">Save Goal</Button>
            </div>
         </div>
      </div>
   )
}


function EditProfileModal({ data, onClose, onSave }: any) {
   const [tab, setTab] = useState("Business Info")
   const [formData, setFormData] = useState(data)

   const TABS = ["Business Info", "Security", "Notifications", "Billing", "Privacy"]

   return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in">
         <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] w-full max-w-4xl h-[85vh] flex flex-col border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
               <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">Edit Profile Settings</h3>
               <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5" /></Button>
            </div>
            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
               <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-4 space-y-1 overflow-y-auto shrink-0">
                  {TABS.map(t => (
                     <button key={t} onClick={() => setTab(t)} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${tab === t ? 'bg-white dark:bg-[#111] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-white/10' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>{t}</button>
                  ))}
               </div>
               <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                  {tab === "Business Info" && (
                     <>
                        <h4 className="font-black text-slate-900 dark:text-white mb-6">Business Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Company Name</label><Input value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" /></div>
                           <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Industry</label>
                              <select
                                 value={formData.industry}
                                 onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                 className="w-full h-12 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none"
                              >
                                 <option value="" disabled>Select Industry</option>
                                 {INDUSTRIES.map(ind => (
                                    <option key={ind} value={ind}>{ind}</option>
                                 ))}
                              </select>
                           </div>
                           <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Sub Industry</label><Input value={formData.subIndustry} onChange={e => setFormData({ ...formData, subIndustry: e.target.value })} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" /></div>
                           <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Business Type</label>
                              <select value={formData.businessType} onChange={e => setFormData({ ...formData, businessType: e.target.value })} className="w-full h-12 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none">
                                 <option value="Startup">Startup</option><option value="Agency">Agency</option><option value="SME">SME</option><option value="Mid Cap">Mid Cap</option><option value="Enterprise">Enterprise</option><option value="Consultant">Consultant</option><option value="Manufacturer">Manufacturer</option><option value="Distributor">Distributor</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Team Size</label>
                              <select value={formData.teamSize} onChange={e => setFormData({ ...formData, teamSize: e.target.value })} className="w-full h-12 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none">
                                 <option value="1-5">1-5</option><option value="6-20">6-20</option><option value="21-50">21-50</option><option value="50-200">50-200</option><option value="200+">200+</option>
                              </select>
                           </div>
                           <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Years in Business</label><Input type="number" value={formData.yearsInBusiness} onChange={e => setFormData({ ...formData, yearsInBusiness: e.target.value })} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" /></div>
                           <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">City</label><Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" /></div>
                           <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">State</label><Input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" /></div>
                           <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Country</label><Input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" /></div>
                        </div>
                        <div className="mt-6">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Tagline</label>
                           <Input value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl" />
                        </div>
                        <div className="mt-6">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
                           <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="min-h-[100px] bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-bold rounded-xl resize-none" />
                        </div>
                     </>
                  )}
                  {(tab === "Security" || tab === "Privacy") && (
                     <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 flex gap-3">
                           <Lock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                           <div><p className="font-bold text-amber-900 dark:text-amber-500 text-sm">Security & Privacy V1</p><p className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-1">We NEVER show email or phone to other users. Communication goes through Taplyzer requests + video calls only, even after acceptance.</p></div>
                        </div>
                     </div>
                  )}
                  {(tab === "Notifications" || tab === "Billing") && (
                     <p className="text-slate-500 font-bold">Settings specific to {tab} go here.</p>
                  )}
               </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-white/[0.02]">
               <Button onClick={onClose} variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl">Cancel</Button>
               <Button onClick={() => onSave({ ...formData, location: `${formData.city}, ${formData.state}` })} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-lg">Save Changes</Button>
            </div>
         </div>
      </div>
   )
}



