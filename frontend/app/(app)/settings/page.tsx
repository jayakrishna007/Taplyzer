"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { User, Lock, Bell, LogOut, Shield, ChevronRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function SettingsPage() {
  const { logOut } = useAuth()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-white/40 font-medium">Manage your account preferences and security.</p>
      </div>

      <div className="grid gap-8">
        {/* Account Settings */}
        <Card className="p-8 bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
           <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <User className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h2>
           </div>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Profile Name</label>
                 <Input defaultValue="Acme Softworks Admin" className="h-12 bg-slate-50 dark:bg-white/5 border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                 <Input defaultValue="admin@acmesoft.io" disabled className="h-12 bg-slate-50 dark:bg-white/5 border-none rounded-xl font-bold opacity-50" />
              </div>
           </div>
           <Button className="mt-8 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8">Save Changes</Button>
        </Card>

        {/* Security */}
        <Card className="p-8 bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-[2rem]">
           <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                 <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Security & Password</h2>
           </div>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                 <div className="flex items-center gap-4">
                    <Shield className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                    <div>
                       <h4 className="font-black text-slate-900 dark:text-white text-sm">Two-Factor Authentication</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enhanced account security</p>
                    </div>
                 </div>
                 <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px] font-black tracking-[0.2em]">Enabled</Badge>
              </div>
              <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                 Change Password
              </Button>
           </div>
        </Card>

        {/* Notifications */}
        <Card className="p-8 bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-white/5 rounded-[2rem]">
           <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                 <Bell className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Notification Preferences</h2>
           </div>
           <div className="space-y-6">
              {[
                { title: "New Match Alerts", desc: "Get notified when a new high-score match is found." },
                { title: "Intro Requests", desc: "Receive alerts when someone wants to connect." },
                { title: "System Updates", desc: "Stay informed about platform improvements." }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{item.title}</h4>
                      <p className="text-xs font-medium text-slate-400">{item.desc}</p>
                   </div>
                   <Switch defaultChecked />
                </div>
              ))}
           </div>
        </Card>

        {/* Logout */}
        <Button 
          variant="ghost" 
          onClick={logOut}
          className="w-full h-16 rounded-[2rem] border-2 border-red-500/10 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500/5 hover:text-red-600 transition-all flex items-center justify-center gap-3"
        >
          <LogOut className="h-5 w-5" />
          Sign Out of Account
        </Button>
      </div>
    </div>
  )
}
