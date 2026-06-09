"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Zap, Loader2, CheckCircle2, XCircle, ChevronDown, 
  ChevronUp, BarChart3, History, Target, AlertCircle
} from "lucide-react"

export default function MatchTestingPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  
  const [matches, setMatches] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [evaluations, setEvaluations] = useState<Record<string, { isRelevant: boolean | null, problemTag: string, feedback: string }>>({})
  const [isSaving, setIsSaving] = useState(false)
  
  const [history, setHistory] = useState<any[]>([])

  const PROBLEM_TAGS = [
    "Keyword mismatch",
    "Intent unclear",
    "Same-side match (both offering)",
    "Too generic (AI, SaaS etc.)",
    "Wrong industry",
    "Location mismatch"
  ]

  // 1. Fetch Users & History on Mount
  useEffect(() => {
    fetchUsers()
    fetchHistory()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/match-testing/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      toast.error("Failed to load test users")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  async function fetchHistory() {
    try {
      const res = await fetch("/api/admin/match-testing/history")
      const data = await res.json()
      setHistory(data.history || [])
    } catch (err) {
      console.error(err)
    }
  }

  // 2. Generate Matches
  async function handleGenerateMatches() {
    if (!selectedUserId) return toast.error("Please select a user first")
    
    setIsGenerating(true)
    setMatches([])
    setEvaluations({})
    
    try {
      // Re-use production algorithm for real testing
      const res = await fetch(`/api/matches/${selectedUserId}`, { method: "POST" })
      const data = await res.json()
      
      if (data.matches) {
        setMatches(data.matches.slice(0, 10)) // Top 10 only as requested
        
        // Initialize evaluations state
        const initialEvals: any = {}
        data.matches.slice(0, 10).forEach((m: any) => {
          initialEvals[m.matchedUserId] = { isRelevant: null, problemTag: "", feedback: "" }
        })
        setEvaluations(initialEvals)
      } else {
        toast.error(data.msg || "No matches found")
      }
    } catch (err) {
      toast.error("Failed to generate matches")
    } finally {
      setIsGenerating(false)
    }
  }

  // 3. Save Evaluations
  async function handleSaveResults() {
    // Ensure all are evaluated
    const allEvaluated = matches.every(m => evaluations[m.matchedUserId].isRelevant !== null)
    if (!allEvaluated) {
      return toast.error("Please evaluate all 10 matches before saving")
    }

    setIsSaving(true)
    try {
      const resultsToSave = matches.map(m => ({
        matchedUserId: m.matchedUserId,
        score: m.score,
        isRelevant: evaluations[m.matchedUserId].isRelevant,
        problemTag: evaluations[m.matchedUserId].problemTag,
        feedback: evaluations[m.matchedUserId].feedback
      }))

      const res = await fetch("/api/admin/match-testing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testUserId: selectedUserId,
          results: resultsToSave
        })
      })

      if (res.ok) {
        toast.success("Test results saved successfully")
        setMatches([]) // Reset
        fetchHistory() // Refresh history
      } else {
        toast.error("Failed to save results")
      }
    } catch (err) {
      toast.error("Server error while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const updateEval = (id: string, field: string, value: any) => {
    setEvaluations(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }))
  }

  // Calculate stats for header
  const avgQuality = history.length > 0 
    ? history.reduce((acc, curr) => acc + curr.metrics.matchQualityPercentage, 0) / history.length
    : 0

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary fill-primary" />
            Match Testing Panel
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
            Systematic Algorithm Relevance Evaluation
          </p>
        </div>
        
        <div className="flex gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avg Match Quality</p>
                <p className="text-2xl font-black italic">{avgQuality.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                <History className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tests Conducted</p>
                <p className="text-2xl font-black italic">{history.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Test Setup & Results */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-white/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg italic font-black">1. Setup Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-bold">
                      <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select Test User"} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.name} ({u.business?.companyName || "No Company"}) - {u.business?.industry || ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleGenerateMatches}
                  disabled={isGenerating || !selectedUserId}
                  className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Matches"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation List */}
          {matches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg italic font-black">2. Evaluate Top 10 Matches</h3>
                <Badge variant="outline" className="font-black uppercase tracking-widest">
                  {matches.filter(m => evaluations[m.matchedUserId]?.isRelevant === true).length} / 10 Relevant
                </Badge>
              </div>
              
              <div className="space-y-4">
                {matches.map((match, index) => {
                  const evalState = evaluations[match.matchedUserId]
                  return (
                    <Card key={match.matchedUserId} className={`border ${evalState.isRelevant === true ? 'border-emerald-500/50 bg-emerald-500/5' : evalState.isRelevant === false ? 'border-red-500/50 bg-red-500/5' : 'border-slate-200 dark:border-white/10'}`}>
                      <CardContent className="p-5 flex flex-col md:flex-row gap-6">
                        
                        {/* Match Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-xl italic text-slate-400">
                              #{index + 1}
                            </div>
                            <div>
                              <h4 className="font-black text-lg italic tracking-tight">{match.companyName}</h4>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{match.industry}</p>
                            </div>
                            <div className="ml-auto text-right">
                              <span className="text-2xl font-black italic text-primary">{match.score}%</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-xs font-medium space-y-1">
                            <p><span className="font-bold">Goal:</span> {match.goal}</p>
                            <p><span className="font-bold">Match Reasons:</span> {match.reasons.join(" | ")}</p>
                          </div>
                        </div>

                        {/* Evaluation Controls */}
                        <div className="w-full md:w-64 space-y-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                          <div className="flex gap-2">
                            <Button 
                              variant={evalState.isRelevant === true ? "default" : "outline"}
                              className={`flex-1 h-10 ${evalState.isRelevant === true ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
                              onClick={() => {
                                updateEval(match.matchedUserId, "isRelevant", true)
                                updateEval(match.matchedUserId, "problemTag", "") // Clear tag if now relevant
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Yes
                            </Button>
                            <Button 
                              variant={evalState.isRelevant === false ? "destructive" : "outline"}
                              className="flex-1 h-10"
                              onClick={() => updateEval(match.matchedUserId, "isRelevant", false)}
                            >
                              <XCircle className="h-4 w-4 mr-1.5" /> No
                            </Button>
                          </div>

                          {evalState.isRelevant === false && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                              <Select value={evalState.problemTag} onValueChange={(v) => updateEval(match.matchedUserId, "problemTag", v)}>
                                <SelectTrigger className="h-9 text-[10px] font-bold">
                                  <SelectValue placeholder="Select Problem Tag" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROBLEM_TAGS.map(tag => (
                                    <SelectItem key={tag} value={tag} className="text-xs">{tag}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input 
                                placeholder="Additional reason (optional)" 
                                className="h-9 text-xs"
                                value={evalState.feedback}
                                onChange={(e) => updateEval(match.matchedUserId, "feedback", e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleSaveResults} 
                  disabled={isSaving}
                  className="h-14 px-10 rounded-xl font-black uppercase tracking-widest text-xs"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save Test Results"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-white/10 shadow-sm sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg italic font-black flex items-center gap-2">
                <History className="h-5 w-5 text-slate-500" />
                Recent Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No tests conducted yet.</p>
                ) : (
                  history.map((test: any) => (
                    <div key={test._id} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm truncate">{test.testUserId?.name || "Unknown User"}</span>
                        <Badge variant={test.metrics.matchQualityPercentage >= 70 ? "default" : "destructive"} className="font-black">
                          {Math.round(test.metrics.matchQualityPercentage)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>{new Date(test.timestamp).toLocaleDateString()}</span>
                        <span>{test.metrics.relevantCount}/{test.metrics.totalEvaluated} Rel</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
