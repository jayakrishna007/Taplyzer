"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Zap, Mail, Lock, User, ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"

function AuthContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const rawMode = pathname.includes("/signup") 
    ? "signup" 
    : pathname.includes("/login") 
      ? "signin" 
      : (searchParams.get("mode") || "signin")
  const mode = rawMode === "login" ? "signin" : rawMode
  
  const [activeTab, setActiveTab] = useState(mode)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp, user, isLoading: authLoading, logOut } = useAuth()
  const router = useRouter()

  const [hasCheckedInitAuth, setHasCheckedInitAuth] = useState(false)
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false)

  useEffect(() => {
    if (!authLoading && !hasCheckedInitAuth) {
      if (user) {
        setIsAlreadyLoggedIn(true)
      }
      setHasCheckedInitAuth(true)
    }
  }, [authLoading, user, hasCheckedInitAuth])

  // Shared fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  // Sign up only
  const [name, setName] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    setError("")
    setIsLoading(true)
    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name) {
      setError("Please fill in all fields")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }
    setError("")
    setIsLoading(true)
    try {
      await signUp(email, name, password)
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = "pl-11 h-12 bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus-visible:ring-primary/20 font-medium"
  const labelCls = "text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.2em] ml-1"

  if (isAlreadyLoggedIn && user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-6 sm:p-8 transition-colors">
        {/* Back to Home */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-black text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Site
        </Link>

        <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Brand Logo */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(3,169,244,0.4)]">
              <Zap className="h-8 w-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Taplyzer</h1>
              <p className="text-sm font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mt-1">Intent-Based Networking</p>
            </div>
          </div>

          <Card className="border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0A0A0A] backdrop-blur-xl shadow-2xl rounded-[32px] overflow-hidden">
            <CardContent className="p-8 sm:p-10 space-y-6">
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Already Signed In</h2>
                <p className="text-sm text-slate-500 dark:text-white/40 font-medium leading-relaxed">
                  You are currently signed in to Taplyzer.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-black text-primary flex-shrink-0">
                  {user.name?.[0] || "U"}
                </div>
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="font-black text-sm text-slate-900 dark:text-white truncate">{user.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{user.email}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(3,169,244,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={async () => {
                    await logOut()
                    setIsAlreadyLoggedIn(false)
                  }}
                  className="w-full h-14 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white font-black rounded-2xl transition-all"
                >
                  Sign Out / Use Another Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-6 sm:p-8 transition-colors">
      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-black text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Site
      </Link>

      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(3,169,244,0.4)]">
            <Zap className="h-8 w-8 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Taplyzer</h1>
            <p className="text-sm font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mt-1">Intent-Based Networking</p>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0A0A0A] backdrop-blur-xl shadow-2xl rounded-[32px] overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(""); setShowPassword(false) }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 dark:bg-white/5 p-1 rounded-none h-14">
              <TabsTrigger
                value="signin"
                className="font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-primary rounded-none transition-all"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-primary rounded-none transition-all"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <CardContent className="p-8 sm:p-10">
              {/* ─── SIGN IN ─── */}
              <TabsContent value="signin" className="mt-0 space-y-6">
                <div className="space-y-2 text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
                  <p className="text-sm text-slate-500 dark:text-white/40 font-medium leading-relaxed">Enter your credentials to access your intent dashboard.</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className={labelCls}>Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        className={inputCls}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className={labelCls}>Password</label>
                      <button type="button" className="text-[10px] font-black text-primary hover:text-primary/80 uppercase tracking-widest transition-colors">Forgot?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`${inputCls} pr-11`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white/60 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>



                  {error && <p className="text-[11px] text-red-500 font-bold uppercase tracking-widest text-center animate-in fade-in zoom-in duration-300">{error}</p>}

                  <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(3,169,244,0.3)] transition-all flex items-center justify-center gap-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to Dashboard"}
                  </Button>
                </form>
              </TabsContent>

              {/* ─── SIGN UP ─── */}
              <TabsContent value="signup" className="mt-0 space-y-6">
                <div className="space-y-2 text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
                  <p className="text-sm text-slate-500 dark:text-white/40 font-medium leading-relaxed">Join the first network powered by real business intent.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className={labelCls}>Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="John Doe"
                        className={inputCls}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className={labelCls}>Work Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        className={inputCls}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className={labelCls}>Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className={`${inputCls} pr-11`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white/60 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>



                  {error && <p className="text-[11px] text-red-500 font-bold uppercase tracking-widest text-center animate-in fade-in zoom-in duration-300">{error}</p>}

                  <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(3,169,244,0.3)] transition-all flex items-center justify-center gap-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Free Account"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>

            <CardFooter className="bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 p-6 flex flex-col gap-4">
              <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold text-center uppercase tracking-widest leading-relaxed">
                By continuing, you agree to Taplyzer&apos;s <br />
                <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </CardFooter>
          </Tabs>
        </Card>

        {/* Switch tab helper */}
        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">
            {activeTab === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setActiveTab(activeTab === "signin" ? "signup" : "signin"); setError(""); setShowPassword(false) }}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {activeTab === "signin" ? "Sign Up Now" : "Sign In instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
